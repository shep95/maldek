
import { Message } from "@/types/messages";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MessageMedia } from "./components/MessageMedia";
import { MessageTimestamp } from "./components/MessageTimestamp";
import { MessageReactions } from "./components/MessageReactions";
import { MessageActions } from "./components/MessageActions";
import { Check, CheckCheck } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onReply: () => void;
  onReaction: (emoji: string) => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
}

export const ChatMessage = ({ 
  message, 
  isCurrentUser, 
  onReply,
  onReaction,
  onEdit,
  onDelete
}: ChatMessageProps) => {
  const handleDownload = async (imageUrl: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `image-${Date.now()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error("Failed to download image");
    }
  };

  return (
    <div
      className={cn(
        "group flex animate-fade-in gap-2 py-1.5",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] space-y-1",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "relative rounded-2xl px-4 py-2.5 text-sm hover-message animate-scale-message",
            isCurrentUser
              ? "message-gradient text-accent-foreground"
              : "bg-muted/80 text-foreground backdrop-blur-sm",
            message.reply_to_id && "mt-2"
          )}
        >
          {message.reply_to_id && (
            <div className="mb-2 -mt-4 -ml-2 text-xs text-muted-foreground/80 font-medium">
              Replying to message
            </div>
          )}
          
          <MessageMedia
            imageUrl={message.media_urls?.[0]}
            generatedImageUrl={message.media_urls?.[1]}
            onDownload={handleDownload}
          />
          
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <MessageTimestamp timestamp={message.created_at} />
            {isCurrentUser && (
              <div className="flex items-center gap-1 text-xs text-accent/70">
                {message.read_at ? (
                  <CheckCheck className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </div>
            )}
          </div>
        </div>

        <MessageReactions
          reactions={message.reactions}
          onReaction={onReaction}
          isCurrentUser={isCurrentUser}
        />

        <MessageActions
          message={message}
          isCurrentUser={isCurrentUser}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};
