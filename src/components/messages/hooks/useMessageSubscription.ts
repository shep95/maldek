
import { supabase } from "@/integrations/supabase/client";

export const useMessageSubscription = (fetchMessages: () => void) => {
  const handleSubscription = () => {
    console.log('Setting up real-time subscription for messages');
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Message update received:', payload);
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up message subscription');
      supabase.removeChannel(channel);
    };
  };

  return { handleSubscription };
};
