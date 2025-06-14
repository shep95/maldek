
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bot } from "lucide-react";
import { PromptInput } from "@/components/ui/ai-chat-input";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface PandoraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  files?: FileList;
}

export const PandoraDialog = ({ open, onOpenChange }: PandoraDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m PANDORA, your AI assistant. I\'m currently being built by ZORAK and will be running soon. You can start typing messages and uploading files - I\'ll be ready to help you shortly!',
      timestamp: new Date(),
    }
  ]);

  const handleSubmit = (value: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: value,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Simulate AI response (since PANDORA is still being built)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Thank you for your message! I\'m still being developed by ZORAK. Once I\'m fully operational, I\'ll be able to provide intelligent responses and help you with various tasks.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleFileUpload = (files: FileList) => {
    const fileNames = Array.from(files).map(file => file.name).join(', ');
    toast.success(`Files uploaded: ${fileNames}`);
    
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `Uploaded files: ${fileNames}`,
      timestamp: new Date(),
      files,
    };

    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-accent" />
            PANDORA - AI Assistant
          </DialogTitle>
          <DialogDescription>
            Chat with PANDORA and upload media files. Built by <span className="font-semibold text-accent">ZORAK</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="border-t pt-4">
            <PromptInput
              placeholder="Message PANDORA..."
              onSubmit={handleSubmit}
              onFileUpload={handleFileUpload}
              className="w-full max-w-none"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
