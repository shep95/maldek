import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";

export interface RecordingStatusProps {
  isRecording: boolean;
  startTime?: Date;
  duration?: number;  // Added this prop
}

export const RecordingStatus = ({ isRecording, startTime, duration }: RecordingStatusProps) => {
  const [displayDuration, setDisplayDuration] = useState("00:00");

  useEffect(() => {
    if (!isRecording) return;

    // If duration is provided directly, use it
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      setDisplayDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      return;
    }

    // Otherwise calculate from startTime
    if (!startTime) return;

    const updateDuration = () => {
      const diff = new Date().getTime() - new Date(startTime).getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setDisplayDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    const interval = setInterval(updateDuration, 1000);
    updateDuration();

    return () => clearInterval(interval);
  }, [isRecording, startTime, duration]);

  if (!isRecording) return null;

  return (
    <Badge variant="secondary" className="bg-red-500/10 text-red-500 gap-1">
      <Timer className="h-3 w-3" />
      Recording {displayDuration}
    </Badge>
  );
};
