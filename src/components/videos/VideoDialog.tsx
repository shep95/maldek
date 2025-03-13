
import { Dialog, DialogContent } from "@/components/ui/dialog";
import VideoPlayer from "@/components/ui/video-player";

interface VideoDialogProps {
  videoUrl: string | null;
  onClose: () => void;
}

export const VideoDialog = ({ videoUrl, onClose }: VideoDialogProps) => {
  if (!videoUrl) return null;

  return (
    <Dialog open={!!videoUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl bg-transparent border-none p-0 shadow-none">
        <VideoPlayer src={videoUrl} />
      </DialogContent>
    </Dialog>
  );
};
