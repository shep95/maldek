import { useState, useRef } from "react";
import { useVideoUrl } from "@/hooks/useVideoUrl";
import { VideoControls } from "./player/VideoControls";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { useBackgroundMusicContext } from "@/components/providers/BackgroundMusicProvider";

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
  const backgroundMusic = useBackgroundMusicContext();
  
  const { publicUrl, error: urlError, isLoading: isUrlLoading } = useVideoUrl(videoUrl);

  const handlePlay = () => {
    if (backgroundMusic.isPlaying) {
      backgroundMusic.togglePlay();
    }
  };

  const handlePause = () => {
    // Optional: Resume background music on video pause
  };

  const handleEnded = () => {
    // Optional: Resume background music on video end
  };

  const handleDownload = async () => {
    if (!publicUrl) return;
    
    try {
      const response = await fetch(publicUrl);
      const blob = await response.blob();
      console.log('Download blob:', {
        type: blob.type,
        size: blob.size
      });
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
      setError('Failed to download video');
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
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 hover:bg-black/70 text-white"
          onClick={handleDownload}
          title="Download video"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 hover:bg-black/70 text-white"
          onClick={handleOpenOriginal}
          title="Open in new tab"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      <AspectRatio ratio={16 / 9}>
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
  );
};
