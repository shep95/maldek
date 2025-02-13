
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Message } from "@/types/messages";
import { MoreHorizontal, Reply, Edit, Trash, Copy } from "lucide-react";
import { toast } from "sonner";

interface MessageActionsProps {
  message: Message;
  isCurrentUser: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const MessageActions = ({
  message,
  isCurrentUser,
  onReply,
  onEdit,
  onDelete,
}: MessageActionsProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Message copied to clipboard");
  };

  return (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-muted/50 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align={isCurrentUser ? "end" : "start"}
          className="w-48 animate-fade-in"
        >
          <DropdownMenuItem 
            onClick={onReply}
            className="gap-2 cursor-pointer transition-colors"
          >
            <Reply className="h-4 w-4" />
            Reply
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleCopy}
            className="gap-2 cursor-pointer transition-colors"
          >
            <Copy className="h-4 w-4" />
            Copy
          </DropdownMenuItem>
          {isCurrentUser && (
            <>
              <DropdownMenuItem 
                onClick={onEdit}
                className="gap-2 cursor-pointer transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive gap-2 cursor-pointer transition-colors"
              >
                <Trash className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
