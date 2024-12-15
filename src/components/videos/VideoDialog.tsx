import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";

interface VideoDialogProps {
  videoUrl: string | null;
  onClose: () => void;
}

export const VideoDialog = ({ videoUrl, onClose }: VideoDialogProps) => {
  if (!videoUrl) return null;

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

        <div className="relative w-full h-full flex items-center justify-center">
          <VideoPlayer
            videoUrl={videoUrl}
            className="max-h-full max-w-full rounded-lg"
            autoPlay
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};