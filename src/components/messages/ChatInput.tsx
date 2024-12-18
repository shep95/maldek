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
    <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {replyingTo && (
        <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Replying to message: </span>
            <span className="font-medium">{replyingTo.content}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {editingMessage && (
        <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Editing message</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onCancelEdit}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ImagePlus className="h-5 w-5" />
            <span className="sr-only">Attach image</span>
          </Button>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..."
            className="min-h-[44px] max-h-32"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button variant="ghost" size="icon" className="shrink-0">
            <Smile className="h-5 w-5" />
            <span className="sr-only">Add emoji</span>
          </Button>
        </div>
        <Button 
          onClick={handleSend} 
          disabled={isLoading || !message.trim()}
          className="shrink-0"
        >
          <Send className="h-4 w-4 mr-2" />
          {editingMessage ? 'Update' : 'Send'}
        </Button>
      </div>
    </div>
  );
};