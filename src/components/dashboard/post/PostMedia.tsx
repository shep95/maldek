import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick?: (url: string) => void;
}

export const PostMedia = ({ mediaUrls, onMediaClick }: PostMediaProps) => {
  if (!mediaUrls || mediaUrls.length === 0) {
    console.log('No media URLs provided');
    return null;
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image loading error:', {
      src: e.currentTarget.src,
      naturalWidth: e.currentTarget.naturalWidth,
      naturalHeight: e.currentTarget.naturalHeight,
      complete: e.currentTarget.complete
    });
    
    // Hide the failed image and show error message
    const img = e.currentTarget;
    img.style.display = 'none';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-2';
    errorDiv.textContent = 'Failed to load image';
    img.parentElement?.appendChild(errorDiv);
  };

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
                  onError={(e) => {
                    console.error('Video loading error:', e);
                    const video = e.currentTarget;
                    video.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-red-500 text-sm mt-2';
                    errorDiv.textContent = 'Failed to load video';
                    video.parentElement?.appendChild(errorDiv);
                  }}
                />
              </AspectRatio>
            ) : (
              <div 
                onClick={() => onMediaClick?.(url)} 
                className="cursor-pointer relative"
              >
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={url}
                    alt={`Media content ${i + 1}`}
                    className="w-full h-full object-contain rounded-lg hover:opacity-95 transition-opacity"
                    loading="lazy"
                    onError={(e) => handleImageError(e)}
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