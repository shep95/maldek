import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Image, Upload } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "./types/messageTypes";
import { ChatMessage } from "./components/ChatMessage";
import { generateAIResponse } from "./utils/aiResponseUtils";

export const DaarpAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const session = useSession();

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
        content: "Hello! I'm Daarp, your personal AI assistant. I can help you with calculations, search the web for information, answer questions, and provide creative suggestions. What can I help you with today?",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!subscription) {
      toast.error("This feature is only available for premium users");
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await generateAIResponse({
        messages,
        currentMessage: userMessage.content
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

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-4">
        <Card className="p-6 max-w-md w-full text-center space-y-4 bg-card/50 backdrop-blur-sm">
          <MessageCircle className="w-12 h-12 mx-auto text-accent" />
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
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto p-4">
      <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-muted">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
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
        <div className="p-4 border-t border-muted">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything... Try some math like '2 + 2' or ask for help!"
              className="min-h-[2.5rem] max-h-32 bg-background"
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
              >
                <Image className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Upload className="h-5 w-5" />
              </Button>
              <Button type="submit" size="icon" className="shrink-0">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};