import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

interface SpaceAudioIndicatorProps {
  isConnected: boolean;
  audioLevel?: number;
}

export const SpaceAudioIndicator = ({ 
  isConnected,
  audioLevel = 0 
}: SpaceAudioIndicatorProps) => {
  const [networkQuality, setNetworkQuality] = useState<'good' | 'poor' | 'offline'>('good');

  useEffect(() => {
    // Monitor network quality
    const checkNetworkQuality = () => {
      if (!isConnected) {
        setNetworkQuality('offline');
        return;
      }
      
      // Using Navigator.connection if available
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        setNetworkQuality(
          effectiveType === '4g' ? 'good' : 
          effectiveType === '3g' ? 'poor' : 
          'offline'
        );
      }
    };

    checkNetworkQuality();
    window.addEventListener('online', checkNetworkQuality);
    window.addEventListener('offline', checkNetworkQuality);

    return () => {
      window.removeEventListener('online', checkNetworkQuality);
      window.removeEventListener('offline', checkNetworkQuality);
    };
  }, [isConnected]);

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="secondary" 
        className={`
          ${networkQuality === 'good' ? 'bg-green-500/10 text-green-500' : 
            networkQuality === 'poor' ? 'bg-yellow-500/10 text-yellow-500' : 
            'bg-red-500/10 text-red-500'}
        `}
      >
        {networkQuality === 'offline' ? (
          <WifiOff className="h-3 w-3 mr-1" />
        ) : (
          <Wifi className="h-3 w-3 mr-1" />
        )}
        {networkQuality === 'good' ? 'Good Connection' : 
         networkQuality === 'poor' ? 'Poor Connection' : 
         'Offline'}
      </Badge>
      
      {audioLevel > 0 && (
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full ${
                i < audioLevel 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
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
};