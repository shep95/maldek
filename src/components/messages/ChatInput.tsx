
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send, Smile, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Message } from "@/types/messages";

export interface ChatInputProps {
  onSendMessage: (content: string, replyToId?: string) => Promise<void>;
  isLoading: boolean;
  replyingTo: Message | null;
  onCancelReply: () => void;
  editingMessage: Message | null;
  onCancelEdit: () => void;
}

export const ChatInput = ({ 
  onSendMessage, 
  isLoading, 
  replyingTo, 
  onCancelReply,
  editingMessage,
  onCancelEdit
}: ChatInputProps) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
    }
  }, [editingMessage]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    try {
      await onSendMessage(message, replyingTo?.id);
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="chat-input-container p-4 border-t border-border/5">
      {replyingTo && (
        <div className="mb-2 p-2.5 bg-muted/50 rounded-lg flex items-center justify-between animate-fade-in">
          <div className="text-sm">
            <span className="text-muted-foreground">Replying to: </span>
            <span className="font-medium text-accent">{replyingTo.content}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-background/20 transition-colors"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {editingMessage && (
        <div className="mb-2 p-2.5 bg-muted/50 rounded-lg flex items-center justify-between animate-fade-in">
          <div className="text-sm">
            <span className="text-muted-foreground">Editing message</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-background/20 transition-colors"
            onClick={onCancelEdit}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0 hover:bg-muted/50 transition-colors"
          >
            <ImagePlus className="h-5 w-5 text-accent" />
            <span className="sr-only">Attach image</span>
          </Button>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-32 bg-muted/50 border-none focus:ring-1 focus:ring-accent/20 placeholder:text-muted-foreground/50 resize-none transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0 hover:bg-muted/50 transition-colors"
          >
            <Smile className="h-5 w-5 text-accent" />
            <span className="sr-only">Add emoji</span>
          </Button>
        </div>
        <Button 
          onClick={handleSend} 
          disabled={isLoading || !message.trim()}
          className="shrink-0 bg-accent hover:bg-accent/90 transition-colors"
        >
          <Send className="h-4 w-4 mr-2" />
          {editingMessage ? 'Update' : 'Send'}
        </Button>
      </div>
    </div>
  );
};
