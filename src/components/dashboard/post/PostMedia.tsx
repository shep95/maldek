import { useEffect, useRef } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick: (url: string) => void;
}

export const PostMedia = ({ mediaUrls, onMediaClick }: PostMediaProps) => {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    mediaUrls.forEach((url) => {
      const video = videoRefs.current[url];
      if (video) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!video) return;

              if (entry.isIntersecting) {
                video.play().catch(() => {
                  console.log('Auto-play prevented');
                });
              } else {
                video.pause();
              }
            });
          },
          { threshold: 0.5 }
        );

        observer.observe(video);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [mediaUrls]);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  console.log('Rendering media URLs:', mediaUrls);

  return (
    <div className="mt-4 grid gap-2 grid-cols-1">
      {mediaUrls.map((url, i) => {
        const isVideo = isVideoFile(url);
        console.log(`Media ${i + 1}:`, { url, isVideo });

        return (
          <div key={url} className="relative rounded-lg overflow-hidden w-full max-w-3xl mx-auto">
            {isVideo ? (
              <AspectRatio ratio={16 / 9}>
                <video
                  ref={(el) => videoRefs.current[url] = el}
                  src={url}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain bg-black rounded-lg"
                  onError={(e) => console.error('Video error:', e)}
                />
              </AspectRatio>
            ) : (
              <div onClick={() => onMediaClick(url)}>
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={url}
                    alt={`Post media ${i + 1}`}
                    className="w-full h-full object-cover rounded-lg transition-opacity hover:opacity-90"
                    onError={(e) => console.error('Image error:', e)}
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