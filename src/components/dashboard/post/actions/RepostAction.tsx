
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createNotification } from "../utils/notificationUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RepostActionProps {
  postId: string;
  authorId: string;
  currentUserId: string;
  reposts: number;
  onAction: (postId: string, action: 'repost') => void;
}

export const RepostAction = ({ postId, authorId, currentUserId, reposts, onAction }: RepostActionProps) => {
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
        .update({ reposts: reposts + 1 })
        .eq('id', postId);
      
      if (repostError) throw repostError;
      
      // Only create notification if author is not the current user
      if (authorId !== currentUserId) {
        await createNotification(authorId, currentUserId, postId, 'repost');
      }
      
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
      <span>{reposts || 0}</span>
    </Button>
  );
};
