
import { useState, useRef, useEffect } from "react";
import { X, Maximize, Minimize } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut } from "lucide-react";

interface TelegramMediaViewerProps {
  open: boolean;
  mediaUrl: string;
  isVideo: boolean;
  onClose: () => void;
  onFullscreen: () => void;
  onMinimize?: () => void;
  showMinimize?: boolean;
}

export const TelegramMediaViewer = ({
  open,
  mediaUrl,
  isVideo,
  onClose,
  onFullscreen,
  onMinimize,
  showMinimize = false,
}: TelegramMediaViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imgContainerRef = useRef<HTMLDivElement>(null);

  const handleResetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Reset zoom when modal closes
  useEffect(() => {
    if (!open) {
      handleResetZoom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) {
    return null;
  }

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
    <div className="fixed z-[10000] inset-0 flex items-center justify-center bg-black/80 bg-opacity-80 transition-all animate-fade-in select-none">
      <div
        className={cn(
          "relative rounded-2xl bg-background flex flex-col items-center shadow-xl max-w-full user-select-none",
          "w-[min(90vw,600px)] min-h-[320px] max-h-[90vh] p-0 m-0 overflow-hidden"
        )}
        onMouseUp={isVideo ? undefined : handleMouseUp}
        onMouseMove={isVideo ? undefined : handleMouseMove}
        onTouchEnd={isVideo ? undefined : handleTouchEnd}
        onTouchMove={isVideo ? undefined : handleTouchMove}
        tabIndex={-1}
      >
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
                tabIndex={0}
                type="button"
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
                tabIndex={0}
                type="button"
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
                  tabIndex={0}
                  type="button"
                >
                  1x
                </Button>
              )}
            </>
          )}
          {showMinimize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMinimize}
              className="bg-black/40 hover:bg-black/90 text-white"
              title="Minimize"
              tabIndex={0}
              type="button"
            >
              <Minimize />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onFullscreen}
            className="bg-black/40 hover:bg-black/90 text-white"
            title="View fullscreen"
            tabIndex={0}
            type="button"
          >
            <Maximize />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onClose();
            }}
            className="bg-black/40 hover:bg-black/90 text-white"
            title="Close"
            tabIndex={0}
            type="button"
          >
            <X />
          </Button>
        </div>
        <div className="flex items-center justify-center w-full h-full px-8 py-8 min-h-[320px]">
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              playsInline
              preload="metadata"
              webkit-playsinline="true"
              className="rounded-lg max-h-[70vh] max-w-full object-contain"
            />
          ) : (
            <div
              ref={imgContainerRef}
              className={cn(
                "relative w-full h-full flex items-center justify-center overflow-hidden"
              )}
              style={{
                cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in"
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <img
                src={mediaUrl}
                alt="Preview"
                draggable={false}
                onDragStart={handleImgDragStart}
                className="rounded-lg shadow-lg max-h-[70vh] max-w-full object-contain transition-transform duration-200"
                style={{
                  background: "#222",
                  transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
                  transition: dragging
                    ? "none"
                    : "transform 0.25s cubic-bezier(.4,0,.2,1)"
                }}
                onMouseLeave={handleMouseUp}
              />
              {zoom > 1 && (
                <div className="absolute inset-0 pointer-events-none" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ... no code below, the rest is kept the same ...
