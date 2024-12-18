import { Progress } from "@/components/ui/progress";

interface DownloadProgressProps {
  progress: number;
  isDownloading: boolean;
}

export const DownloadProgress = ({ progress, isDownloading }: DownloadProgressProps) => {
  if (!isDownloading) return null;

  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-muted-foreground text-center">
        Downloading... {Math.round(progress)}%
      </p>
    </div>
  );
};