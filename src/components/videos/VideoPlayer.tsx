import { useState, useRef, useEffect } from "react";
import { useVideoUrl } from "@/hooks/useVideoUrl";
import { VideoControls } from "./player/VideoControls";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, SkipBack, SkipForward, Play, Pause } from "lucide-react";
import { useBackgroundMusicContext } from "@/components/providers/BackgroundMusicProvider";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

interface VideoPlayerProps {
  videoUrl: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
}

type DbSubscriptionTier = Database['public']['Tables']['subscription_tiers']['Row'];
type DbUserSubscription = Database['public']['Tables']['user_subscriptions']['Row'] & {
  tier: DbSubscriptionTier;
};

export const VideoPlayer = ({ 
  videoUrl, 
  className = "", 
  controls = true,
  autoPlay = false 
}: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const backgroundMusic = useBackgroundMusicContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();
  const [showWatermark, setShowWatermark] = useState(false);
  const session = useSession();
  
  const { publicUrl, error: urlError, isLoading: isUrlLoading } = useVideoUrl(videoUrl);

  const { data: subscription } = useQuery<DbUserSubscription | null>({
    queryKey: ['user-subscription', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      console.log('Fetching subscription for user:', session.user.id);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      console.log('Subscription data:', data);

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data as DbUserSubscription;
    },
    enabled: !!session?.user?.id
  });

  const hasPaidSubscription = subscription?.status === 'active' && 
                            subscription?.tier?.name && 
                            ['Creator', 'True Emperor', 'Business'].includes(subscription.tier.name);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!videoRef.current) return;

      if (document.hidden && isPlaying && window.innerWidth >= 1024) {
        setIsPiPActive(true);
      } else {
        setIsPiPActive(false);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    videoRef.current?.addEventListener('play', handlePlay);
    videoRef.current?.addEventListener('pause', handlePause);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      videoRef.current?.removeEventListener('play', handlePlay);
      videoRef.current?.removeEventListener('pause', handlePause);
    };
  }, [isPlaying]);

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handlePlay = () => {
    if (backgroundMusic.isPlaying) {
      backgroundMusic.togglePlay();
    }
    startColorAnalysis();
    if (!hasPaidSubscription) {
      checkScreenRecording();
    }
  };

  const handlePause = () => {
    stopColorAnalysis();
  };

  const handleEnded = () => {
    stopColorAnalysis();
  };

  const checkScreenRecording = () => {
    // @ts-ignore - mediaDevices.getDisplayMedia is not in the TypeScript types yet
    if (navigator.mediaDevices?.getDisplayMedia) {
      setShowWatermark(true);
    }
  };

  useEffect(() => {
    if (hasPaidSubscription) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect common screenshot shortcuts
      const isPrintScreen = e.key === 'PrintScreen';
      const isMacScreenshot = (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '4';
      const isWindowsSnippingTool = (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 's';
      
      if (isPrintScreen || isMacScreenshot || isWindowsSnippingTool) {
        setShowWatermark(true);
        // Keep watermark visible for a short duration after screenshot
        setTimeout(() => setShowWatermark(false), 2000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPaidSubscription]);

  const getAverageColor = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = context.getImageData(0, 0, width, height).data;
    let r = 0, g = 0, b = 0, count = 0;

    // Sample pixels at intervals for better performance
    for (let i = 0; i < imageData.length; i += 16) {
      r += imageData[i];
      g += imageData[i + 1];
      b += imageData[i + 2];
      count++;
    }

    return {
      r: Math.round(r / count),
      g: Math.round(g / count),
      b: Math.round(b / count)
    };
  };

  const startColorAnalysis = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const updateColor = () => {
      if (!video.paused && !video.ended) {
        // Draw the current video frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get the average color
        const color = getAverageColor(context, canvas.width, canvas.height);
        
        // Create a larger, brighter glow effect similar to YouTube
        const glowOpacity = 0.3; // Increased opacity for more visible glow
        document.documentElement.style.setProperty(
          '--video-glow',
          `0 0 400px rgba(${color.r}, ${color.g}, ${color.b}, ${glowOpacity})`
        );

        // Request next frame
        animationFrameRef.current = requestAnimationFrame(updateColor);
      }
    };

    // Set initial canvas size
    canvas.width = 32; // Small size for performance
    canvas.height = 32;
    
    // Start the animation
    updateColor();
  };

  const stopColorAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    // Fade out the glow effect
    document.documentElement.style.setProperty('--video-glow', 'none');
  };

  const handleVideoError = (e: any) => {
    const videoElement = e.target as HTMLVideoElement;
    console.error('Video playback error:', {
      error: videoElement.error,
      errorMessage: videoElement.error?.message,
      errorCode: videoElement.error?.code,
      networkState: videoElement.networkState,
      readyState: videoElement.readyState,
      currentSrc: videoElement.currentSrc,
      originalUrl: videoUrl,
      publicUrl,
      videoType: videoElement.canPlayType('video/mp4'),
      supportedTypes: {
        mp4: videoElement.canPlayType('video/mp4'),
        webm: videoElement.canPlayType('video/webm'),
        ogg: videoElement.canPlayType('video/ogg')
      }
    });
    
    let errorMessage = 'Failed to load video. ';
    if (videoElement.error?.code === 4) {
      errorMessage += 'Format not supported. Please try converting the video to MP4.';
    } else if (videoElement.networkState === 3) {
      errorMessage += 'Network error.';
    } else {
      errorMessage += 'Please try again.';
    }
    
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleVideoLoaded = () => {
    const video = videoRef.current;
    console.log('Video loaded successfully:', {
      originalUrl: videoUrl,
      publicUrl,
      duration: video?.duration,
      readyState: video?.readyState,
      networkState: video?.networkState,
      videoWidth: video?.videoWidth,
      videoHeight: video?.videoHeight,
      currentSrc: video?.currentSrc
    });
    setIsLoading(false);
    setError(null);
  };

  if (isUrlLoading) {
    return (
      <div className="flex items-center justify-center bg-black/10 w-full h-full min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (urlError || !publicUrl) {
    console.error('URL generation error:', { urlError, originalUrl: videoUrl });
    return (
      <div className="flex items-center justify-center bg-black/80 text-white text-center p-4 min-h-[200px]">
        <p>{urlError || 'Failed to load video URL'}</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-[var(--video-glow)]">
        <canvas 
          ref={canvasRef} 
          className="hidden"
          aria-hidden="true"
        />
        <AspectRatio ratio={16 / 9}>
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={publicUrl}
              className={`w-full h-full object-contain ${className}`}
              controls={controls}
              onError={handleVideoError}
              onLoadedData={handleVideoLoaded}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              playsInline
              loop
              preload="auto"
              crossOrigin="anonymous"
              autoPlay={autoPlay}
            />
            {showWatermark && !hasPaidSubscription && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white text-[100px] font-bold opacity-50 rotate-[-45deg]">
                  Bosley
                </div>
              </div>
            )}
          </div>
        </AspectRatio>

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

      {/* Picture in Picture */}
      <div className={`pip-container ${isPiPActive ? 'active' : ''}`}>
        <video
          ref={videoRef}
          src={publicUrl}
          className="w-full h-full object-contain"
          controls={controls}
          onError={handleVideoError}
          onLoadedData={handleVideoLoaded}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          playsInline
          loop
          preload="auto"
          crossOrigin="anonymous"
          autoPlay={autoPlay}
        />
        <div className="pip-controls">
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => handleSkip(-5)}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => handleSkip(5)}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
