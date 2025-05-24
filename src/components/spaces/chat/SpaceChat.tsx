
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: {
    username: string;
    avatar_url?: string;
  };
}

interface SpaceChatProps {
  spaceId: string;
  isVisible: boolean;
}

export const SpaceChat = ({ spaceId, isVisible }: SpaceChatProps) => {
  const session = useSession();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing messages
  useEffect(() => {
    if (!isVisible || !spaceId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('space_chat_messages')
        .select(`
          id,
          user_id,
          content,
          created_at,
          profile:profiles(username, avatar_url)
        `)
        .eq('space_id', spaceId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat messages:', error);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();
  }, [spaceId, isVisible]);

  // Subscribe to new messages
  useEffect(() => {
    if (!isVisible || !spaceId) return;

    const channel = supabase
      .channel(`space_chat_${spaceId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'space_chat_messages',
          filter: `space_id=eq.${spaceId}`
        }, 
        (payload) => {
          console.log('New chat message:', payload);
          // Fetch the full message with profile data
          fetchNewMessage(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spaceId, isVisible]);

  const fetchNewMessage = async (messageId: string) => {
    const { data, error } = await supabase
      .from('space_chat_messages')
      .select(`
        id,
        user_id,
        content,
        created_at,
        profile:profiles(username, avatar_url)
      `)
      .eq('id', messageId)
      .single();

    if (error) {
      console.error('Error fetching new message:', error);
      return;
    }

    if (data) {
      setMessages(prev => [...prev, data]);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !session?.user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('space_chat_messages')
        .insert({
          space_id: spaceId,
          user_id: session.user.id,
          content: message.trim()
        });

      if (error) throw error;

      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-64 border-t bg-background">
      <div className="p-2 border-b">
        <h3 className="text-sm font-medium">Chat</h3>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={msg.profile?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {msg.profile?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">
                    {msg.profile?.username || 'Unknown'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-foreground break-words">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 text-sm"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            size="sm" 
            disabled={!message.trim() || isLoading}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
