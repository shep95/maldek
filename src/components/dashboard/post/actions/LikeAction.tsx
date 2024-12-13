import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createNotification } from "../utils/notificationUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LikeActionProps {
  postId: string;
  authorId: string;
  currentUserId: string;
  likes: number;
  isLiked: boolean;
  onAction: (postId: string, action: 'like') => void;
}

export const LikeAction = ({ postId, authorId, currentUserId, likes, isLiked, onAction }: LikeActionProps) => {
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
      } else {
        const { error: likeError } = await supabase
          .from('post_likes')
          .insert({ 
            user_id: currentUserId,
            post_id: postId
          });
        
        if (likeError) throw likeError;
        await createNotification(authorId, currentUserId, postId, 'like');
      }

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