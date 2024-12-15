import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VideoDialogProps {
  videoUrl: string | null;
  onClose: () => void;
}

export const VideoDialog = ({ videoUrl, onClose }: VideoDialogProps) => {
  if (!videoUrl) return null;

  return (
    <Dialog open={!!videoUrl} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black/95">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-white hover:bg-white/10 z-50"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-full max-h-[80vh] object-contain"
        />
      </DialogContent>
    </Dialog>
  );
};