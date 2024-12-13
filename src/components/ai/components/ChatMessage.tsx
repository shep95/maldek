import { Message } from "../types/messageTypes";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
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
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span className="text-[10px] sm:text-xs opacity-70 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};