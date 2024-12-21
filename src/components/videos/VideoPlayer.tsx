import { useState, useRef, useEffect } from "react";
import { fetchRelevantAd, handleAdClick } from "@/utils/adUtils";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('VideoPlayer - Initial videoUrl:', videoUrl);
    setIsLoading(true);
    setError(null);

    if (!videoUrl) {
      console.error('VideoPlayer - Invalid video URL:', videoUrl);
      setError('Invalid video URL');
      setIsLoading(false);
      return;
    }

    // Handle Supabase storage URLs
    const getPublicUrl = async () => {
      try {
        if (videoUrl.startsWith('http')) {
          console.log('Using direct URL:', videoUrl);
          setPublicUrl(videoUrl);
        } else {
          // Clean the path and ensure it's properly formatted
          const cleanPath = videoUrl.replace(/^\/+/, '').trim();
          console.log('Cleaned video path:', cleanPath);
          
          const { data } = supabase.storage
            .from('videos')
            .getPublicUrl(cleanPath);

          if (!data?.publicUrl) {
            console.error('Failed to generate public URL');
            setError('Failed to generate video URL');
            setIsLoading(false);
            return;
          }

          console.log('Generated public URL:', data.publicUrl);
          setPublicUrl(data.publicUrl);

          // Log the actual video element state
          if (videoRef.current) {
            console.log('Video element state:', {
              readyState: videoRef.current.readyState,
              networkState: videoRef.current.networkState,
              error: videoRef.current.error,
              src: videoRef.current.src
            });
          }
        }
      } catch (err) {
        console.error('Error getting public URL:', err);
        setError('Failed to load video URL');
        setIsLoading(false);
      }
    };

    getPublicUrl();

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
      publicUrl
    });
    
    setError('Failed to load video. Please try again.');
    setIsLoading(false);
  };

  const handleVideoLoaded = () => {
    console.log('VideoPlayer - Video loaded successfully:', {
      url: videoUrl,
      publicUrl,
      duration: videoRef.current?.duration,
      readyState: videoRef.current?.readyState,
      networkState: videoRef.current?.networkState
    });
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
        <div className="relative">
          <video
            src={ad.video_url}
            className={className}
            autoPlay
            onEnded={handleAdEnded}
            onError={handleVideoError}
            onLoadedData={handleVideoLoaded}
            playsInline
            preload="auto"
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
          src={publicUrl}
          className={className}
          controls={controls}
          autoPlay={autoPlay}
          onError={handleVideoError}
          onLoadedData={handleVideoLoaded}
          playsInline
          preload="auto"
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