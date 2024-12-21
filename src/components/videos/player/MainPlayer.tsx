import { useRef, useEffect } from "react";

interface MainPlayerProps {
  videoUrl: string;
  onError: (e: any) => void;
  onLoaded: () => void;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

export const MainPlayer = ({ 
  videoUrl, 
  onError, 
  onLoaded, 
  className = "", 
  autoPlay = false,
  controls = true 
}: MainPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('MainPlayer - Rendering with URL:', videoUrl);
    
    // Log video element state changes
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadstart', () => console.log('Video loadstart'));
      video.addEventListener('loadedmetadata', () => console.log('Video loadedmetadata'));
      video.addEventListener('canplay', () => console.log('Video canplay'));
      video.addEventListener('playing', () => console.log('Video playing'));
      video.addEventListener('error', (e) => console.error('Video error:', e));
    }

    return () => {
      if (video) {
        video.removeEventListener('loadstart', () => {});
        video.removeEventListener('loadedmetadata', () => {});
        video.removeEventListener('canplay', () => {});
        video.removeEventListener('playing', () => {});
        video.removeEventListener('error', () => {});
      }
    };
  }, [videoUrl]);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      onError={onError}
      onLoadedData={onLoaded}
      playsInline
      preload="auto"
      crossOrigin="anonymous"
    />
  );
};