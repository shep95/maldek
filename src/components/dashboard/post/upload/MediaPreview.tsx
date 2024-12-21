import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, X, Maximize2 } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";

interface MediaPreviewProps {
  url: string;
  onRemove: () => void;
  onMediaClick?: (url: string) => void;
  isLoading: boolean;
  hasError: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const MediaPreview = ({ 
  url, 
  onRemove, 
  onMediaClick, 
  isLoading, 
  hasError,
  onLoad,
  onError 
}: MediaPreviewProps) => {
  if (hasError) {
    return (
      <div className="relative group">
        <AspectRatio ratio={1}>
          <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center p-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Failed to load media</p>
            </div>
          </div>
        </AspectRatio>
      </div>
    );
  }

  return (
    <div className="relative group">
      {isLoading && (
        <Skeleton className="w-full h-full absolute inset-0 rounded-lg" />
      )}
      
      {isVideoFile(url) ? (
        <AspectRatio ratio={16 / 9}>
          <video
            src={url}
            controls
            className="w-full h-full object-cover rounded-lg"
            onLoadStart={() => console.log('Video loading started:', url)}
            onLoadedData={onLoad}
            onError={onError}
          />
        </AspectRatio>
      ) : (
        <AspectRatio ratio={1}>
          <img
            src={url}
            alt="Upload preview"
            className="w-full h-full object-cover rounded-lg transition-opacity duration-200"
            loading="lazy"
            style={{ display: isLoading ? 'none' : 'block' }}
            onLoad={onLoad}
            onError={onError}
          />
          {!isLoading && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
              {onMediaClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
                  onClick={() => onMediaClick(url)}
                >
                  <Maximize2 className="h-4 w-4 text-white" />
                </Button>
              )}
            </>
          )}
        </AspectRatio>
      )}
    </div>
  );
};