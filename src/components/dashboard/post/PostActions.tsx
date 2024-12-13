import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Bookmark, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostActionsProps {
  postId: string;
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isBookmarked: boolean;
  authorId: string;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
}

const createNotification = async (
  recipientId: string,
  actorId: string,
  postId: string,
  type: 'like' | 'comment' | 'share' | 'bookmark' | 'repost'
) => {
  if (recipientId === actorId) return;

  const { error } = await supabase
    .from('notifications')
    .insert({
      recipient_id: recipientId,
      actor_id: actorId,
      post_id: postId,
      type
    });

  if (error) {
    console.error('Error creating notification:', error);
    toast.error('Failed to create notification');
  }
};

export const PostActions = ({
  postId,
  likes,
  comments,
  reposts,
  isLiked,
  isBookmarked,
  authorId,
  currentUserId,
  onPostAction,
}: PostActionsProps) => {
  const handleAction = async (action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    try {
      if (!currentUserId) {
        toast.error('Please sign in to interact with posts');
        return;
      }

      switch (action) {
        case 'like':
          const { error: likeError } = await supabase
            .from('post_likes')
            .upsert({ 
              user_id: currentUserId,
              post_id: postId
            });
          
          if (likeError) throw likeError;
          break;

        case 'bookmark':
          const { error: bookmarkError } = await supabase
            .from('bookmarks')
            .upsert({
              user_id: currentUserId,
              post_id: postId
            });
          
          if (bookmarkError) throw bookmarkError;
          break;

        case 'repost':
          const { error: repostError } = await supabase
            .from('posts')
            .update({ reposts: reposts + 1 })
            .eq('id', postId);
          
          if (repostError) throw repostError;
          break;

        case 'delete':
          const { error: deleteError } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);
          
          if (deleteError) throw deleteError;
          break;
      }

      // Create notification for the action
      if (action !== 'delete') {
        await createNotification(authorId, currentUserId, postId, action);
      }

      onPostAction(postId, action);
      toast.success(`Post ${action}d successfully`);
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} post`);
    }
  };

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex gap-4">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
          onClick={() => handleAction('like')}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          {likes}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {comments}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => handleAction('repost')}
        >
          <Share2 className="h-4 w-4" />
          {reposts}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${isBookmarked ? 'text-blue-500' : ''}`}
          onClick={() => handleAction('bookmark')}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
      </div>
      {authorId === currentUserId && (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600"
          onClick={() => handleAction('delete')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};