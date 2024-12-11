import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";

interface MediaPreviewDialogProps {
  selectedMedia: string | null;
  onClose: () => void;
}

export const MediaPreviewDialog = ({ selectedMedia, onClose }: MediaPreviewDialogProps) => {
  if (!selectedMedia) return null;

  return (
    <Dialog open={!!selectedMedia} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] h-[90vh] flex items-center justify-center bg-black/90">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-white"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        {isVideoFile(selectedMedia) ? (
          <video
            src={selectedMedia}
            controls
            className="max-h-full max-w-full rounded-lg"
          />
        ) : (
          <img
            src={selectedMedia}
            alt="Full size preview"
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};