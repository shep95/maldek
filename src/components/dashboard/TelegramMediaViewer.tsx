
import { useState } from "react";
import { X, Maximize, Minimize } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

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
  if (!open) return null;

  return (
    <div className="fixed z-[10000] inset-0 flex items-center justify-center bg-black/80 bg-opacity-80 transition-all animate-fade-in">
      <div
        className={cn(
          "relative rounded-2xl bg-background flex flex-col items-center shadow-xl max-w-full",
          "w-[min(90vw,600px)] min-h-[320px] max-h-[90vh] p-0 m-0 overflow-hidden"
        )}
      >
        <div className="absolute top-2 right-2 flex gap-2 z-20">
          {showMinimize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMinimize}
              className="bg-black/40 hover:bg-black/90 text-white"
              title="Minimize"
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
          >
            <Maximize />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-black/40 hover:bg-black/90 text-white"
            title="Close"
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
              className="rounded-lg max-h-[70vh] max-w-full object-contain"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Preview"
              className="rounded-lg shadow-lg max-h-[70vh] max-w-full object-contain"
              style={{ background: "#222" }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
