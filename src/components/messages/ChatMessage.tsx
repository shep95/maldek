import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  senderName: string;
  senderAvatar?: string | null;
}

export const ChatMessage = ({
  content,
  timestamp,
  isCurrentUser,
  senderName,
  senderAvatar,
}: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-2",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={senderAvatar || ''} alt={senderName} />
          <AvatarFallback>{senderName[0]}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <p className="text-sm">{content}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};