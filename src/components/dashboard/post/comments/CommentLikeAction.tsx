
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { createNotification } from "../utils/notificationUtils";
import { toast } from "sonner";

interface CommentLikeActionProps {
  commentId: string;
  authorId: string;
  currentUserId: string;
  initialLikes: number;
  initialIsLiked: boolean;
}

export const CommentLikeAction = ({ 
  commentId, 
  authorId, 
  currentUserId, 
  initialLikes,
  initialIsLiked 
}: CommentLikeActionProps) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUserId) {
      toast.error('Please sign in to like comments');
      return;
    }

    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Optimistically update UI
      const newIsLiked = !isLiked;
      const newLikeCount = isLiked ? likes - 1 : likes + 1;
      
      setIsLiked(newIsLiked);
      setLikes(newLikeCount);

      if (newIsLiked) {
        // Add like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: currentUserId
          });
          
        if (error) throw error;
        
        // Create notification for the comment author
        if (authorId !== currentUserId) {
          await createNotification(authorId, currentUserId, commentId, 'comment_like');
        }
      } else {
        // Remove like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUserId);
          
        if (error) throw error;
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes : likes - 1);
      
      console.error('Error handling comment like:', error);
      toast.error('Failed to like comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-2 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
      onClick={handleLike}
      disabled={isSubmitting}
    >
      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likes}</span>
    </Button>
  );
};
