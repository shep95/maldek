import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Maximize } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";
import { useEffect, useState } from "react";

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick: (url: string) => void;
}

export const PostMedia = ({ mediaUrls, onMediaClick }: PostMediaProps) => {
  const [loadError, setLoadError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    console.log('Media URLs to display:', mediaUrls);
  }, [mediaUrls]);

  const handleMediaError = (url: string) => {
    console.error(`Error loading media from URL: ${url}`);
    setLoadError(prev => ({ ...prev, [url]: true }));
  };

  return (
    <div className="mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
      {mediaUrls.map((url, i) => (
        <div key={i} className="relative rounded-lg overflow-hidden">
          {isVideoFile(url) ? (
            <AspectRatio ratio={16 / 9}>
              <video
                src={url}
                controls
                autoPlay
                muted
                loop
                playsInline
                onError={() => handleMediaError(url)}
                onLoadedData={(e) => {
                  console.log(`Video loaded successfully: ${url}`);
                  const video = e.target as HTMLVideoElement;
                  const canvas = document.createElement('canvas');
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
                  video.poster = canvas.toDataURL('image/jpeg');
                }}
                className="w-full h-full object-cover rounded-lg"
                style={{ borderRadius: '0.5rem' }}
              />
            </AspectRatio>
          ) : (
            <div 
              className="cursor-pointer" 
              onClick={() => onMediaClick(url)}
            >
              <AspectRatio ratio={16 / 9}>
                <img
                  src={url}
                  alt={`Post media ${i + 1}`}
                  onError={() => handleMediaError(url)}
                  className={`w-full h-full object-cover rounded-lg transition-opacity ${
                    loadError[url] ? 'opacity-50' : 'hover:opacity-90'
                  }`}
                />
                {!loadError[url] && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                  >
                    <Maximize className="h-4 w-4 text-white" />
                  </Button>
                )}
              </AspectRatio>
              {loadError[url] && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  Failed to load media
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};