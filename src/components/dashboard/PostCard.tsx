import { useNavigate } from "react-router-dom";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostActions } from "./post/PostActions";
import { PostMedia } from "./post/PostMedia";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Post } from "@/utils/postUtils";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
  onMediaClick?: (url: string) => void;
}

export const PostCard = ({ post, currentUserId, onPostAction, onMediaClick }: PostCardProps) => {
  const navigate = useNavigate();
  const { data: userSettings } = useUserSettings();

  const handlePostClick = () => {
    console.log('PostCard - Clicking post:', post.id);
    navigate(`/post/${post.id}`);
  };

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent post click
    try {
      const username = post.author.username;
      console.log('PostCard - Username click:', username);
      console.log('PostCard - Author data:', post.author);
      
      if (!username) {
        console.error('PostCard - No username available for navigation');
        toast.error('Unable to navigate to profile: Username not found');
        return;
      }

      const profilePath = `/@${username}`;
      console.log('PostCard - Navigating to profile path:', profilePath);
      navigate(profilePath);
    } catch (error) {
      console.error('PostCard - Error during profile navigation:', error);
      toast.error('Failed to navigate to profile');
    }
  };

  return (
    <div 
      className="p-6 rounded-lg border border-muted bg-card/50 backdrop-blur-sm space-y-4 cursor-pointer hover:bg-accent/5 transition-colors duration-200"
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
      {post.media_urls && post.media_urls.length > 0 && (
        <PostMedia 
          mediaUrls={post.media_urls} 
          onMediaClick={onMediaClick}
        />
      )}
      <PostActions
        post={post}
        currentUserId={currentUserId}
        onAction={onPostAction}
      />
    </div>
  );
};