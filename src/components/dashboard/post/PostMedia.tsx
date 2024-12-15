import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Maximize } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";
import { useEffect, useState, useRef } from "react";

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick: (url: string) => void;
}

export const PostMedia = ({ mediaUrls, onMediaClick }: PostMediaProps) => {
  const [loadError, setLoadError] = useState<Record<string, boolean>>({});
  const [videoLoaded, setVideoLoaded] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    console.log('PostMedia - Media URLs:', mediaUrls);
  }, [mediaUrls]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    mediaUrls.forEach((url) => {
      if (isVideoFile(url) && videoRefs.current[url]) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const video = videoRefs.current[url];
              if (!video) return;

              if (entry.isIntersecting) {
                console.log('Video entering viewport:', url);
                video.play().catch((error) => {
                  console.error('Error playing video:', error);
                });
              } else {
                console.log('Video leaving viewport:', url);
                video.pause();
              }
            });
          },
          {
            threshold: 0.5,
          }
        );

        observer.observe(videoRefs.current[url]!);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [mediaUrls, videoLoaded]);

  const handleMediaError = (url: string) => {
    console.error(`Error loading media from URL: ${url}`);
    setLoadError(prev => ({ ...prev, [url]: true }));
  };

  const handleVideoLoad = (url: string) => {
    console.log(`Video loaded successfully: ${url}`);
    setVideoLoaded(prev => ({ ...prev, [url]: true }));
  };

  if (!mediaUrls || mediaUrls.length === 0) {
    console.log('No media URLs provided');
    return null;
  }

  return (
    <div className="mt-4 grid gap-2 grid-cols-1">
      {mediaUrls.map((url, i) => {
        console.log(`Rendering media ${i + 1}:`, url, 'isVideo:', isVideoFile(url));
        
        if (!url) {
          console.log(`Skipping empty URL at index ${i}`);
          return null;
        }

        return (
          <div key={url} className="relative rounded-lg overflow-hidden w-full max-w-3xl mx-auto">
            {isVideoFile(url) ? (
              <AspectRatio ratio={16 / 9}>
                <video
                  ref={(el) => videoRefs.current[url] = el}
                  src={url}
                  controls
                  playsInline
                  preload="metadata"
                  className={`w-full h-full object-contain bg-black rounded-lg ${
                    loadError[url] ? 'opacity-50' : ''
                  }`}
                  onError={() => handleMediaError(url)}
                  onLoadedData={() => handleVideoLoad(url)}
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
        );
      })}
    </div>
  );
};