
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTelegramMessages = (currentUserId: string | null) => {
  return useQuery({
    queryKey: ['telegram_messages', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      console.log('Fetching Telegram messages for user:', currentUserId);
      
      const { data: telegramUser, error: telegramUserError } = await supabase
        .from('telegram_users')
        .select('telegram_id')
        .eq('user_id', currentUserId)
        .single();

      if (telegramUserError) {
        console.error('Error fetching Telegram user:', telegramUserError);
        return [];
      }

      if (!telegramUser) {
        console.log('No Telegram user found');
        return [];
      }

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          telegram_message_id,
          telegram_chat_id,
          sender:sender_id (
            id,
            username,
            avatar_url,
            follower_count
          ),
          recipient:recipient_id (
            id,
            username,
            avatar_url,
            follower_count
          )
        `)
        .eq('telegram_chat_id', telegramUser.telegram_id)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching Telegram messages:', messagesError);
        throw messagesError;
      }

      return messages;
    },
    enabled: !!currentUserId,
  });
};
