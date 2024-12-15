import { useState, useRef, useEffect } from "react";
import { fetchRelevantAd, handleAdClick } from "@/utils/adUtils";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
}

export const VideoPlayer = ({ 
  videoUrl, 
  className = "", 
  controls = true,
  autoPlay = false 
}: VideoPlayerProps) => {
  const [ad, setAd] = useState<any>(null);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadAd = async () => {
      const relevantAd = await fetchRelevantAd();
      console.log('Loaded ad:', relevantAd);
      setAd(relevantAd);
      if (relevantAd) {
        setIsAdPlaying(true);
      }
    };

    loadAd();
  }, [videoUrl]);

  const handleAdEnded = () => {
    console.log('Ad playback ended');
    setIsAdPlaying(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleVideoError = (e: any) => {
    console.error('Video playback error:', e);
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {isAdPlaying && ad ? (
        <div className="relative">
          <video
            src={ad.video_url}
            className={className}
            autoPlay
            onEnded={handleAdEnded}
            onError={handleVideoError}
            onLoadedData={() => setIsLoading(false)}
          />
          <Button
            className="absolute bottom-4 right-4 gap-2 bg-accent hover:bg-accent/90"
            onClick={() => handleAdClick(ad.id, ad.target_url)}
          >
            Learn More
            <ExternalLink className="h-4 w-4" />
          </Button>
          <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
            Ad
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          className={className}
          controls={controls}
          autoPlay={autoPlay}
          onError={handleVideoError}
          onLoadedData={() => setIsLoading(false)}
        />
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
        </div>
      )}
    </div>
  );
};