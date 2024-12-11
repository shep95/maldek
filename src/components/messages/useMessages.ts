import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/messages";

export const useMessages = (currentUserId: string | null) => {
  return useQuery({
    queryKey: ['messages', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          status,
          sender:sender_id(
            username,
            avatar_url,
            follower_count
          )
        `)
        .eq('recipient_id', currentUserId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!currentUserId,
  });
};

export const useMessageRequests = (currentUserId: string | null) => {
  return useQuery({
    queryKey: ['message_requests', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          status,
          sender:sender_id(
            username,
            avatar_url,
            follower_count
          )
        `)
        .eq('recipient_id', currentUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!currentUserId,
  });
};