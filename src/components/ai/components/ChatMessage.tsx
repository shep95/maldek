import { Message } from "../types/messageTypes";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const handleDownload = async (imageUrl: string) => {
    try {
      // Create an anchor element and trigger download directly from the image URL
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      link.target = '_blank'; // Open in new tab if direct download fails
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image download started");
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error("Failed to download image. Try right-clicking and 'Save Image As'");
    }
  };

  return (
    <div
      className={cn(
        "flex animate-fade-in",
        message.role === "assistant" ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] p-3 rounded-2xl text-sm sm:text-base",
          message.role === "assistant"
            ? "bg-muted text-foreground rounded-tl-sm"
            : "bg-accent text-accent-foreground rounded-tr-sm"
        )}
      >
        {message.imageUrl && (
          <div className="mb-2">
            <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
              <img
                src={message.imageUrl}
                alt="Uploaded content"
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>
        )}
        {message.generatedImageUrl && (
          <div className="mb-2">
            <AspectRatio ratio={1} className="overflow-hidden rounded-lg">
              <img
                src={message.generatedImageUrl}
                alt="AI-generated image"
                className="w-full h-full object-cover"
              />
            </AspectRatio>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => handleDownload(message.generatedImageUrl!)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span className="text-[10px] sm:text-xs opacity-70 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};