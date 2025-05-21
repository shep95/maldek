
import { Badge } from "@/components/ui/badge";
import { Record } from "lucide-react";

interface RecordingStatusProps {
  isRecording: boolean;
  duration: number;
}

export const RecordingStatus = ({ isRecording, duration }: RecordingStatusProps) => {
  // Format time function
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) return null;

  return (
    <Badge variant="destructive" className="flex items-center gap-1">
      <Record className="h-3 w-3 animate-pulse" /> 
      {formatTime(duration)}
    </Badge>
  );
};
