
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    read_at: string | null;
  };
  isMine: boolean;
}

export const MessageItem = ({ message, isMine }: MessageItemProps) => {
  const formattedTime = format(new Date(message.created_at), "h:mm a");

  return (
    <div className={cn(
      "flex mb-4",
      isMine ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[70%] rounded-lg px-4 py-2",
        isMine ? "bg-accent/90 text-white" : "bg-[#0d0d0d] text-white"
      )}>
        <div className="mb-1">
          {message.content}
        </div>
        <div className="text-xs opacity-70 text-right mt-1">
          {formattedTime}
          {isMine && (
            <span className="ml-1">
              {message.read_at ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
