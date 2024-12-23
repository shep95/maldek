import { useEffect, useRef, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export const EmperorChat = () => {
  const session = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('emperor_chat_messages')
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error("Failed to load chat messages");
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('emperor_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emperor_chat_messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('emperor_chat_messages')
        .insert({
          content: newMessage.trim(),
          user_id: session?.user?.id
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="flex justify-center">
        <main className="w-full max-w-3xl px-4 py-6 md:py-8">
          <div className="flex items-center gap-3 mb-8">
            <Crown className="h-6 w-6 text-yellow-500" />
            <h1 className="text-3xl font-bold text-foreground">Emperor Chat</h1>
          </div>

          <Card className="h-[calc(100vh-16rem)] flex flex-col bg-black/20 border-border/50 backdrop-blur-md">
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${
                      message.user_id === session?.user?.id ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`bg-accent/10 rounded-lg p-2 max-w-[80%] ${
                      message.user_id === session?.user?.id ? 'bg-yellow-500/10' : ''
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-yellow-500">
                          {message.profile?.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-border/5">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !newMessage.trim()}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
};