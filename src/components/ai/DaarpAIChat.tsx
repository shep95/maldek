import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Message } from "./types/messageTypes";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { PremiumFeatureNotice } from "./components/PremiumFeatureNotice";
import { generateAIResponse } from "./utils/aiResponseUtils";
import { useIsMobile } from "@/hooks/use-mobile";

export const DaarpAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
        content: "👋 Hi! I'm Bosley AI, your AI assistant. I can help you generate images and answer questions. Try saying 'Generate an image of...' or ask me anything!",
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

  const handleSubmit = async (content: string, image: File | null) => {
    if ((!content && !image) || isLoading) return;

    if (!subscription) {
      toast.error("This feature is only available for premium users");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await handleImageUpload(image);
      }

      // Check for image generation keywords more comprehensively
      const imageGenerationKeywords = [
        'generate an image',
        'create an image',
        'make an image',
        'draw',
        'generate a picture',
        'create a picture',
        'make a picture',
        'generate img',
        'create img',
        'make img',
        'generate photo',
        'create photo',
        'make photo',
        'imagine'
      ];

      const normalizedContent = content.toLowerCase();
      const isImageGenerationRequest = imageGenerationKeywords.some(keyword => 
        normalizedContent.includes(keyword)
      );

      console.log('Processing request:', { 
        content, 
        hasImage: !!imageUrl, 
        isImageGenerationRequest,
        matchedKeywords: imageGenerationKeywords.filter(keyword => 
          normalizedContent.includes(keyword)
        )
      });

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
        imageUrl
      };

      setMessages(prev => [...prev, userMessage]);

      const response = await generateAIResponse({
        messages,
        currentMessage: userMessage.content,
        imageUrl: userMessage.imageUrl,
        generateImage: isImageGenerationRequest
      });

      console.log('AI Response received:', response);

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: typeof response === 'string' ? response : response.text,
        timestamp: new Date(),
        referencedMessageId: userMessage.id,
        generatedImageUrl: typeof response === 'string' ? undefined : response.imageUrl
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error("Sorry, I had trouble processing that request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscription) {
    return <PremiumFeatureNotice />;
  }

  return (
    <div className={cn(
      "flex flex-col h-[calc(100vh-6rem)]",
      isMobile ? "h-[calc(100vh-12rem)] px-2 pb-24" : "max-w-4xl mx-auto p-4"
    )}>
      <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-muted overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
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
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
      </Card>
    </div>
  );
};