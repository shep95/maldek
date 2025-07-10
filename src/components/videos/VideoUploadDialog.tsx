
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@supabase/auth-helpers-react";
import { FileInputSection } from "./upload/FileInputSection";
import { UploadProgress } from "./UploadProgress";
import { uploadVideoToSupabase } from "@/utils/videoUploadUtils";
import { getVideoDuration } from "@/utils/postUtils";

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
  const [canUploadVideo, setCanUploadVideo] = useState(true);

  useEffect(() => {
    // Check if user has already uploaded a video today
    const checkVideoUploads = async () => {
      if (!session?.user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, created_at, media_urls')
          .eq('user_id', session.user.id)
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
          .lt('created_at', new Date(new Date().setHours(23, 59, 59, 999)).toISOString());
        
        if (error) throw error;
        
        // Check if any posts today have video uploads
        const postsWithVideos = data?.filter(post => 
          post.media_urls?.some((url: string) => 
            url.match(/\.(mp4|webm|mov|avi|wmv)$/i)
          )
        );
        
        setCanUploadVideo(!(postsWithVideos && postsWithVideos.length > 0));
        
        if (postsWithVideos && postsWithVideos.length > 0) {
          toast.warning("You've already uploaded a video today. You can only upload one video per day.");
        }
      } catch (error) {
        console.error('Error checking video uploads:', error);
      }
    };
    
    checkVideoUploads();
  }, [session?.user?.id, isOpen]);

  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Selected video file:', { name: file.name, size: file.size, type: file.type });
    
    if (!file.type.startsWith('video/')) {
      toast.error("Please select a valid video file");
      return;
    }
    
    try {
      // Check video duration
      const duration = await getVideoDuration(file);
      console.log('Video duration:', duration);
      
      if (duration > 900) { // 15 minutes = 900 seconds
        toast.error("Videos must be less than 15 minutes in length");
        return;
      }
      
      setVideoFile(file);
      toast.success("Video selected successfully");
    } catch (error) {
      console.error('Error checking video duration:', error);
      toast.error("Could not process video. Please try another file.");
    }
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Selected thumbnail file:', { name: file.name, size: file.size, type: file.type });
    
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
    
    if (!canUploadVideo) {
      toast.error("You can only upload one video per day");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    console.log('Starting video upload process...');

    try {
      // Step 1: Get video duration (10%)
      setUploadProgress(10);
      const videoDuration = await getVideoDuration(videoFile);
      
      // Step 2: Upload files to Supabase Storage (10% - 80%)
      setUploadProgress(20);
      toast.info("Uploading video and thumbnail...");
      
      const { videoUrl, thumbnailUrl } = await uploadVideoToSupabase(
        videoFile,
        thumbnailFile,
        session.user.id
      );
      
      setUploadProgress(80);

      // Step 3: Create video record in database (80% - 100%)
      toast.info("Creating video record...");
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: session.user.id,
          title: title.trim(),
          description: description.trim(),
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          duration: Math.round(videoDuration)
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success("Video uploaded successfully!");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload video");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setThumbnailFile(null);
    setUploadProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>
            Upload a video with a thumbnail image. Maximum video length is 15 minutes, and you can only upload one video per day.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!canUploadVideo && (
            <div className="p-3 bg-destructive/20 text-destructive rounded-md text-sm">
              You've already uploaded a video today. You can only upload one video per day.
            </div>
          )}
          
          <Input
            placeholder="Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!canUploadVideo}
          />
          <Textarea
            placeholder="Video Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
            disabled={!canUploadVideo}
          />
          
          <FileInputSection
            id="video-upload"
            accept="video/*"
            icon="video"
            label="Select Video (Max 15 minutes)"
            selectedFile={videoFile}
            onFileSelect={handleVideoSelect}
            disabled={!canUploadVideo}
          />

          <FileInputSection
            id="thumbnail-upload"
            accept="image/*"
            icon="image"
            label="Select Thumbnail"
            selectedFile={thumbnailFile}
            onFileSelect={handleThumbnailSelect}
            disabled={!canUploadVideo}
          />

          <UploadProgress
            progress={uploadProgress}
            isUploading={isUploading}
          />
          
          {isUploading && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Processing your video upload...</p>
            </div>
          )}
          
          <Button 
            onClick={handleUpload} 
            className="w-full gap-2"
            disabled={isUploading || !canUploadVideo}
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
