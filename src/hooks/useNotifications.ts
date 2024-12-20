import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  type: 'like' | 'comment' | 'share' | 'bookmark' | 'repost' | 'new_follow';
  read: boolean;
  archived: boolean;
  deleted_at: string | null;
  created_at: string;
  priority: 'normal' | 'high' | 'low';
  category: string;
  metadata: Record<string, any>;
};

export const useNotifications = (userId: string | null) => {
  const queryClient = useQueryClient();

  const fetchNotifications = async () => {
    if (!userId) return [];

    console.log('Fetching notifications for user:', userId);

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
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
    
    console.log('Fetched notifications:', data);
    return data as Notification[];
  };

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: fetchNotifications,
    enabled: !!userId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 60000, // Keep data in cache for 1 minute
    refetchOnWindowFocus: true, // Enable refetching on window focus to keep data fresh
  });

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!userId) return;

    console.log('Setting up real-time notifications for user:', userId);

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
          console.log('New notification received:', payload);
          queryClient.invalidateQueries({ 
            queryKey: ['notifications'],
            exact: true
          });
          
          toast.success("You have a new notification!", {
            action: {
              label: "View",
              onClick: () => window.location.href = '/notifications'
            },
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notifications subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return { notifications, isLoading, error };
};