import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick: (url: string) => void;
}

export const PostMedia = ({ mediaUrls, onMediaClick }: PostMediaProps) => {
  console.log('Rendering PostMedia with URLs:', mediaUrls);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  return (
    <div className="mt-4 grid gap-2 grid-cols-1">
      {mediaUrls.map((url, i) => {
        const isVideo = isVideoFile(url);
        console.log('Processing media URL:', url, 'Is video:', isVideo);

        return (
          <div key={url} className="relative rounded-lg overflow-hidden w-full max-w-3xl mx-auto">
            {isVideo ? (
              <AspectRatio ratio={16 / 9}>
                <video
                  src={url}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain bg-black rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              </AspectRatio>
            ) : (
              <div 
                onClick={() => onMediaClick(url)} 
                className="cursor-pointer relative"
              >
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={url}
                    alt={`Media content ${i + 1}`}
                    className="w-full h-full object-cover rounded-lg hover:opacity-95 transition-opacity"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Error loading image:', url);
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                  >
                    <Maximize className="h-4 w-4 text-white" />
                  </Button>
                </AspectRatio>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};