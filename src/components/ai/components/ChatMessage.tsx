import { Message } from "../types/messageTypes";
import { cn } from "@/lib/utils";

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
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span className="text-[10px] sm:text-xs opacity-70 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};