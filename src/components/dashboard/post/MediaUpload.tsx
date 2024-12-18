import { Button } from "@/components/ui/button";
import { Image, X, AlertCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState } from "react";
import { toast } from "sonner";

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isSizeValid = file.size <= 100 * 1024 * 1024; // 100MB limit
      
      if (!isValid) {
        toast.error(`Invalid file type: ${file.name}`);
      }
      if (!isSizeValid) {
        toast.error(`File too large: ${file.name}`);
      }
      
      return isValid && isSizeValid;
    });

    if (validFiles.length > 0) {
      const event = {
        target: {
          files: validFiles
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onFileUpload(event);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          dragActive ? 'border-accent bg-accent/5' : 'border-muted'
        }`}
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
        <Button
          variant="outline"
          onClick={() => document.getElementById("media-upload")?.click()}
          className="gap-2 w-full justify-center"
        >
          <Image className="h-4 w-4" />
          Drop media here or click to upload
        </Button>
        
        <div className="mt-2 text-sm text-muted-foreground text-center">
          Supports images and videos up to 100MB
        </div>
      </div>

      {mediaFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            {mediaFiles.length} file(s) selected
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {mediaPreviewUrls.map((url, index) => (
              <div key={url} className="relative group">
                {mediaFiles[index]?.type.startsWith('video/') ? (
                  <AspectRatio ratio={16 / 9}>
                    <video 
                      src={url} 
                      className="w-full h-full object-cover rounded-md"
                      controls
                    />
                  </AspectRatio>
                ) : (
                  <AspectRatio ratio={1}>
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </AspectRatio>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveMedia(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};