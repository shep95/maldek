
import { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

interface MediaViewerProps {
  open: boolean;
  mediaUrl: string;
  isVideo: boolean;
  onClose: () => void;
}

export const MediaViewer = ({
  open,
  mediaUrl,
  isVideo,
  onClose,
}: MediaViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleResetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Reset zoom when modal closes
  useEffect(() => {
    if (!open) {
      handleResetZoom();
    }
  }, [open]);

  const handleDownload = async () => {
    try {
      const link = document.createElement('a');
      link.href = mediaUrl;
      link.download = `message-media-${Date.now()}.${mediaUrl.split('.').pop()}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      console.error('Error downloading media:', error);
      toast.error("Failed to download media");
    }
  };

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return;
    setDragging(true);
    lastPos.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const nextX = e.clientX - lastPos.current.x;
    const nextY = e.clientY - lastPos.current.y;
    setOffset({ x: nextX, y: nextY });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleImgDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom === 1) return;
    const touch = e.touches[0];
    setDragging(true);
    touchStart.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    const nextX = touch.clientX - touchStart.current.x;
    const nextY = touch.clientY - touchStart.current.y;
    setOffset({ x: nextX, y: nextY });
  };
  
  const handleTouchEnd = () => {
    setDragging(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl bg-background p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-2 right-2 flex gap-1 z-20">
          {!isVideo && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={cn("bg-black/40 hover:bg-black/90 text-white", zoom <= MIN_ZOOM && "opacity-30 pointer-events-none")}
                onClick={() => setZoom(z => Math.max(z - 0.5, MIN_ZOOM))}
                disabled={zoom <= MIN_ZOOM}
                title="Zoom out"
              >
                <ZoomOut />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("bg-black/40 hover:bg-black/90 text-white", zoom >= MAX_ZOOM && "opacity-30 pointer-events-none")}
                onClick={() => setZoom(z => Math.min(z + 0.5, MAX_ZOOM))}
                disabled={zoom >= MAX_ZOOM}
                title="Zoom in"
              >
                <ZoomIn />
              </Button>
              {zoom > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/40 hover:bg-black/90 text-white"
                  onClick={handleResetZoom}
                  title="Reset zoom"
                >
                  1x
                </Button>
              )}
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/40 hover:bg-black/90 text-white"
            onClick={handleDownload}
            title="Download media"
          >
            <Download />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/40 hover:bg-black/90 text-white"
            onClick={onClose}
            title="Close"
          >
            <X />
          </Button>
        </div>
        <div 
          className="flex items-center justify-center w-full h-full px-8 py-8 min-h-[320px]"
          onMouseUp={isVideo ? undefined : handleMouseUp}
          onMouseMove={isVideo ? undefined : handleMouseMove}
          onTouchEnd={isVideo ? undefined : handleTouchEnd}
          onTouchMove={isVideo ? undefined : handleTouchMove}
        >
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              playsInline
              muted={true}
              preload="metadata"
              webkit-playsinline="true"
              className="rounded-lg max-h-[70vh] max-w-full object-contain"
            />
          ) : (
            <div
              className={cn("relative w-full h-full flex items-center justify-center overflow-hidden")}
              style={{
                cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in"
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <img
                src={mediaUrl}
                alt="Media preview"
                draggable={false}
                onDragStart={handleImgDragStart}
                className="rounded-lg shadow-lg max-h-[70vh] max-w-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
                  transition: dragging ? "none" : "transform 0.25s cubic-bezier(.4,0,.2,1)"
                }}
                onMouseLeave={handleMouseUp}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
