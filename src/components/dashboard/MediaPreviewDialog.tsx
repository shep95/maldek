import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";
import { useState } from "react";

interface MediaPreviewDialogProps {
  selectedMedia: string | null;
  onClose: () => void;
}

export const MediaPreviewDialog = ({ selectedMedia, onClose }: MediaPreviewDialogProps) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!selectedMedia) return null;

  return (
    <Dialog open={!!selectedMedia} onOpenChange={onClose}>
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
          {isVideoFile(selectedMedia) ? (
            <video
              src={selectedMedia}
              controls
              playsInline
              className="max-h-full max-w-full rounded-lg"
              onLoadedData={() => setIsLoading(false)}
              onError={(e) => {
                console.error('Video error:', e);
                setIsLoading(false);
              }}
              autoPlay
            />
          ) : (
            <img
              src={selectedMedia}
              alt="Full size preview"
              className="max-h-full max-w-full rounded-lg object-contain"
              onLoad={() => setIsLoading(false)}
              onError={(e) => {
                console.error('Image error:', e);
                setIsLoading(false);
              }}
            />
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};