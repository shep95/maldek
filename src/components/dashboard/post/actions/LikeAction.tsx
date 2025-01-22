import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface LikeActionProps {
  postId: string;
  authorId: string;
  currentUserId: string;
  likes: number;
  isLiked: boolean;
  onAction: (postId: string, action: 'like') => void;
}

export const LikeAction = ({ postId, authorId, currentUserId, likes: initialLikes, isLiked: initialIsLiked, onAction }: LikeActionProps) => {
  const queryClient = useQueryClient();
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  // Subscribe to real-time like updates
  useEffect(() => {
    console.log('Setting up real-time like subscription for post:', postId);
    
    const channel = supabase
      .channel(`post-likes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
          filter: `post_id=eq.${postId}`
        },
        async (payload) => {
          console.log('Received like update:', payload);
          
          // Fetch the current like count
          const { count } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);
            
          console.log('Updated like count:', count);
          setLikeCount(count || 0);
          
          // Update isLiked status for current user
          const { data: userLike } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', currentUserId)
            .single();
            
          setIsLiked(!!userLike);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up like subscription');
      supabase.removeChannel(channel);
    };
  }, [postId, currentUserId]);

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
          .update({ likes: likeCount - 1 })
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
          .update({ likes: likeCount + 1 })
          .eq('id', postId);
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
      <span>{likeCount}</span>
    </Button>
  );
};