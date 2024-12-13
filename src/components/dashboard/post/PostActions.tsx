import { LikeAction } from "./actions/LikeAction";
import { CommentAction } from "./actions/CommentAction";
import { RepostAction } from "./actions/RepostAction";
import { BookmarkAction } from "./actions/BookmarkAction";
import { DeleteAction } from "./actions/DeleteAction";

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
        <LikeAction
          postId={postId}
          authorId={authorId}
          currentUserId={currentUserId}
          likes={likes}
          isLiked={isLiked}
          onAction={onPostAction}
        />

        <CommentAction
          postId={postId}
          comments={comments}
        />

        <RepostAction
          postId={postId}
          authorId={authorId}
          currentUserId={currentUserId}
          reposts={reposts}
          onAction={onPostAction}
        />

        <BookmarkAction
          postId={postId}
          authorId={authorId}
          currentUserId={currentUserId}
          isBookmarked={isBookmarked}
          onAction={onPostAction}
        />
      </div>

      <DeleteAction
        postId={postId}
        authorId={authorId}
        currentUserId={currentUserId}
        onAction={onPostAction}
      />
    </div>
  );
};