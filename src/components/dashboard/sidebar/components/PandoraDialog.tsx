
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bot, Crown, Download } from "lucide-react";
import { PromptInput } from "@/components/ui/ai-chat-input";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

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
  const { subscribed, features } = useSubscription();
  const navigate = useNavigate();
  const session = useSession();
  
  // Check if user has unlimited access
  const hasUnlimitedAccess = session?.user?.email === 'killerbattleasher@gmail.com';
  const canUsePandora = subscribed || hasUnlimitedAccess;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: canUsePandora 
        ? 'Hello! I\'m PANDORA, your AI assistant. I\'m currently being built by ZORAK and will be running soon. You can start typing messages and uploading files - I\'ll be ready to help you shortly!\n\nCommands:\n• /new - Start a new chat\n• /download - Download chat history'
        : 'Hello! I\'m PANDORA, your AI assistant. Access to PANDORA requires an active subscription. Please subscribe to unlock this premium feature.',
      timestamp: new Date(),
    }
  ]);

  const handleSubmit = (value: string) => {
    if (!canUsePandora) {
      toast.error("PANDORA requires an active subscription");
      return;
    }

    // Handle commands
    if (value.startsWith('/')) {
      handleCommand(value);
      return;
    }

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

  const handleCommand = (command: string) => {
    const cmd = command.toLowerCase().trim();
    
    if (cmd === '/new') {
      setMessages([{
        id: Date.now().toString(),
        type: 'ai',
        content: 'New chat started! How can I help you today?\n\nCommands:\n• /new - Start a new chat\n• /download - Download chat history',
        timestamp: new Date(),
      }]);
      toast.success("New chat started");
    } else if (cmd === '/download') {
      downloadChatHistory();
    } else {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Unknown command. Available commands:\n• /new - Start a new chat\n• /download - Download chat history',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const downloadChatHistory = () => {
    const chatData = {
      export_date: new Date().toISOString(),
      total_messages: messages.length,
      messages: messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      }))
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pandora-chat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Chat history downloaded");
  };

  const handleFileUpload = (files: FileList) => {
    if (!canUsePandora) {
      toast.error("PANDORA requires an active subscription");
      return;
    }

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

  const handleSubscribe = () => {
    navigate('/subscription');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-accent" />
            PANDORA - AI Assistant
            {(subscribed || hasUnlimitedAccess) && <Crown className="h-4 w-4 text-yellow-500" />}
          </DialogTitle>
          <DialogDescription>
            Talk to PANDORA, the first advance self-evolving AGI created by ZORAK.
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
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="border-t pt-4">
            {!canUsePandora ? (
              <div className="space-y-3">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm text-muted-foreground mb-3">
                    PANDORA requires an active subscription to use
                  </p>
                  <Button onClick={handleSubscribe} className="w-full">
                    Subscribe to Access PANDORA
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCommand('/new')}
                    className="flex items-center gap-1"
                  >
                    New Chat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCommand('/download')}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
                <PromptInput
                  placeholder="Message PANDORA... (Try /new or /download)"
                  onSubmit={handleSubmit}
                  onFileUpload={handleFileUpload}
                  className="w-full max-w-none"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
