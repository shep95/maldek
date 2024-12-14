import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createNotification } from "../utils/notificationUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface LikeActionProps {
  postId: string;
  authorId: string;
  currentUserId: string;
  likes: number;
  isLiked: boolean;
  onAction: (postId: string, action: 'like') => void;
}

export const LikeAction = ({ postId, authorId, currentUserId, likes, isLiked, onAction }: LikeActionProps) => {
  const queryClient = useQueryClient();

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!currentUserId) {
        toast.error('Please sign in to like posts');
        return;
      }

      if (isLiked) {
        const { error: unlikeError } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', currentUserId)
          .eq('post_id', postId);
        
        if (unlikeError) throw unlikeError;

        // Update posts count
        await supabase
          .from('posts')
          .update({ likes: likes - 1 })
          .eq('id', postId);

      } else {
        const { error: likeError } = await supabase
          .from('post_likes')
          .insert({ 
            user_id: currentUserId,
            post_id: postId
          });
        
        if (likeError) throw likeError;

        // Update posts count
        await supabase
          .from('posts')
          .update({ likes: likes + 1 })
          .eq('id', postId);

        // Create notification with UUID post_id
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            recipient_id: authorId,
            actor_id: currentUserId,
            type: 'like',
            post_id: postId // Now this will be properly cast to UUID by Supabase
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
          // Don't throw here to avoid rolling back the like
          toast.error('Failed to create notification');
        }
      }

      // Invalidate posts query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      onAction(postId, 'like');
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error('Failed to like post');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
      onClick={handleLike}
    >
      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likes || 0}</span>
    </Button>
  );
};