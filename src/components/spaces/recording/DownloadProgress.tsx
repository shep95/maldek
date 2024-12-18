import { Progress } from "@/components/ui/progress";

interface DownloadProgressProps {
  progress: number;
}

export const DownloadProgress = ({ progress }: DownloadProgressProps) => {
  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-muted-foreground text-center">
        Downloading... {progress.toFixed(0)}%
      </p>
    </div>
  );
};