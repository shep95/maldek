import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";

interface MediaUploadZoneProps {
  onFileSelect: () => void;
  dragActive: boolean;
}

export const MediaUploadZone = ({ onFileSelect, dragActive }: MediaUploadZoneProps) => {
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
      >
        <Image className="h-4 w-4" />
        Drop media here or click to upload
      </Button>
      
      <div className="mt-2 text-sm text-muted-foreground text-center">
        Supports images and videos up to 50MB
      </div>
    </div>
  );
};