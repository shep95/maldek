import { useEffect, useRef } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick: (url: string) => void;
}

export const PostMedia = ({ mediaUrls, onMediaClick }: PostMediaProps) => {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    console.log('PostMedia - Rendering media URLs:', mediaUrls);
    const observers: IntersectionObserver[] = [];

    mediaUrls.forEach((url) => {
      const video = videoRefs.current[url];
      if (video) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!video) return;

              if (entry.isIntersecting) {
                video.play().catch((error) => {
                  console.error('Video autoplay error:', error);
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

  if (!mediaUrls || mediaUrls.length === 0) {
    console.log('PostMedia - No media URLs provided');
    return null;
  }

  const isVideoFile = (url: string): boolean => {
    console.log('Checking if URL is video:', url);
    
    // Check if it's a blob URL for video
    if (url.startsWith('blob:')) {
      console.log('Blob URL detected');
      return true;
    }
    
    // Check common video file extensions
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
    const lowercaseUrl = url.toLowerCase();
    
    // Check file extensions
    const hasVideoExtension = videoExtensions.some(ext => lowercaseUrl.endsWith(ext));
    if (hasVideoExtension) {
      console.log('Video extension detected:', lowercaseUrl);
      return true;
    }
    
    // Check if URL contains video-specific paths or identifiers
    if (lowercaseUrl.includes('/videos/') || lowercaseUrl.includes('video')) {
      console.log('Video path detected');
      return true;
    }
    
    console.log('Not a video URL');
    return false;
  };

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
                  onError={(e) => console.error('Video loading error:', e)}
                  onLoadedData={() => console.log('Video loaded successfully:', url)}
                />
              </AspectRatio>
            ) : (
              <div onClick={() => onMediaClick(url)}>
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={url}
                    alt={`Post media ${i + 1}`}
                    className="w-full h-full object-cover rounded-lg transition-opacity hover:opacity-90"
                    onError={(e) => console.error('Image loading error:', e)}
                    onLoad={() => console.log('Image loaded successfully:', url)}
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