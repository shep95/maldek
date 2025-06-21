
import { useEffect, useState, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Mic, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpaceAudioIndicatorProps {
  isConnected: boolean;
  isSpeaking?: boolean;
  audioLevel?: number;
}

export const SpaceAudioIndicator = memo(({
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

    // Monitor connection quality with error handling
    const checkQuality = () => {
      try {
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
          } else {
            // Fallback to good if connection API not available
            setConnectionQuality('good');
          }
        } else {
          setConnectionQuality('offline');
        }
      } catch (error) {
        console.warn('Error checking connection quality:', error);
        setConnectionQuality('good'); // Fallback to good
      }
    };

    checkQuality();
    
    const handleOnline = () => checkQuality();
    const handleOffline = () => setConnectionQuality('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected]);

  // Ensure audioLevel is within valid range
  const safeAudioLevel = Math.max(0, Math.min(5, Math.floor(audioLevel || 0)));

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

      {isSpeaking && safeAudioLevel > 0 && (
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                i < safeAudioLevel ? 'bg-green-500' : 'bg-gray-300'
              }`}
              style={{
                height: `${6 + (i * 2)}px`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

SpaceAudioIndicator.displayName = 'SpaceAudioIndicator';
