import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender: {
    username: string;
    avatar_url: string;
  };
}

export const ChatInterface = ({
  recipientId,
  recipientName,
}: {
  recipientId: string;
  recipientName: string;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const fetchMessages = async () => {
    if (!session?.user?.id) return;

    try {
      console.log('Fetching messages for chat with:', recipientId);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          sender:sender_id (
            username,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${session.user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${session.user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log('Fetched messages:', data);
      setMessages(data || []);
      
      // Mark messages as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', session.user.id)
        .eq('sender_id', recipientId)
        .is('read_at', null);

      if (updateError) console.error('Error marking messages as read:', updateError);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    fetchMessages();
    
    if (!isSubscribed) {
      const channel = supabase
        .channel('chat-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${recipientId}`
          },
          (payload) => {
            console.log('New message received:', payload);
            setMessages(prev => [...prev, payload.new as ChatMessage]);
          }
        )
        .subscribe();

      setIsSubscribed(true);
      
      return () => {
        supabase.removeChannel(channel);
        setIsSubscribed(false);
      };
    }
  }, [recipientId, session?.user?.id, isSubscribed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!session?.user?.id || !newMessage.trim()) return;

    try {
      setIsLoading(true);
      console.log('Sending message to:', recipientId);

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: session.user.id,
          recipient_id: recipientId,
          content: newMessage.trim(),
          status: 'accepted'
        });

      if (error) throw error;

      setNewMessage("");
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <ScrollArea ref={scrollRef} className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.sender_id === session?.user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender_id !== session?.user?.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender.avatar_url} alt={message.sender.username} />
                  <AvatarFallback>{message.sender.username[0]}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === session?.user?.id
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs text-muted-foreground block mt-1">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-2 mt-4">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${recipientName}...`}
          className="min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !newMessage.trim()}
          className="px-8"
        >
          Send
        </Button>
      </div>
    </div>
  );
};