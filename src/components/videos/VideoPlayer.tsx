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
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('VideoPlayer mounted with URL:', videoUrl);
    setIsLoading(true);
    setError(null);

    // Check if the video URL is valid
    if (!videoUrl) {
      console.error('Invalid video URL:', videoUrl);
      setError('Invalid video URL');
      setIsLoading(false);
      return;
    }

    const loadAd = async () => {
      try {
        const relevantAd = await fetchRelevantAd();
        console.log('Loaded ad:', relevantAd);
        setAd(relevantAd);
        if (relevantAd) {
          setIsAdPlaying(true);
        }
      } catch (err) {
        console.error('Error loading ad:', err);
        setIsAdPlaying(false);
      }
    };

    loadAd();

    // Reset states when video URL changes
    return () => {
      setIsLoading(true);
      setError(null);
    };
  }, [videoUrl]);

  const handleVideoError = (e: any) => {
    const videoElement = e.target as HTMLVideoElement;
    const videoSource = videoElement.currentSrc || videoUrl;
    const fileExtension = videoSource.split('.').pop()?.toLowerCase();
    
    console.error('Video playback error:', {
      originalError: e,
      videoUrl: videoSource,
      fileExtension,
      networkState: videoElement.networkState,
      readyState: videoElement.readyState,
      errorMessage: videoElement.error?.message || 'Unknown error',
      errorCode: videoElement.error?.code,
      supportedTypes: videoElement.canPlayType('video/mp4'),
      currentTime: videoElement.currentTime,
      paused: videoElement.paused,
      videoWidth: videoElement.videoWidth,
      videoHeight: videoElement.videoHeight
    });
    
    let errorMessage = 'Failed to load video: ';
    if (videoElement.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
      errorMessage += `Format not supported (${fileExtension}). Please try converting to MP4.`;
    } else if (videoElement.error?.code === MediaError.MEDIA_ERR_DECODE) {
      errorMessage += 'Video file is corrupted or uses an unsupported codec';
    } else if (videoElement.error?.code === MediaError.MEDIA_ERR_NETWORK) {
      errorMessage += 'Network error occurred while loading';
    } else if (videoElement.error?.code === MediaError.MEDIA_ERR_ABORTED) {
      errorMessage += 'Video loading was aborted';
    } else {
      errorMessage += videoElement.error?.message || 'Unknown error';
    }
    
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleAdEnded = () => {
    console.log('Ad playback ended');
    setIsAdPlaying(false);
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Error playing main video after ad:', err);
        setError('Failed to play video after ad');
      });
    }
  };

  const handleVideoLoaded = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      console.log('Video loaded successfully:', {
        url: videoUrl,
        duration: videoElement.duration,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
        readyState: videoElement.readyState,
        networkState: videoElement.networkState,
        error: videoElement.error,
        currentSrc: videoElement.currentSrc
      });
    }
    setIsLoading(false);
    setError(null);
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
            onLoadedData={handleVideoLoaded}
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
          onLoadedData={handleVideoLoaded}
          playsInline
          preload="metadata"
          type="video/mp4"
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      )}

      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-center p-4">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};