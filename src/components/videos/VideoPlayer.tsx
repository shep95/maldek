import { useState } from "react";
import { fetchRelevantAd } from "@/utils/adUtils";
import { AdPlayer } from "./player/AdPlayer";
import { MainPlayer } from "./player/MainPlayer";
import { LoadingState } from "./player/LoadingState";
import { ErrorState } from "./player/ErrorState";
import { useVideoUrl } from "./player/useVideoUrl";

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
  const [error, setError] = useState<string | null>(null);

  const { publicUrl, error: urlError, isLoading: urlLoading } = useVideoUrl(videoUrl);

  // Load ad when component mounts
  useState(() => {
    const loadAd = async () => {
      try {
        const relevantAd = await fetchRelevantAd();
        console.log('VideoPlayer - Loaded ad:', relevantAd);
        setAd(relevantAd);
        if (relevantAd) {
          setIsAdPlaying(true);
        }
      } catch (err) {
        console.error('VideoPlayer - Error loading ad:', err);
        setIsAdPlaying(false);
      }
    };

    loadAd();
  });

  const handleVideoError = (e: any) => {
    const videoElement = e.target as HTMLVideoElement;
    console.error('VideoPlayer - Playback error:', {
      error: videoElement.error,
      errorMessage: videoElement.error?.message,
      errorCode: videoElement.error?.code,
      networkState: videoElement.networkState,
      readyState: videoElement.readyState,
      currentSrc: videoElement.currentSrc,
      videoUrl,
      publicUrl
    });
    
    setError('Failed to load video. Please try again.');
    setIsLoading(false);
  };

  const handleVideoLoaded = () => {
    console.log('VideoPlayer - Video loaded successfully');
    setIsLoading(false);
    setError(null);
  };

  const handleAdEnded = () => {
    console.log('VideoPlayer - Ad playback ended');
    setIsAdPlaying(false);
  };

  if (!publicUrl) {
    return (
      <div className="flex items-center justify-center bg-black/10 w-full h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isAdPlaying && ad ? (
        <AdPlayer
          ad={ad}
          onEnded={handleAdEnded}
          onError={handleVideoError}
          onLoaded={handleVideoLoaded}
          className={className}
        />
      ) : (
        <MainPlayer
          videoUrl={publicUrl}
          onError={handleVideoError}
          onLoaded={handleVideoLoaded}
          className={className}
          controls={controls}
          autoPlay={autoPlay}
        />
      )}

      <LoadingState isLoading={isLoading || urlLoading} />
      <ErrorState error={error || urlError} />
    </div>
  );
};