import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VideoDialogProps {
  videoUrl: string | null;
  onClose: () => void;
}

export const VideoDialog = ({ videoUrl, onClose }: VideoDialogProps) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!videoUrl) return null;

  console.log('VideoDialog - Attempting to play video:', videoUrl);

  const handleVideoError = (error: any) => {
    console.error('Video playback error:', error);
    setIsLoading(false);
    toast.error('Failed to load video. Please try again.');
  };

  return (
    <Dialog open={!!videoUrl} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] h-[95vh] flex items-center justify-center bg-black/95 p-0 gap-0 border-none">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-white hover:bg-white/10 z-50"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        )}

        <div className="relative w-full h-full flex items-center justify-center">
          <video
            src={videoUrl}
            controls
            playsInline
            preload="auto"
            className="max-h-full max-w-full rounded-lg transition-opacity duration-300"
            style={{ opacity: isLoading ? 0 : 1 }}
            onLoadedData={() => {
              console.log('Video loaded successfully:', videoUrl);
              setIsLoading(false);
            }}
            onError={handleVideoError}
            onPlay={() => console.log('Video started playing')}
            onPause={() => console.log('Video paused')}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};