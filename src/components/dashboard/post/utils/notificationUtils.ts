import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createNotification = async (
  recipientId: string,
  actorId: string,
  postId: string,
  type: 'like' | 'comment' | 'share' | 'bookmark' | 'repost'
) => {
  if (recipientId === actorId) return;

  try {
    console.log('Creating notification:', { recipientId, actorId, postId, type });
    const { error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: recipientId,
        actor_id: actorId,
        post_id: postId,
        type
      });

    if (error) throw error;
    console.log('Notification created successfully');
  } catch (error) {
    console.error('Error creating notification:', error);
    toast.error('Failed to create notification');
  }
};