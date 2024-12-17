import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Image, Upload, Video } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a URL for the video to check its duration
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      
      videoElement.onloadedmetadata = () => {
        const duration = Math.round(videoElement.duration);
        if (duration < 60) { // Less than 1 minute
          toast.error("Video must be at least 1 minute long");
          return;
        }
        setVideoFile(file);
        toast.success("Video selected");
      };
      
      videoElement.src = URL.createObjectURL(file);
    }
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file for the thumbnail");
        return;
      }
      setThumbnailFile(file);
      toast.success("Thumbnail selected");
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !thumbnailFile || !title.trim() || !description.trim()) {
      toast.error("Please fill in all fields and select both video and thumbnail");
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to upload videos");
        return;
      }

      // Upload video
      const videoPath = `${user.id}/${Date.now()}_${videoFile.name}`;
      const { error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoPath, videoFile);
      if (videoError) throw videoError;

      // Upload thumbnail
      const thumbnailPath = `${user.id}/${Date.now()}_${thumbnailFile.name}`;
      const { error: thumbnailError } = await supabase.storage
        .from('videos')
        .upload(thumbnailPath, thumbnailFile);
      if (thumbnailError) throw thumbnailError;

      // Get public URLs
      const videoUrl = supabase.storage.from('videos').getPublicUrl(videoPath).data.publicUrl;
      const thumbnailUrl = supabase.storage.from('videos').getPublicUrl(thumbnailPath).data.publicUrl;

      // Create video record
      const { error: dbError } = await supabase.from('videos').insert({
        user_id: user.id,
        title,
        description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        duration: Math.round(videoRef.current?.duration || 0)
      });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success("Video uploaded successfully!");
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
    } catch (error) {
      console.error('Error uploading video:', error);
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
            Upload a video that's at least 1 minute long with a thumbnail image.
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