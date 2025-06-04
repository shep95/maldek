
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  
  const cleanupRef = useRef(false);
  const currentUserId = session?.user?.id;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current = true;
    };
  }, []);

  // Fetch messages function with stable reference
  const fetchMessages = useCallback(async () => {
    if (!isVisible || !spaceId || cleanupRef.current) return;

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

    if (!cleanupRef.current) {
      setMessages(data || []);
    }
  }, [spaceId, isVisible]);

  // Fetch new message function with stable reference  
  const fetchNewMessage = useCallback(async (messageId: string) => {
    if (cleanupRef.current) return;
    
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

    if (data && !cleanupRef.current) {
      setMessages(prev => {
        // Prevent duplicate messages
        const exists = prev.some(msg => msg.id === data.id);
        return exists ? prev : [...prev, data];
      });
    }
  }, []);

  // Fetch existing messages only when needed
  useEffect(() => {
    if (isVisible) {
      fetchMessages();
    }
  }, [fetchMessages, isVisible]);

  // Subscribe to new messages with optimized handling
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
          if (!cleanupRef.current) {
            console.log('New chat message:', payload);
            fetchNewMessage(payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spaceId, isVisible, fetchNewMessage]);

  // Send message handler with stable reference
  const handleSend = useCallback(async () => {
    if (!message.trim() || !currentUserId || isLoading || cleanupRef.current) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('space_chat_messages')
        .insert({
          space_id: spaceId,
          user_id: currentUserId,
          content: message.trim()
        });

      if (error) throw error;

      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      if (!cleanupRef.current) {
        toast.error('Failed to send message');
      }
    } finally {
      if (!cleanupRef.current) {
        setIsLoading(false);
      }
    }
  }, [message, currentUserId, spaceId, isLoading]);

  // Key press handler with stable reference
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Memoize rendered messages to prevent unnecessary re-renders
  const renderedMessages = useMemo(() => {
    return messages.map((msg) => (
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
    ));
  }, [messages]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-64 border-t bg-background">
      <div className="p-2 border-b">
        <h3 className="text-sm font-medium">Chat</h3>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {renderedMessages}
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
