import { useRef } from "react";

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

  console.log('MainPlayer - Rendering with URL:', videoUrl);

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