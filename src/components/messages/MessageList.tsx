import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatInterface } from "./ChatInterface";

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
  const [selectedChat, setSelectedChat] = useState<Message | null>(null);
  const isMobile = useIsMobile();

  const handleDeleteMessage = async (messageId: string) => {
    try {
      setDeletingMessageId(messageId);
      
      const animationDuration = isMobile ? 500 : 1000;
      await new Promise(resolve => setTimeout(resolve, animationDuration));
      
      const { error } = await supabase
        .from('messages')
        .update({ removed_by_recipient: true })
        .eq('id', messageId);

      if (error) throw error;

      setLocalMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success("Message removed successfully");
    } catch (error) {
      console.error('Error removing message:', error);
      toast.error("Failed to remove message");
    } finally {
      setDeletingMessageId(null);
    }
  };

  if (selectedChat) {
    return (
      <div className="h-full">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedChat(null)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
              <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{selectedChat.name}</span>
          </div>
        </div>
        <ChatInterface recipientId={selectedChat.id} recipientName={selectedChat.name} />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-2 pr-4">
        {localMessages.map((message) => (
          <Button
            key={message.id}
            variant="ghost"
            className={`w-full justify-start p-4 h-auto active:bg-accent/5 transition-all ${
              isMobile ? 'duration-500' : 'duration-1000'
            } ${
              message.unread ? "bg-accent/5" : ""
            } ${
              deletingMessageId === message.id ? 
              "opacity-0 scale-95 blur-sm [mask-image:linear-gradient(45deg,transparent 25%,black 75%)]" : 
              "opacity-100 scale-100 blur-0"
            }`}
            onClick={() => setSelectedChat(message)}
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
                      className={`
                        ${isMobile ? 'h-10 w-10' : 'h-8 w-8'} 
                        p-0 
                        active:bg-destructive/10 
                        active:text-destructive
                        touch-manipulation
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(message.id);
                      }}
                    >
                      <Trash2 className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
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