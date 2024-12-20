import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Image, AlertCircle, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { handlePasteEvent } from "@/utils/postUploadUtils";
import { cn } from "@/lib/utils";

interface EnhancedUploadZoneProps {
  onFileSelect: (files: FileList) => void;
  onPaste: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
}

export const EnhancedUploadZone = ({
  onFileSelect,
  onPaste,
  isUploading,
  uploadProgress
}: EnhancedUploadZoneProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      
      if (!isValid) {
        setError('Invalid file type. Only images and videos are allowed.');
        return false;
      }
      if (!isValidSize) {
        setError('File too large. Maximum size is 50MB.');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      validFiles.forEach(file => dataTransfer.items.add(file));
      onFileSelect(dataTransfer.files);
    }
  }, [onFileSelect]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const file = handlePasteEvent(e);
    if (file) {
      console.log('File pasted:', file.name, file.type, file.size);
      onPaste(file);
    }
  }, [onPaste]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-4 transition-all duration-200",
        dragActive ? "border-primary bg-primary/5" : "border-muted",
        "hover:border-primary/50 hover:bg-primary/5"
      )}
    >
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => e.target.files && onFileSelect(e.target.files)}
        className="hidden"
        id="media-upload"
      />
      
      <Button
        variant="outline"
        onClick={() => document.getElementById("media-upload")?.click()}
        className="w-full gap-2 justify-center group"
        disabled={isUploading}
      >
        <Image className="h-4 w-4 transition-transform group-hover:scale-110" />
        <span className="text-sm">
          {isUploading ? 'Uploading...' : 'Drop media here or click to upload'}
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
        Supports images and videos up to 50MB
        <br />
        <span className="text-xs opacity-75">
          You can also paste images from clipboard
        </span>
      </p>
    </div>
  );
};