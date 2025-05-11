import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MediaPreview } from "./upload/MediaPreview";
import { MediaUploadZone } from "./upload/MediaUploadZone";
import { compressVideo } from "@/utils/videoCompression";
import { isVideoFile } from "@/utils/mediaUtils";
import { checkVideoUploadRestrictions } from "@/utils/postUtils";
import { supabase } from "@/integrations/supabase/client";

interface MediaUploadProps {
  mediaFiles: File[];
  mediaPreviewUrls: string[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMedia: (index: number) => void;
  currentUserId: string;
}

export const MediaUpload = ({
  mediaFiles,
  mediaPreviewUrls,
  onFileUpload,
  onRemoveMedia,
  currentUserId
}: MediaUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>(
    mediaPreviewUrls.reduce((acc, url) => ({ ...acc, [url]: true }), {})
  );
  const [errorStates, setErrorStates] = useState<{ [key: string]: boolean }>(
    mediaPreviewUrls.reduce((acc, url) => ({ ...acc, [url]: false }), {})
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleFiles = async (files: File[]) => {
    setIsProcessing(true);
    const processedFiles = [];

    try {
      for (const file of files) {
        console.log('Processing file:', {
          name: file.name,
          type: file.type,
          size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`
        });

        // Check video restrictions
        if (isVideoFile(file)) {
          console.log('Processing video file:', file.name);
          
          // Check if video meets restrictions
          const { allowed, message } = await checkVideoUploadRestrictions(file, currentUserId);
          if (!allowed) {
            toast.error(message || "Cannot upload this video");
            continue;
          }
          
          const compressedVideo = await compressVideo(file);
          processedFiles.push(compressedVideo);
        } else {
          processedFiles.push(file);
        }
      }

      // Create a synthetic event
      if (processedFiles.length > 0) {
        const event = {
          target: {
            files: processedFiles
          }
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        onFileUpload(event);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error("Failed to process media. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await handleFiles(files);
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

  const updateProgress = (url: string, progress: number) => {
    setUploadProgress(prev => ({ ...prev, [url]: progress }));
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
          onChange={handleInputChange}
          className="hidden"
          id="media-upload"
          disabled={isProcessing}
        />
        
        <MediaUploadZone
          onFileSelect={() => document.getElementById("media-upload")?.click()}
          dragActive={dragActive}
          isProcessing={isProcessing}
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
                onLoad={() => handleMediaLoad(url)}
                onError={() => handleMediaError(url)}
                progress={uploadProgress[url]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
