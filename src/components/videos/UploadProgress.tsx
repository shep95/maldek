import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  progress: number;
  isUploading: boolean;
}

export const UploadProgress = ({ progress, isUploading }: UploadProgressProps) => {
  if (!isUploading) return null;

  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-muted-foreground text-center">
        Uploading... {Math.round(progress)}%
      </p>
    </div>
  );
};