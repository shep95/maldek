import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface MessageMediaProps {
  imageUrl?: string;
  generatedImageUrl?: string;
  onDownload: (url: string) => void;
}

export const MessageMedia = ({ imageUrl, generatedImageUrl, onDownload }: MessageMediaProps) => {
  if (!imageUrl && !generatedImageUrl) return null;

  return (
    <>
      {imageUrl && (
        <div className="mb-2">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt="Uploaded content"
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </div>
      )}
      {generatedImageUrl && (
        <div className="mb-2">
          <AspectRatio ratio={1} className="overflow-hidden rounded-lg">
            <img
              src={generatedImageUrl}
              alt="AI-generated image"
              className="w-full h-full object-cover"
            />
          </AspectRatio>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => onDownload(generatedImageUrl)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Image
          </Button>
        </div>
      )}
    </>
  );
};