import { Button } from "@/components/ui/button";
import { LikeAction } from "./actions/LikeAction";
import { CommentAction } from "./actions/CommentAction";
import { RepostAction } from "./actions/RepostAction";
import { BookmarkAction } from "./actions/BookmarkAction";
import { DeleteAction } from "./actions/DeleteAction";
import { Post } from "@/utils/postUtils";

interface PostActionsProps {
  post: Post;
  currentUserId: string;
  onAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
}

export const PostActions = ({ post, currentUserId, onAction }: PostActionsProps) => {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex gap-4">
        <LikeAction
          postId={post.id}
          authorId={post.author.id}
          currentUserId={currentUserId}
          likes={post.likes || 0}
          isLiked={post.isLiked}
          onAction={onAction}
        />

        <CommentAction
          postId={post.id}
          comments={post.comments}
        />

        <RepostAction
          postId={post.id}
          authorId={post.author.id}
          currentUserId={currentUserId}
          reposts={post.reposts || 0}
          onAction={onAction}
        />

        <BookmarkAction
          postId={post.id}
          authorId={post.author.id}
          currentUserId={currentUserId}
          isBookmarked={post.isBookmarked}
          onAction={onAction}
        />
      </div>

      <DeleteAction
        postId={post.id}
        authorId={post.author.id}
        currentUserId={currentUserId}
        onAction={onAction}
      />
    </div>
  );
};
