import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface AdPlayerProps {
  ad: any;
  onEnded: () => void;
  onError: (e: any) => void;
  onLoaded: () => void;
  className?: string;
}

export const AdPlayer = ({ ad, onEnded, onError, onLoaded, className = "" }: AdPlayerProps) => {
  const handleAdClick = () => {
    // Implement ad click handling
    window.open(ad.target_url, '_blank');
  };

  return (
    <div className="relative">
      <video
        src={ad.video_url}
        className={className}
        autoPlay
        onEnded={onEnded}
        onError={onError}
        onLoadedData={onLoaded}
        playsInline
        preload="auto"
      />
      <Button
        className="absolute bottom-4 right-4 gap-2 bg-accent hover:bg-accent/90"
        onClick={handleAdClick}
      >
        Learn More
        <ExternalLink className="h-4 w-4" />
      </Button>
      <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
        Ad
      </div>
    </div>
  );
};