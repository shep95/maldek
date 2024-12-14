import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createNotification } from "../utils/notificationUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface BookmarkActionProps {
  postId: string;
  authorId: string;
  currentUserId: string;
  isBookmarked: boolean;
  onAction: (postId: string, action: 'bookmark') => void;
}

export const BookmarkAction = ({ postId, authorId, currentUserId, isBookmarked, onAction }: BookmarkActionProps) => {
  const queryClient = useQueryClient();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!currentUserId) {
        toast.error('Please sign in to bookmark posts');
        return;
      }

      if (isBookmarked) {
        const { error: unbookmarkError } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', currentUserId)
          .eq('post_id', postId);
        
        if (unbookmarkError) throw unbookmarkError;
      } else {
        const { error: bookmarkError } = await supabase
          .from('bookmarks')
          .insert({
            user_id: currentUserId,
            post_id: postId
          });
        
        if (bookmarkError) throw bookmarkError;
        await createNotification(authorId, currentUserId, postId, 'bookmark');
      }

      // Invalidate posts query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      onAction(postId, 'bookmark');
      toast.success(`Post ${isBookmarked ? 'unbookmarked' : 'bookmarked'} successfully`);
    } catch (error) {
      console.error('Error handling bookmark:', error);
      toast.error('Failed to bookmark post');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-2 ${isBookmarked ? 'text-blue-500' : ''}`}
      onClick={handleBookmark}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
    </Button>
  );
};