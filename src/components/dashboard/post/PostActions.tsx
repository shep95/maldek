import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Bookmark, Trash2 } from "lucide-react";

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
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex gap-4">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
          onClick={() => onPostAction(postId, 'like')}
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
          onClick={() => onPostAction(postId, 'repost')}
        >
          <Share2 className="h-4 w-4" />
          {reposts}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${isBookmarked ? 'text-blue-500' : ''}`}
          onClick={() => onPostAction(postId, 'bookmark')}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
      </div>
      {authorId === currentUserId && (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600"
          onClick={() => onPostAction(postId, 'delete')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};