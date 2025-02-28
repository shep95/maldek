import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

interface VideoControlsProps {
  onDownload: () => void;
  onOpenOriginal: () => void;
  onClose: () => void;
}

export const VideoControls = ({ onDownload, onOpenOriginal, onClose }: VideoControlsProps) => {
  return (
    <div className="absolute top-4 right-4 flex gap-2 z-50">
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10"
        onClick={onDownload}
        title="Download video"
      >
        <Download className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10"
        onClick={onOpenOriginal}
        title="Open original"
      >
        <ExternalLink className="h-5 w-5" />
      </Button>
    </div>
  );
};