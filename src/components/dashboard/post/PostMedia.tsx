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
    console.log('Media URLs to display:', mediaUrls);
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
            threshold: 0.5, // 50% of the video must be visible
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

  return (
    <div className="mt-4 grid gap-2 grid-cols-1">
      <style>
        {`
          video::-webkit-media-controls-timeline {
            margin: 0 10px;
          }
          video::-webkit-media-controls-play-button {
            margin: 0 5px;
          }
          video::-webkit-media-controls-current-time-display,
          video::-webkit-media-controls-time-remaining-display {
            margin: 0 5px;
          }
          video::-webkit-media-controls-progress-bar {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            height: 3px;
          }
          video::-webkit-media-controls-progress-inner-element {
            border-radius: 2px;
          }
          video::-webkit-media-controls-progress {
            background: linear-gradient(to right, #FFFFFF, #F97316);
            border-radius: 2px;
            height: 3px;
          }
        `}
      </style>
      {mediaUrls.map((url, i) => (
        <div key={i} className="relative rounded-lg overflow-hidden w-full max-w-3xl mx-auto">
          {isVideoFile(url) ? (
            <AspectRatio ratio={16 / 9}>
              <video
                ref={(el) => videoRefs.current[url] = el}
                src={url}
                controls
                playsInline
                loop
                muted
                onError={() => handleMediaError(url)}
                onLoadedData={() => handleVideoLoad(url)}
                className={`w-full h-full object-contain bg-black rounded-lg ${
                  loadError[url] ? 'opacity-50' : ''
                }`}
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