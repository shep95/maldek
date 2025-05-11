
import { formatDistanceToNow } from "date-fns";
import { Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  message: any;
  currentUserId: string | null;
  isEncrypted?: boolean;
}

export const MessageItem = ({ message, currentUserId, isEncrypted = false }: MessageItemProps) => {
  const isCurrentUser = message?.sender?.id === currentUserId;
  const formattedTime = message?.created_at
    ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true })
    : "";

  return (
    <div
      className={cn(
        "flex mb-4 max-w-[80%] group",
        isCurrentUser ? "self-end" : "self-start"
      )}
    >
      <div
        className={cn(
          "rounded-lg p-3 relative",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <div className="flex flex-col">
          <p className="break-words">{message?.content}</p>
          <div className={cn(
            "flex items-center text-xs mt-1 opacity-70",
            isCurrentUser ? "justify-end" : "justify-start"
          )}>
            <span>{formattedTime}</span>
            {isEncrypted && (
              <span className="ml-1" title="End-to-end encrypted">
                <ShieldCheck className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
