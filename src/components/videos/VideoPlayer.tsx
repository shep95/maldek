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
    console.log('VideoPlayer - Initial mount with URL:', videoUrl);
    console.log('VideoPlayer - URL type:', typeof videoUrl);
    console.log('VideoPlayer - URL structure:', {
      isAbsolute: videoUrl?.startsWith('http'),
      containsStoragePath: videoUrl?.includes('storage/v1/object'),
      fullUrl: videoUrl,
      urlParams: new URL(videoUrl).searchParams.toString()
    });

    setIsLoading(true);
    setError(null);

    if (!videoUrl) {
      console.error('VideoPlayer - Invalid video URL:', videoUrl);
      setError('Invalid video URL');
      setIsLoading(false);
      return;
    }

    // Test video loading
    const testVideo = document.createElement('video');
    testVideo.src = videoUrl;
    testVideo.load();
    
    testVideo.addEventListener('loadedmetadata', () => {
      console.log('VideoPlayer - Test video metadata loaded:', {
        duration: testVideo.duration,
        videoWidth: testVideo.videoWidth,
        videoHeight: testVideo.videoHeight
      });
    });

    testVideo.addEventListener('error', (e) => {
      console.error('VideoPlayer - Test video error:', {
        error: testVideo.error,
        errorCode: testVideo.error?.code,
        errorMessage: testVideo.error?.message,
        networkState: testVideo.networkState,
        readyState: testVideo.readyState
      });
    });

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
  }, [videoUrl]);

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
      mimeType: videoElement.canPlayType('video/mp4'),
      webmSupport: videoElement.canPlayType('video/webm'),
      oggSupport: videoElement.canPlayType('video/ogg')
    });
    
    setError('Failed to load video. Please try again.');
    setIsLoading(false);
  };

  const handleVideoLoaded = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      console.log('VideoPlayer - Video loaded successfully:', {
        url: videoUrl,
        duration: videoElement.duration,
        readyState: videoElement.readyState,
        networkState: videoElement.networkState,
        currentSrc: videoElement.currentSrc,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight
      });
    }
    setIsLoading(false);
    setError(null);
  };

  const handleAdEnded = () => {
    console.log('VideoPlayer - Ad playback ended');
    setIsAdPlaying(false);
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('VideoPlayer - Error playing main video after ad:', err);
        setError('Failed to play video after ad');
      });
    }
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
            playsInline
            preload="metadata"
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
          crossOrigin="anonymous"
        />
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