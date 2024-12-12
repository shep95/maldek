import { Button } from "@/components/ui/button";
import { Image, X } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  return (
    <div className="space-y-2">
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
        className="gap-2"
      >
        <Image className="h-4 w-4" />
        Add Media
      </Button>
      {mediaFiles.length > 0 && (
        <span className="text-sm text-muted-foreground">
          {mediaFiles.length} file(s) selected
        </span>
      )}
      
      {/* Media Previews */}
      {mediaPreviewUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {mediaPreviewUrls.map((url, index) => (
            <div key={url} className="relative">
              {mediaFiles[index]?.type.startsWith('video/') ? (
                <video 
                  src={url} 
                  className="w-full h-32 object-cover rounded-md"
                  controls
                />
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
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => onRemoveMedia(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};