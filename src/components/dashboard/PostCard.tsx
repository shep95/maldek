import { useNavigate } from "react-router-dom";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostActions } from "./post/PostActions";
import { PostMedia } from "./post/PostMedia";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Post } from "@/utils/postUtils";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost' | 'quote') => void;
  onMediaClick?: (url: string) => void;
  isQuotedPost?: boolean;
}

export const PostCard = ({ 
  post, 
  currentUserId, 
  onPostAction, 
  onMediaClick,
  isQuotedPost = false 
}: PostCardProps) => {
  const navigate = useNavigate();
  const { data: userSettings } = useUserSettings();

  const handlePostClick = () => {
    if (!isQuotedPost) {
      console.log('Navigating to post:', post.id);
      navigate(`/post/${post.id}`);
    }
  };

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Navigating to profile:', post.author.username);
    navigate(`/@${post.author.username}`);
  };

  return (
    <div 
      className={cn(
        "p-6 rounded-lg border border-muted bg-card/50 backdrop-blur-sm space-y-4",
        !isQuotedPost && "cursor-pointer hover:bg-accent/5 transition-colors duration-200"
      )}
      onClick={handlePostClick}
    >
      <PostHeader 
        author={post.author} 
        timestamp={post.timestamp} 
        onUsernameClick={handleUsernameClick}
      />
      <PostContent 
        content={post.content} 
        userLanguage={userSettings?.preferred_language || 'en'}
        isEditing={false}
      />
      {post.quoted_post && (
        <div className="mt-4 border border-border rounded-lg">
          <PostCard
            post={post.quoted_post}
            currentUserId={currentUserId}
            onPostAction={onPostAction}
            isQuotedPost={true}
          />
        </div>
      )}
      {post.media_urls && post.media_urls.length > 0 && (
        <PostMedia 
          mediaUrls={post.media_urls} 
          onMediaClick={onMediaClick}
        />
      )}
      {!isQuotedPost && (
        <PostActions
          post={post}
          currentUserId={currentUserId}
          onAction={onPostAction}
        />
      )}
    </div>
  );
};