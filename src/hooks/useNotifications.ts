import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

export type Notification = {
  id: string;
  recipient_id: string;
  actor_id: string;
  actor: {
    username: string;
    avatar_url: string | null;
  };
  post_id: string;
  type: 'like' | 'comment' | 'share' | 'bookmark' | 'repost';
  read: boolean;
  created_at: string;
};

export const useNotifications = (userId: string | null) => {
  const fetchNotifications = async () => {
    if (!userId) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey(
          username,
          avatar_url
        )
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  };

  const { data, refetch } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: fetchNotifications,
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          toast.success("You have a new notification!");
          refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, refetch]);

  return { notifications: data || [] };
};