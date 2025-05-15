
import { useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Message } from "./types/messageTypes";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { PremiumFeatureNotice } from "./components/PremiumFeatureNotice";
import { generateAIResponse } from "./utils/aiResponseUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatState } from "./hooks/useChatState";
import { handleImageUpload } from "./utils/imageUploadUtils";
import { isImageGenerationRequest } from "./utils/imageGenerationUtils";
import { useSubscription } from "@/hooks/useSubscription";

export const DaarpAIChat = () => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const isMobile = useIsMobile();
  const { messages, setMessages, isLoading, setIsLoading } = useChatState();
  const { subscribed, features } = useSubscription();

  const handleSubmit = async (content: string, image: File | null) => {
    if ((!content && !image) || isLoading) return;

    if (!subscribed || !features.canUseAI) {
      toast.error("This feature is only available for subscribers");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = null;
      if (image && session?.user?.id) {
        imageUrl = await handleImageUpload(image, session.user.id);
      }

      const shouldGenerateImage = isImageGenerationRequest(content);

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
        generateImage: shouldGenerateImage
      });

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

  if (!subscribed) {
    return <PremiumFeatureNotice />;
  }

  return (
    <div className={cn(
      "flex flex-col h-[calc(100vh-6rem)]",
      isMobile ? "h-[calc(100vh-12rem)] px-2 pb-24" : "max-w-4xl mx-auto p-4"
    )}>
      <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-muted overflow-hidden">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
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
