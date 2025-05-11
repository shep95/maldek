
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

export const useMessageNotificationCount = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const session = useSession();
  const currentUserId = session?.user?.id;

  useEffect(() => {
    if (!currentUserId) return;

    // Initial fetch of unread messages
    const fetchUnreadCount = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("id")
          .eq("recipient_id", currentUserId)
          .eq("is_read", false);

        if (error) {
          console.error("Error fetching unread messages:", error);
          return;
        }

        setUnreadCount(data?.length || 0);
      } catch (error) {
        console.error("Error in unread messages query:", error);
      }
    };

    fetchUnreadCount();

    // Subscribe to real-time updates for new messages
    const subscription = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${currentUserId}`
        },
        (payload) => {
          // New message received, increase unread count
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${currentUserId} AND is_read=eq.true`
        },
        () => {
          // Message marked as read, refresh the count
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUserId]);

  return unreadCount;
};
