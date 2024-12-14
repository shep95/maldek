import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export const useChatMessages = (currentUserId: string | null, recipientId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const fetchMessages = async () => {
    if (!currentUserId) return;

    try {
      console.log('Fetching messages between', currentUserId, 'and', recipientId);
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
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
        .is('removed_by_recipient', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log('Fetched messages:', data);
      setMessages(data || []);
      
      // Mark messages as read
      if (data && data.length > 0) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('recipient_id', currentUserId)
          .eq('sender_id', recipientId)
          .is('read_at', null);

        if (updateError) console.error('Error marking messages as read:', updateError);
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    fetchMessages();
    
    if (!isSubscribed && currentUserId) {
      console.log('Setting up real-time subscription for messages');
      const channel = supabase
        .channel('chat-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `or(and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId}))`
          },
          (payload) => {
            console.log('New message received:', payload);
            setMessages(prev => [...prev, payload.new as ChatMessage]);
          }
        )
        .subscribe();

      setIsSubscribed(true);
      
      return () => {
        console.log('Cleaning up message subscription');
        supabase.removeChannel(channel);
        setIsSubscribed(false);
      };
    }
  }, [currentUserId, recipientId, isSubscribed]);

  const sendMessage = async (content: string) => {
    if (!currentUserId) {
      toast.error("You must be logged in to send messages");
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sending message to:', recipientId);

      const newMessage = {
        sender_id: currentUserId,
        recipient_id: recipientId,
        content: content.trim(),
        status: 'accepted'
      };

      console.log('New message data:', newMessage);

      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
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
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);
      toast.success("Message sent");
      
      // Update local messages state
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error("Failed to send message");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage
  };
};