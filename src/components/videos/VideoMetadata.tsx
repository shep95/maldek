
import { formatDistanceToNow } from "date-fns";
import { Eye, Clock } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface VideoMetadataProps {
  views?: number;
  createdAt: string;
  duration: number;
}

export const VideoMetadata = ({ views = 0, createdAt, duration }: VideoMetadataProps) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Eye className="h-4 w-4" />
        <AnimatedCounter value={views} />
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        <span>{formatDuration(duration)}</span>
      </div>
      <span>•</span>
      <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
    </div>
  );
};
