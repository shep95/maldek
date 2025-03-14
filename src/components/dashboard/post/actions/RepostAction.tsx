
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createNotification } from "../utils/notificationUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface RepostActionProps {
  postId: string;
  authorId: string;
  currentUserId: string;
  reposts: number;
  onAction: (postId: string, action: 'repost') => void;
}

export const RepostAction = ({ postId, authorId, currentUserId, reposts: initialReposts, onAction }: RepostActionProps) => {
  const [repostCount, setRepostCount] = useState(initialReposts);

  // Update local state when props change
  useEffect(() => {
    setRepostCount(initialReposts);
  }, [initialReposts]);

  // Set up real-time subscription for reposts
  useEffect(() => {
    console.log('Setting up real-time repost subscription for post:', postId);
    
    const channel = supabase
      .channel(`post-reposts-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`
        },
        async (payload) => {
          if (payload.new && typeof payload.new.reposts === 'number') {
            console.log('Received repost update for post:', postId, payload.new.reposts);
            setRepostCount(payload.new.reposts);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up repost subscription');
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!currentUserId) {
        toast.error('Please sign in to share this post');
        return;
      }

      // Generate the post URL
      const postUrl = `${window.location.origin}/post/${postId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(postUrl);
      
      // Update the repost count in the database
      const { error: repostError } = await supabase
        .from('posts')
        .update({ reposts: repostCount + 1 })
        .eq('id', postId);
      
      if (repostError) throw repostError;
      
      // Only create notification if author is not the current user
      if (authorId !== currentUserId) {
        await createNotification(authorId, currentUserId, postId, 'repost');
      }
      
      // Optimistically update UI
      setRepostCount(prev => prev + 1);
      
      onAction(postId, 'repost');
      toast.success('Post link copied to clipboard');
    } catch (error) {
      console.error('Error handling share:', error);
      toast.error('Failed to share post');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2"
      onClick={handleRepost}
    >
      <Share2 className="h-4 w-4" />
      <AnimatedCounter value={repostCount} />
    </Button>
  );
};
