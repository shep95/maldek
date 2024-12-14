import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/messages";

export const useMessages = (currentUserId: string | null) => {
  return useQuery({
    queryKey: ['messages', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      console.log('Fetching messages for user:', currentUserId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          status,
          removed_by_recipient,
          sender:sender_id (
            id,
            username,
            avatar_url,
            follower_count
          )
        `)
        .or(`recipient_id.eq.${currentUserId},sender_id.eq.${currentUserId}`)
        .eq('status', 'accepted')
        .is('removed_by_recipient', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log('Messages fetched:', data);
      return data as unknown as Message[];
    },
    enabled: !!currentUserId,
  });
};

export const useMessageRequests = (currentUserId: string | null) => {
  return useQuery({
    queryKey: ['message_requests', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      console.log('Fetching message requests for user:', currentUserId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          status,
          read_at,
          sender:sender_id (
            id,
            username,
            avatar_url,
            follower_count
          )
        `)
        .eq('recipient_id', currentUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching message requests:', error);
        throw error;
      }
      
      console.log('Message requests fetched:', data);
      return data as unknown as Message[];
    },
    enabled: !!currentUserId,
  });
};