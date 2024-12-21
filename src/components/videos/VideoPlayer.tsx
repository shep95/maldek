import { useState, useRef } from "react";
import { useVideoUrl } from "@/hooks/useVideoUrl";
import { VideoControls } from "./player/VideoControls";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  console.log('VideoPlayer: Initial videoUrl:', videoUrl);
  
  const { publicUrl, error: urlError, isLoading: isUrlLoading } = useVideoUrl(videoUrl);

  const handleDownload = async () => {
    if (!publicUrl) return;
    
    try {
      const response = await fetch(publicUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = videoUrl.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download video');
    }
  };

  const handleOpenOriginal = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    }
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
    });
    
    let errorMessage = 'Failed to load video. ';
    if (videoElement.error?.code === 4) {
      errorMessage += 'Format not supported.';
    } else if (videoElement.networkState === 3) {
      errorMessage += 'Network error.';
    } else {
      errorMessage += 'Please try again.';
    }
    
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleVideoLoaded = () => {
    console.log('Video loaded successfully:', {
      originalUrl: videoUrl,
      publicUrl,
      duration: videoRef.current?.duration,
      readyState: videoRef.current?.readyState,
      networkState: videoRef.current?.networkState,
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
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        <video
          ref={videoRef}
          src={publicUrl}
          className={`w-full h-full object-contain ${className}`}
          controls={controls}
          autoPlay={autoPlay}
          onError={handleVideoError}
          onLoadedData={handleVideoLoaded}
          playsInline
          preload="auto"
          crossOrigin="anonymous"
        />
      </AspectRatio>

      <VideoControls
        onDownload={handleDownload}
        onOpenOriginal={handleOpenOriginal}
        onClose={() => {}}
      />

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