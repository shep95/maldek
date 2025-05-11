import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Image, AlertCircle, X } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { handlePasteEvent } from "@/utils/postUploadUtils";
import { cn } from "@/lib/utils";
import { checkVideoUploadRestrictions } from "@/utils/postUtils";
import { toast } from "sonner";
import { isVideoFile } from "@/utils/mediaUtils";

interface EnhancedUploadZoneProps {
  onFileSelect: (files: FileList) => void;
  onPaste: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  accept?: string;
  mediaFiles: File[];
  onRemoveFile: (index: number) => void;
  currentUserId: string;
}

export const EnhancedUploadZone = ({
  onFileSelect,
  onPaste,
  isUploading,
  uploadProgress,
  accept,
  mediaFiles,
  onRemoveFile,
  currentUserId
}: EnhancedUploadZoneProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    const newPreviewUrls = mediaFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
    return () => {
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [mediaFiles]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (mediaFiles.length >= 6) {
      setError('Maximum of 6 media files allowed');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const validFiles = [];
    
    for (const file of files) {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      
      if (!isValid) {
        setError('Invalid file type. Only images and videos are allowed.');
        continue;
      }
      if (!isValidSize) {
        setError('File too large. Maximum size is 50MB.');
        continue;
      }
      
      if (file.type.startsWith('video/')) {
        const { allowed, message } = await checkVideoUploadRestrictions(file, currentUserId);
        if (!allowed) {
          toast.error(message || "Video upload restrictions apply");
          continue;
        }
      }
      
      validFiles.push(file);
    }

    const remainingSlots = 6 - mediaFiles.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      const dataTransfer = new DataTransfer();
      filesToAdd.forEach(file => {
        dataTransfer.items.add(file);
      });
      onFileSelect(dataTransfer.files);
    }
    
    if (validFiles.length > remainingSlots) {
      setError(`Only ${remainingSlots} more file(s) could be added. Maximum of 6 files allowed.`);
    }
  }, [onFileSelect, mediaFiles.length, currentUserId]);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    if (mediaFiles.length >= 6) {
      setError('Maximum of 6 media files allowed');
      return;
    }

    const files = Array.from(e.target.files);
    const validFiles = [];
    
    for (const file of files) {
      if (file.type.startsWith('video/')) {
        const { allowed, message } = await checkVideoUploadRestrictions(file, currentUserId);
        if (!allowed) {
          toast.error(message || "Video upload restrictions apply");
          continue;
        }
      }
      validFiles.push(file);
    }

    const remainingSlots = 6 - mediaFiles.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      const dataTransfer = new DataTransfer();
      filesToAdd.forEach(file => {
        dataTransfer.items.add(file);
      });
      onFileSelect(dataTransfer.files);
    }
    
    if (validFiles.length > remainingSlots) {
      setError(`Only ${remainingSlots} more file(s) could be added. Maximum of 6 files allowed.`);
    }
  };

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (mediaFiles.length >= 6) {
      setError('Maximum of 6 media files allowed');
      return;
    }

    const file = handlePasteEvent(e);
    if (file) {
      console.log('File pasted:', file.name, file.type, file.size);
      
      if (file.type.startsWith('video/')) {
        const { allowed, message } = await checkVideoUploadRestrictions(file, currentUserId);
        if (!allowed) {
          toast.error(message || "Video upload restrictions apply");
          return;
        }
      }
      
      onPaste(file);
    }
  }, [onPaste, mediaFiles.length, currentUserId]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className="space-y-4"
    >
      <div className={cn(
        "relative border-2 border-dashed rounded-lg p-4 transition-all duration-200",
        dragActive ? "border-primary bg-primary/5" : "border-muted",
        "hover:border-primary/50 hover:bg-primary/5"
      )}>
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          id="media-upload"
        />
        
        <Button
          variant="outline"
          onClick={() => document.getElementById("media-upload")?.click()}
          className="w-full gap-2 justify-center group"
          disabled={isUploading || mediaFiles.length >= 6}
        >
          <Image className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span className="text-sm">
            {isUploading ? 'Uploading...' : mediaFiles.length >= 6 ? 'Maximum files reached (6)' : 'Drop media here or click to upload'}
          </span>
        </Button>

        {error && (
          <div className="mt-2 flex items-center gap-2 text-sm text-destructive animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            {error}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-auto"
              onClick={() => setError(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {isUploading && (
          <div className="mt-4 space-y-2 animate-fade-in">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}

        <p className="mt-2 text-sm text-muted-foreground text-center">
          Supports up to 6 images/videos (max 50MB each)
          <br />
          <span className="text-xs opacity-75">
            You can also paste images from clipboard
          </span>
        </p>
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full aspect-square object-cover rounded-[22px]"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-4 w-4 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
