import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
}

export const MessageList = ({ messages }: { messages: Message[] }) => {
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);

  const handleDeleteMessage = async (messageId: string) => {
    try {
      setDeletingMessageId(messageId);
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      // Remove message from local state
      setLocalMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success("Message deleted successfully");
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error("Failed to delete message");
    } finally {
      setDeletingMessageId(null);
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-2 pr-4">
        {localMessages.map((message) => (
          <Button
            key={message.id}
            variant="ghost"
            className={`w-full justify-start p-4 h-auto hover:bg-accent/5 transition-all duration-1000 ${
              message.unread ? "bg-accent/5" : ""
            } ${
              deletingMessageId === message.id ? 
              "opacity-0 scale-95 blur-sm [mask-image:linear-gradient(45deg,transparent_25%,black_75%)]" : 
              "opacity-100 scale-100 blur-0"
            }`}
          >
            <div className="flex gap-4 items-start w-full">
              <Avatar className="h-12 w-12 border-2 border-accent/10">
                <AvatarImage src={message.avatar} alt={message.name} />
                <AvatarFallback className="bg-accent/10 text-accent">
                  {message.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-semibold text-base">
                    {message.name}
                    {message.unread && (
                      <span className="ml-2 inline-block w-2 h-2 bg-accent rounded-full" />
                    )}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(message.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete message</span>
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {message.lastMessage}
                </p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};