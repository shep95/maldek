import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender: {
    username: string;
    avatar_url: string | null;
  };
}

interface ChatInterfaceProps {
  recipientId: string;
  recipientName: string;
}

export const ChatInterface = ({
  recipientId,
  recipientName,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recipientAvatar, setRecipientAvatar] = useState<string | null>(null);
  const session = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();

  // Fetch recipient's avatar
  useEffect(() => {
    const fetchRecipientProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', recipientId)
        .single();

      if (!error && data) {
        setRecipientAvatar(data.avatar_url);
      }
    };

    fetchRecipientProfile();
  }, [recipientId]);

  const fetchMessages = async () => {
    if (!session?.user?.id) return;

    try {
      console.log('Fetching messages between', session.user.id, 'and', recipientId);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          sender:profiles!messages_sender_id_fkey (
            username,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${session.user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${session.user.id})`)
        .is('removed_by_recipient', false)
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
    
    if (!isSubscribed && session?.user?.id) {
      const channel = supabase
        .channel('chat-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `or(and(sender_id.eq.${session.user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${session.user.id}))`
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

  const handleSendMessage = async (content: string) => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      console.log('Sending message to:', recipientId);

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: session.user.id,
          recipient_id: recipientId,
          content: content.trim(),
          status: 'accepted'
        });

      if (error) throw error;
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = () => {
    navigate(`/@${recipientName}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <ChatHeader
        recipientName={recipientName}
        recipientAvatar={recipientAvatar}
        onViewProfile={handleViewProfile}
      />
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="space-y-4 p-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              timestamp={message.created_at}
              isCurrentUser={message.sender_id === session?.user?.id}
              senderName={message.sender.username}
              senderAvatar={message.sender.avatar_url}
            />
          ))}
        </div>
      </ScrollArea>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};