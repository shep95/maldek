import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@supabase/auth-helpers-react";
import { FileInputSection } from "./FileInputSection";
import { UploadProgress } from "./UploadProgress";

interface VideoUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VideoUploadDialog = ({
  isOpen,
  onOpenChange,
}: VideoUploadDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const queryClient = useQueryClient();
  const session = useSession();

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Selected video file:', { name: file.name, size: file.size, type: file.type });
    
    if (!file.type.startsWith('video/')) {
      toast.error("Please select a valid video file");
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      toast.error("Video file size must be less than 100MB");
      return;
    }

    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    
    videoElement.onloadedmetadata = () => {
      const duration = Math.round(videoElement.duration);
      console.log('Video duration:', duration);
      
      if (duration < 1) {
        toast.error("Video must be at least 1 second long");
        URL.revokeObjectURL(videoElement.src);
        return;
      }

      setVideoFile(file);
      toast.success("Video selected successfully");
    };
    
    videoElement.onerror = () => {
      console.error('Error loading video metadata');
      toast.error("Error validating video file");
      URL.revokeObjectURL(videoElement.src);
    };
    
    videoElement.src = URL.createObjectURL(file);
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Selected thumbnail file:', { name: file.name, size: file.size, type: file.type });
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file for the thumbnail");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("Thumbnail file size must be less than 5MB");
      return;
    }

    setThumbnailFile(file);
    toast.success("Thumbnail selected successfully");
  };

  const handleUpload = async () => {
    if (!session?.user?.id) {
      console.error('No user session found');
      toast.error("Please sign in to upload videos");
      return;
    }

    if (!videoFile || !thumbnailFile || !title.trim() || !description.trim()) {
      toast.error("Please fill in all fields and select both video and thumbnail");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    console.log('Starting video upload process...');

    try {
      // Upload video with progress tracking
      const videoPath = `${session.user.id}/${Date.now()}_${videoFile.name}`;
      console.log('Uploading video to path:', videoPath);

      const videoChunkSize = 1024 * 1024; // 1MB chunks
      const totalChunks = Math.ceil(videoFile.size / videoChunkSize);
      let uploadedChunks = 0;

      for (let start = 0; start < videoFile.size; start += videoChunkSize) {
        const chunk = videoFile.slice(start, start + videoChunkSize);
        const chunkPath = `${videoPath}_chunk_${uploadedChunks}`;

        const { error: chunkError } = await supabase.storage
          .from('videos')
          .upload(chunkPath, chunk, {
            cacheControl: '3600',
            upsert: false
          });

        if (chunkError) {
          throw new Error(`Failed to upload video chunk: ${chunkError.message}`);
        }

        uploadedChunks++;
        const progress = (uploadedChunks / totalChunks) * 100;
        setUploadProgress(progress);
      }

      // Upload thumbnail
      const thumbnailPath = `${session.user.id}/thumbnails/${Date.now()}_${thumbnailFile.name}`;
      console.log('Uploading thumbnail to path:', thumbnailPath);
      
      const { error: thumbnailError } = await supabase.storage
        .from('videos')
        .upload(thumbnailPath, thumbnailFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (thumbnailError) {
        console.error('Thumbnail upload error:', thumbnailError);
        throw new Error(`Failed to upload thumbnail: ${thumbnailError.message}`);
      }

      console.log('Thumbnail uploaded successfully');

      // Get public URLs
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(videoPath);

      const { data: { publicUrl: thumbnailUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(thumbnailPath);

      console.log('Generated public URLs:', { videoUrl, thumbnailUrl });

      // Create video record
      const { data: newVideo, error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: session.user.id,
          title: title.trim(),
          description: description.trim(),
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          duration: Math.round(videoRef.current?.duration || 0)
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      console.log('Video record created successfully:', newVideo);

      // Create a notification for followers
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          recipient_id: session.user.id,
          actor_id: session.user.id,
          type: 'new_video',
          post_id: newVideo.id // Using the video ID directly
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't throw here, as the video upload was successful
      }

      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success("Video uploaded successfully!");
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Detailed upload error:', error);
      toast.error(error.message || "Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>
            Upload a video with a thumbnail image. Maximum video size is 100MB.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Video Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
          
          <FileInputSection
            id="video-upload"
            accept="video/*"
            icon="video"
            label="Select Video"
            selectedFile={videoFile}
            onFileSelect={handleVideoSelect}
          />

          <FileInputSection
            id="thumbnail-upload"
            accept="image/*"
            icon="image"
            label="Select Thumbnail"
            selectedFile={thumbnailFile}
            onFileSelect={handleThumbnailSelect}
          />

          <UploadProgress
            progress={uploadProgress}
            isUploading={isUploading}
          />
          
          <Button 
            onClick={handleUpload} 
            className="w-full gap-2"
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Video"}
          </Button>
        </div>
        {/* Hidden video element for duration check */}
        <video ref={videoRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};