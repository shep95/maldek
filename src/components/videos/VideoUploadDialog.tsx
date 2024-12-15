import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Image, Upload, Video } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@supabase/auth-helpers-react";

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

    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video file size must be less than 100MB");
      return;
    }

    // Create a URL for the video to check its duration
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

    // Check thumbnail size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Thumbnail file size must be less than 5MB");
      return;
    }

    setThumbnailFile(file);
    toast.success("Thumbnail selected successfully");
  };

  const handleUpload = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to upload videos");
      return;
    }

    if (!videoFile || !thumbnailFile || !title.trim() || !description.trim()) {
      toast.error("Please fill in all fields and select both video and thumbnail");
      return;
    }

    setIsUploading(true);
    console.log('Starting video upload process...');

    try {
      // Upload video
      const videoPath = `${session.user.id}/${Date.now()}_${videoFile.name}`;
      console.log('Uploading video to path:', videoPath);
      
      const { error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoPath, videoFile);

      if (videoError) {
        console.error('Video upload error:', videoError);
        throw new Error(`Failed to upload video: ${videoError.message}`);
      }

      console.log('Video uploaded successfully');

      // Upload thumbnail
      const thumbnailPath = `${session.user.id}/${Date.now()}_${thumbnailFile.name}`;
      console.log('Uploading thumbnail to path:', thumbnailPath);
      
      const { error: thumbnailError } = await supabase.storage
        .from('videos')
        .upload(thumbnailPath, thumbnailFile);

      if (thumbnailError) {
        console.error('Thumbnail upload error:', thumbnailError);
        // Clean up video if thumbnail upload fails
        await supabase.storage.from('videos').remove([videoPath]);
        throw new Error(`Failed to upload thumbnail: ${thumbnailError.message}`);
      }

      console.log('Thumbnail uploaded successfully');

      // Get public URLs
      const videoUrl = supabase.storage.from('videos').getPublicUrl(videoPath).data.publicUrl;
      const thumbnailUrl = supabase.storage.from('videos').getPublicUrl(thumbnailPath).data.publicUrl;

      console.log('Generated public URLs:', { videoUrl, thumbnailUrl });

      // Create video record
      const { error: dbError } = await supabase.from('videos').insert({
        user_id: session.user.id,
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        duration: Math.round(videoRef.current?.duration || 0)
      });

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Clean up uploaded files if database insert fails
        await supabase.storage.from('videos').remove([videoPath, thumbnailPath]);
        throw dbError;
      }

      console.log('Video record created successfully');

      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success("Video uploaded successfully!");
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
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
          <div className="space-y-2">
            <Input
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
              id="video-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("video-upload")?.click()}
              className="w-full gap-2"
            >
              <Video className="h-4 w-4" />
              Select Video
            </Button>
            {videoFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {videoFile.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
              id="thumbnail-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("thumbnail-upload")?.click()}
              className="w-full gap-2"
            >
              <Image className="h-4 w-4" />
              Select Thumbnail
            </Button>
            {thumbnailFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {thumbnailFile.name}
              </p>
            )}
          </div>
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