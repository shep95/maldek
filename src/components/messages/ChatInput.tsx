import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send, Smile } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    try {
      await onSendMessage(message);
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          Send
        </Button>
      </div>
    </div>
  );
};