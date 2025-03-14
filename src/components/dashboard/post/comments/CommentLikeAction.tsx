
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { createNotification } from "../utils/notificationUtils";
import { toast } from "sonner";
import { AnimatedCounter } from "@/components/ui/animated-counter";

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

  // Set up real-time subscription for comment likes
  useEffect(() => {
    console.log('Setting up real-time comment like subscription for comment:', commentId);
    
    const channel = supabase
      .channel(`comment-likes-${commentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_likes',
          filter: `comment_id=eq.${commentId}`
        },
        async () => {
          console.log('Received like update for comment:', commentId);
          
          // Get current like count
          const { count } = await supabase
            .from('comment_likes')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', commentId);
            
          console.log('Updated comment like count:', count);
          setLikes(count || 0);
          
          // Update isLiked status for current user
          const { data: userLike } = await supabase
            .from('comment_likes')
            .select('id')
            .eq('comment_id', commentId)
            .eq('user_id', currentUserId)
            .single();
            
          setIsLiked(!!userLike);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up comment like subscription');
      supabase.removeChannel(channel);
    };
  }, [commentId, currentUserId]);

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
      <AnimatedCounter value={likes} />
    </Button>
  );
};
