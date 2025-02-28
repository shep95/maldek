
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";

interface VideoDialogProps {
  videoUrl: string | null;
  onClose: () => void;
  onDownload?: () => void;
  onOpenOriginal?: () => void;
}

export const VideoDialog = ({ videoUrl, onClose, onDownload, onOpenOriginal }: VideoDialogProps) => {
  if (!videoUrl) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = 'video';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleOpenOriginal = () => {
    if (onOpenOriginal) {
      onOpenOriginal();
    } else {
      // Default open behavior
      window.open(videoUrl, '_blank');
    }
  };

  return (
    <Dialog open={!!videoUrl} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex items-center justify-center bg-black/95 p-0 gap-0 border-none">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-white hover:bg-white/10 z-50"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="absolute top-4 left-4 flex gap-2 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={handleDownload}
            title="Download video"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={handleOpenOriginal}
            title="Open original"
          >
            <ExternalLink className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative w-full h-full flex items-center justify-center">
          <VideoPlayer
            videoUrl={videoUrl}
            className="max-h-[600px] max-w-full rounded-lg"
            autoPlay
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
