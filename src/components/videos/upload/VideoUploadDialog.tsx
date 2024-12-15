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

    if (!file.type.startsWith('video/')) {
      toast.error("Please select a valid video file");
      return;
    }

    setVideoFile(file);
    toast.success("Video selected successfully");
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file for the thumbnail");
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
    setUploadProgress(0);

    try {
      // Upload video
      const videoPath = `${session.user.id}/${Date.now()}_${videoFile.name}`;
      const { error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoPath, videoFile);

      if (videoError) throw videoError;

      // Upload thumbnail
      const thumbnailPath = `${session.user.id}/thumbnails/${Date.now()}_${thumbnailFile.name}`;
      const { error: thumbnailError } = await supabase.storage
        .from('videos')
        .upload(thumbnailPath, thumbnailFile);

      if (thumbnailError) throw thumbnailError;

      // Get public URLs
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(videoPath);

      const { data: { publicUrl: thumbnailUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(thumbnailPath);

      // Create video record
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: session.user.id,
          title: title.trim(),
          description: description.trim(),
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          duration: Math.round(videoRef.current?.duration || 0)
        });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success("Video uploaded successfully!");
      onOpenChange(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload video");
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
        <video ref={videoRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};