import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface MediaPreviewDialogProps {
  selectedMedia: string | null;
  onClose: () => void;
}

export const MediaPreviewDialog = ({ selectedMedia, onClose }: MediaPreviewDialogProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!selectedMedia) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(selectedMedia);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedMedia.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download media');
    }
  };

  const handleOpenOriginal = () => {
    window.open(selectedMedia, '_blank');
  };

  return (
    <Dialog open={!!selectedMedia} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] h-[95vh] flex items-center justify-center bg-black/95 p-0 gap-0 border-none">
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={handleDownload}
            title="Download media"
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
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={onClose}
            title="Close preview"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative w-full h-full flex items-center justify-center">
          {error ? (
            <div className="text-white text-center p-4">
              <p className="text-red-400 mb-2">{error}</p>
              <Button variant="outline" onClick={() => setError(null)}>
                Try Again
              </Button>
            </div>
          ) : isVideoFile(selectedMedia) ? (
            <video
              src={selectedMedia}
              controls
              playsInline
              className="max-h-full max-w-full rounded-lg"
              onLoadedData={() => setIsLoading(false)}
              onError={(e) => {
                console.error('Video error:', e);
                setIsLoading(false);
                setError('Failed to load video');
              }}
              autoPlay
            />
          ) : (
            <AspectRatio ratio={16 / 9} className="w-full max-h-[90vh]">
              <img
                src={selectedMedia}
                alt="Full size preview"
                className="w-full h-full object-contain rounded-lg"
                onLoad={() => setIsLoading(false)}
                onError={(e) => {
                  console.error('Image error:', e);
                  setIsLoading(false);
                  setError('Failed to load image');
                }}
              />
            </AspectRatio>
          )}

          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};