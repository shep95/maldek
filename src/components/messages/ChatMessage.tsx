import { Message } from "../types/messageTypes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { MessageMedia } from "./components/MessageMedia";
import { MessageTimestamp } from "./components/MessageTimestamp";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const handleDownload = async (imageUrl: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      link.target = '_blank';
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
        <MessageMedia
          imageUrl={message.imageUrl}
          generatedImageUrl={message.generatedImageUrl}
          onDownload={handleDownload}
        />
        <p className="whitespace-pre-wrap">{message.content}</p>
        <MessageTimestamp timestamp={message.timestamp} />
      </div>
    </div>
  );
};