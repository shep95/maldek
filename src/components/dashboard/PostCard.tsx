import { Card } from "@/components/ui/card";
import { PostHeader } from "./post/PostHeader";
import { PostMedia } from "./post/PostMedia";
import { PostActions } from "./post/PostActions";
import { Post } from "@/utils/postUtils";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
  onMediaClick: (url: string) => void;
}

export const PostCard = ({ post, currentUserId, onPostAction, onMediaClick }: PostCardProps) => {
  return (
    <Card className="border border-muted bg-card/50 backdrop-blur-sm p-6">
      <PostHeader author={post.author} timestamp={post.timestamp} />
      
      <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>

      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <PostMedia mediaUrls={post.mediaUrls} onMediaClick={onMediaClick} />
      )}

      <PostActions
        postId={post.id}
        likes={post.likes}
        comments={post.comments}
        reposts={post.reposts}
        isLiked={post.isLiked}
        isBookmarked={post.isBookmarked}
        authorId={post.authorId}
        currentUserId={currentUserId}
        onPostAction={onPostAction}
      />
    </Card>
  );
};