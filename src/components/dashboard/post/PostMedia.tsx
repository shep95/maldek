import { useEffect, useRef, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";
import { supabase } from "@/integrations/supabase/client";
import debounce from "lodash/debounce";

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick: (url: string) => void;
}

export const PostMedia = ({ mediaUrls, onMediaClick }: PostMediaProps) => {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const watchTimeRefs = useRef<Record<string, number>>({});
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});

  // Debounced function to update watch time
  const updateWatchTime = debounce(async (postId: string, seconds: number) => {
    if (seconds <= 0) return;
    
    console.log(`Updating watch time for post ${postId}: ${seconds} seconds`);
    try {
      const { error } = await supabase.rpc('track_video_watch_time', {
        post_id: postId,
        watch_seconds: Math.round(seconds)
      });

      if (error) {
        console.error('Error updating watch time:', error);
      }
    } catch (error) {
      console.error('Failed to update watch time:', error);
    }
  }, 5000); // Update every 5 seconds to avoid too many database calls

  useEffect(() => {
    console.log('PostMedia - Rendering media URLs:', mediaUrls);
    const observers: IntersectionObserver[] = [];
    const watchTimeIntervals: Record<string, NodeJS.Timeout> = {};

    mediaUrls.forEach((url) => {
      const video = videoRefs.current[url];
      if (video) {
        // Initialize watch time tracking
        watchTimeRefs.current[url] = 0;

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!video) return;

              if (entry.isIntersecting) {
                video.play().catch((error) => {
                  console.error('Video autoplay error:', error);
                });
                setIsPlaying(prev => ({ ...prev, [url]: true }));

                // Start tracking watch time when video is visible and playing
                watchTimeIntervals[url] = setInterval(() => {
                  if (!video.paused && !video.ended) {
                    watchTimeRefs.current[url] += 1;
                    // Extract post ID from video URL (assuming it's in the path)
                    const urlParts = url.split('/');
                    const postId = urlParts[urlParts.length - 1].split('_')[0];
                    updateWatchTime(postId, watchTimeRefs.current[url]);
                  }
                }, 1000);

              } else {
                video.pause();
                setIsPlaying(prev => ({ ...prev, [url]: false }));
                // Clear interval when video is not visible
                if (watchTimeIntervals[url]) {
                  clearInterval(watchTimeIntervals[url]);
                }
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
      // Clear all intervals on cleanup
      Object.values(watchTimeIntervals).forEach(interval => clearInterval(interval));
      // Update final watch times
      mediaUrls.forEach((url) => {
        if (watchTimeRefs.current[url] > 0) {
          const urlParts = url.split('/');
          const postId = urlParts[urlParts.length - 1].split('_')[0];
          updateWatchTime.flush(); // Ensure any pending updates are sent
          updateWatchTime(postId, watchTimeRefs.current[url]);
        }
      });
    };
  }, [mediaUrls]);

  const handleMediaError = (url: string, error: any) => {
    console.error(`Error loading media ${url}:`, error);
  };

  if (!mediaUrls || mediaUrls.length === 0) {
    console.log('PostMedia - No media URLs provided');
    return null;
  }

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
                  onError={(e) => handleMediaError(url, e)}
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
                    onError={(e) => handleMediaError(url, e)}
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