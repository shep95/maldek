import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "@/types/messages";

export const useChatMessages = (currentUserId: string | null, recipientId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
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
          recipient_id,
          read_at,
          status,
          reply_to_id,
          media_urls,
          reactions,
          translated_content,
          is_edited,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            avatar_url,
            follower_count
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
      
      // Transform the data to match the Message type
      const transformedMessages: Message[] = data.map(msg => ({
        ...msg,
        reactions: msg.reactions as { [key: string]: string[] },
        translated_content: msg.translated_content as { [key: string]: string }
      }));
      
      setMessages(transformedMessages);
      
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
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `or(and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId}))`
          },
          (payload) => {
            console.log('Message update received:', payload);
            fetchMessages(); // Refresh messages on any change
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

  const sendMessage = async (content: string, replyToId?: string) => {
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
        status: 'sent',
        reply_to_id: replyToId
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
          recipient_id,
          read_at,
          status,
          reply_to_id,
          media_urls,
          reactions,
          translated_content,
          is_edited,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            avatar_url,
            follower_count
          )
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);
      toast.success("Message sent");
      
      // Transform the new message to match the Message type
      const transformedMessage: Message = {
        ...data,
        reactions: data.reactions as { [key: string]: string[] },
        translated_content: data.translated_content as { [key: string]: string }
      };
      
      // Update local messages state
      setMessages(prev => [...prev, transformedMessage]);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error("Failed to send message");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating message status:', error);
      toast.error("Failed to update message status");
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    updateMessageStatus
  };
};