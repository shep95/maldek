import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crop, X } from "lucide-react";

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImage: File) => void;
  onClose: () => void;
}

export const ImageCropper = ({ imageUrl, onCrop, onClose }: ImageCropperProps) => {
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleCrop = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const image = imageRef.current;

    // Set canvas dimensions to maintain aspect ratio
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the image with current scale
    ctx.drawImage(
      image,
      0, 0,
      image.width,
      image.height
    );

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const file = new File([blob], 'cropped-image.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      onCrop(file);
      onClose();
    }, 'image/jpeg', 0.95);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              className="w-full h-auto"
              style={{ transform: `scale(${scale})` }}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">
              {Math.round(scale * 100)}%
            </span>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleCrop}>
              <Crop className="h-4 w-4 mr-2" />
              Crop & Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};