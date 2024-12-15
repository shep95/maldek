import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface VideoDialogProps {
  videoUrl: string | null;
  onClose: () => void;
}

export const VideoDialog = ({ videoUrl, onClose }: VideoDialogProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    if (videoUrl) {
      console.log('VideoDialog - Loading video:', videoUrl);
      setIsLoading(true);
      setVideoError(null);
    }
  }, [videoUrl]);

  const handleVideoError = (error: any) => {
    const errorMessage = 'Failed to load video. Please try again.';
    console.error('Video playback error:', error, 'URL:', videoUrl);
    setVideoError(errorMessage);
    setIsLoading(false);
    toast.error(errorMessage);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully:', videoUrl);
    setIsLoading(false);
    setVideoError(null);
  };

  if (!videoUrl) return null;

  return (
    <Dialog open={!!videoUrl} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] h-[95vh] flex items-center justify-center bg-black/95 p-0 gap-0 border-none">
        <DialogHeader>
          <DialogTitle className="sr-only">Video Player</DialogTitle>
        </DialogHeader>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-white hover:bg-white/10 z-50"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close video</span>
        </Button>

        {isLoading && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        )}

        <div className="relative w-full h-full flex items-center justify-center">
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            playsInline
            autoPlay
            preload="auto"
            className="max-h-full max-w-full rounded-lg transition-opacity duration-300"
            style={{ opacity: isLoading ? 0 : 1 }}
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            onPlay={() => console.log('Video started playing:', videoUrl)}
            onPause={() => console.log('Video paused:', videoUrl)}
            aria-label="Video player"
          />
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <p className="text-white text-center p-4">{videoError}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoDialog;