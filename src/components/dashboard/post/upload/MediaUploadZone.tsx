
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";

interface MediaUploadZoneProps {
  onFileSelect: () => void;
  dragActive: boolean;
  isProcessing?: boolean;
  isPrivateContent?: boolean;
}

export const MediaUploadZone = ({ 
  onFileSelect, 
  dragActive, 
  isProcessing, 
  isPrivateContent = false 
}: MediaUploadZoneProps) => {
  const sizeLimit = isPrivateContent ? '4GB' : '100KB';
  
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
        dragActive ? 'border-accent bg-accent/5' : 'border-muted'
      }`}
    >
      <Button
        variant="outline"
        onClick={onFileSelect}
        className="gap-2 w-full justify-center"
        disabled={isProcessing}
      >
        <Image className="h-4 w-4" />
        {isProcessing ? 'Processing media...' : 'Drop media here or click to upload'}
      </Button>
      
      <div className="mt-2 text-sm text-muted-foreground text-center">
        Supports images and videos up to {sizeLimit}
        {isPrivateContent && (
          <div className="text-xs mt-1 text-accent">
            Private content supports larger files and longer videos
          </div>
        )}
      </div>
    </div>
  );
};
