import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MediaPreview } from "./upload/MediaPreview";
import { MediaUploadZone } from "./upload/MediaUploadZone";
import { validateMediaFile } from "@/utils/mediaUtils";

interface MediaUploadProps {
  mediaFiles: File[];
  mediaPreviewUrls: string[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMedia: (index: number) => void;
}

export const MediaUpload = ({
  mediaFiles,
  mediaPreviewUrls,
  onFileUpload,
  onRemoveMedia
}: MediaUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>(
    mediaPreviewUrls.reduce((acc, url) => ({ ...acc, [url]: true }), {})
  );
  const [errorStates, setErrorStates] = useState<{ [key: string]: boolean }>(
    mediaPreviewUrls.reduce((acc, url) => ({ ...acc, [url]: false }), {})
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const validation = validateMediaFile(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const event = {
        target: { files: validFiles }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onFileUpload(event);
    }
  };

  const handleMediaLoad = (url: string) => {
    console.log('Media loaded successfully:', url);
    setLoadingStates(prev => ({ ...prev, [url]: false }));
  };

  const handleMediaError = (url: string) => {
    console.error('Failed to load media:', url);
    setLoadingStates(prev => ({ ...prev, [url]: false }));
    setErrorStates(prev => ({ ...prev, [url]: true }));
  };

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={onFileUpload}
          className="hidden"
          id="media-upload"
        />
        
        <MediaUploadZone
          onFileSelect={() => document.getElementById("media-upload")?.click()}
          dragActive={dragActive}
        />
      </div>

      {mediaFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            {mediaFiles.length} file(s) selected
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {mediaPreviewUrls.map((url, index) => (
              <MediaPreview
                key={url}
                url={url}
                onRemove={() => onRemoveMedia(index)}
                isLoading={loadingStates[url]}
                hasError={errorStates[url]}
                onMediaClick={() => {
                  // Handle media preview click if needed
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};