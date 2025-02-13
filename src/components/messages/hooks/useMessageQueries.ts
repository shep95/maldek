
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/messages";
import { Dispatch, SetStateAction } from "react";

export const useMessageQueries = (
  currentUserId: string | null, 
  recipientId: string,
  setMessages: Dispatch<SetStateAction<Message[]>>
) => {
  const fetchMessages = async () => {
    if (!currentUserId) return;

    try {
      console.log('Fetching messages between', currentUserId, 'and', recipientId);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
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

      if (error) throw error;
      
      console.log('Fetched messages:', data);
      setMessages(data as Message[]);
      
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
      throw error;
    }
  };

  return { fetchMessages };
};
