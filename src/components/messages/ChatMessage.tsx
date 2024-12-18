import { Message } from "@/types/messages";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MessageMedia } from "./components/MessageMedia";
import { MessageTimestamp } from "./components/MessageTimestamp";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onReply: () => void;
  onStatusUpdate: (messageId: string, status: string) => Promise<void>;
}

export const ChatMessage = ({ message, isCurrentUser, onReply, onStatusUpdate }: ChatMessageProps) => {
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
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] p-3 rounded-2xl text-sm sm:text-base",
          isCurrentUser
            ? "bg-accent text-accent-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}
      >
        <MessageMedia
          imageUrl={message.media_urls?.[0]}
          generatedImageUrl={message.media_urls?.[1]}
          onDownload={handleDownload}
        />
        <p className="whitespace-pre-wrap">{message.content}</p>
        <MessageTimestamp timestamp={message.created_at} />
      </div>
    </div>
  );
};