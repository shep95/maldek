import { Clock } from "lucide-react";

interface RecordingStatusProps {
  isRecording: boolean;
  duration: number;
}

export const RecordingStatus = ({ isRecording, duration }: RecordingStatusProps) => {
  if (!isRecording) return null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm text-red-500 animate-pulse">
      <div className="h-2 w-2 rounded-full bg-red-500" />
      <Clock className="h-4 w-4" />
      <span>{formatDuration(duration)}</span>
    </div>
  );
};