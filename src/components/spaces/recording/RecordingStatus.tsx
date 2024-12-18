import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";

interface RecordingStatusProps {
  isRecording: boolean;
  startTime?: Date;
}

export const RecordingStatus = ({ isRecording, startTime }: RecordingStatusProps) => {
  const [duration, setDuration] = useState("00:00");

  useEffect(() => {
    if (!isRecording || !startTime) return;

    const updateDuration = () => {
      const diff = new Date().getTime() - new Date(startTime).getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    const interval = setInterval(updateDuration, 1000);
    updateDuration();

    return () => clearInterval(interval);
  }, [isRecording, startTime]);

  if (!isRecording) return null;

  return (
    <Badge variant="secondary" className="bg-red-500/10 text-red-500 gap-1">
      <Timer className="h-3 w-3" />
      Recording {duration}
    </Badge>
  );
};