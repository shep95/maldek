import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Image as ImageIcon, Upload } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Message } from "./types/messageTypes";
import { ChatMessage } from "./components/ChatMessage";
import { generateAIResponse } from "./utils/aiResponseUtils";
import { useIsMobile } from "@/hooks/use-mobile";

export const DaarpAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const isMobile = useIsMobile();

  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, tier:subscription_tiers(*)')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    },
    enabled: !!session?.user?.id
  });

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "👋 Hi! I'm Daarp, your AI assistant. Ask me anything!",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = async (file: File) => {
    try {
      if (!session?.user?.id) {
        toast.error("Please sign in to upload images");
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast.error("Failed to upload image");
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error in image upload:', error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    if (!subscription) {
      toast.error("This feature is only available for premium users");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await handleImageUpload(selectedImage);
        setSelectedImage(null);
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
        imageUrl
      };

      setMessages(prev => [...prev, userMessage]);
      setInput("");

      const response = await generateAIResponse({
        messages,
        currentMessage: userMessage.content,
        imageUrl: userMessage.imageUrl
      });

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        referencedMessageId: userMessage.id
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error("Sorry, I had trouble processing that request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed");
        return;
      }
      setSelectedImage(file);
      toast.success("Image selected");
    }
  };

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-4">
        <Card className="p-6 max-w-md w-full text-center space-y-4 bg-card/50 backdrop-blur-sm">
          <MessageCircle className="w-12 h-12 mx-auto text-accent animate-pulse" />
          <h2 className="text-xl font-semibold">Premium Feature</h2>
          <p className="text-muted-foreground">
            Upgrade to our premium plan to access Daarp AI and unlock powerful AI features.
          </p>
          <Button
            variant="default"
            className="w-full bg-accent hover:bg-accent/90"
            onClick={() => window.location.href = '/subscription'}
          >
            Upgrade Now
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col h-[calc(100vh-6rem)]",
      isMobile ? "h-[calc(100vh-8rem)] px-2" : "max-w-4xl mx-auto p-4"
    )}>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-muted">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg animate-pulse">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-2 sm:p-4 border-t border-muted">
          {selectedImage && (
            <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
              <span className="text-sm truncate">{selectedImage.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
              >
                Remove
              </Button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Daarp..."
              className="min-h-[2.5rem] max-h-32 bg-background text-sm sm:text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button type="submit" size="icon" className="shrink-0 bg-accent hover:bg-accent/90">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};