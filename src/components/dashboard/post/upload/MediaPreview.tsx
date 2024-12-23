import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, AlertCircle } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";

interface MediaPreviewProps {
  url: string;
  onRemove: () => void;
  isLoading?: boolean;
  hasError?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  progress?: number;
}

export const MediaPreview = ({
  url,
  onRemove,
  isLoading,
  hasError,
  onLoad,
  onError,
  progress
}: MediaPreviewProps) => {
  const isVideo = isVideoFile(url);

  if (hasError) {
    return (
      <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-muted-foreground">Failed to load media</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {isVideo ? (
          <video
            src={url}
            className="w-full h-full object-cover"
            controls
            onLoadStart={onLoad}
            onError={onError}
          />
        ) : (
          <img
            src={url}
            alt="Preview"
            className="w-full h-full object-cover"
            onLoad={onLoad}
            onError={onError}
          />
        )}

        {typeof progress === 'number' && progress < 100 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-3/4 space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-white">
                Uploading... {Math.round(progress)}%
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};