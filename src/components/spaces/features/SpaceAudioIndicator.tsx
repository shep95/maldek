import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Mic, WifiOff } from "lucide-react";

interface SpaceAudioIndicatorProps {
  isConnected: boolean;
  isSpeaking?: boolean;
  audioLevel?: number;
}

export const SpaceAudioIndicator = ({
  isConnected,
  isSpeaking,
  audioLevel = 0
}: SpaceAudioIndicatorProps) => {
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');

  useEffect(() => {
    if (!isConnected) {
      setConnectionQuality('offline');
      return;
    }

    // Monitor connection quality
    const checkQuality = () => {
      if (navigator.onLine) {
        // Using Navigator.connection if available
        const connection = (navigator as any).connection;
        if (connection) {
          const effectiveType = connection.effectiveType;
          setConnectionQuality(
            effectiveType === '4g' ? 'good' :
            effectiveType === '3g' ? 'poor' :
            'offline'
          );
        }
      } else {
        setConnectionQuality('offline');
      }
    };

    checkQuality();
    window.addEventListener('online', checkQuality);
    window.addEventListener('offline', checkQuality);

    return () => {
      window.removeEventListener('online', checkQuality);
      window.removeEventListener('offline', checkQuality);
    };
  }, [isConnected]);

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className={cn(
          "transition-colors",
          connectionQuality === 'good' ? "bg-green-500/10 text-green-500" :
          connectionQuality === 'poor' ? "bg-yellow-500/10 text-yellow-500" :
          "bg-red-500/10 text-red-500"
        )}
      >
        {connectionQuality === 'offline' ? (
          <WifiOff className="h-3 w-3 mr-1" />
        ) : (
          <Mic className="h-3 w-3 mr-1" />
        )}
        {connectionQuality === 'good' ? 'Good Connection' :
         connectionQuality === 'poor' ? 'Poor Connection' :
         'Offline'}
      </Badge>

      {isSpeaking && audioLevel > 0 && (
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full ${
                i < audioLevel ? 'bg-green-500' : 'bg-gray-300'
              }`}
              style={{
                height: `${6 + (i * 2)}px`,
                transition: 'all 150ms ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};