import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { isVideoFile } from "@/utils/mediaUtils";

interface MediaGalleryProps {
  mediaUrls: string[];
  onMediaClick?: (url: string) => void;
}

export const MediaGallery = ({ mediaUrls, onMediaClick }: MediaGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMediaClick = (index: number) => {
    setSelectedIndex(index);
    setIsDialogOpen(true);
    onMediaClick?.(mediaUrls[index]);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % mediaUrls.length);
  };

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + mediaUrls.length) % mediaUrls.length);
  };

  if (!mediaUrls || mediaUrls.length === 0) return null;

  return (
    <>
      <div className={cn(
        "mt-4 gap-2",
        mediaUrls.length === 1 ? "block" : "grid grid-cols-2"
      )}>
        {mediaUrls.map((url, index) => {
          const isVideo = isVideoFile(url);

          return (
            <div 
              key={url} 
              className={cn(
                "relative rounded-[33px] overflow-hidden group",
                index >= 4 && "hidden",
                mediaUrls.length === 1 && "col-span-2"
              )}
            >
              <AspectRatio ratio={16 / 9}>
                {isVideo ? (
                  <video
                    src={url}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover bg-muted rounded-[33px]"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div onClick={() => handleMediaClick(index)}>
                    <img
                      src={url}
                      alt={`Media content ${index + 1}`}
                      className="w-full h-full object-cover bg-muted/10 rounded-[33px] cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMediaClick(index);
                      }}
                    >
                      <Maximize2 className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                )}
              </AspectRatio>
              {index === 3 && mediaUrls.length > 4 && (
                <div 
                  className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-[33px] cursor-pointer"
                  onClick={() => handleMediaClick(index)}
                >
                  <span className="text-white text-xl font-semibold">
                    +{mediaUrls.length - 4} more
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 bg-background/80 backdrop-blur-xl">
          {selectedIndex !== null && (
            <div className="relative">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={mediaUrls[selectedIndex]}
                  alt={`Media content ${selectedIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </AspectRatio>
              
              <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};