
import { Card } from "@/components/ui/card";
import { PostHeader } from "../PostHeader";
import { PostMedia } from "../PostMedia";
import { PostActions } from "../PostActions";
import { useNavigate } from "react-router-dom";
import { Post } from "@/utils/postUtils";
import { PostText } from "../content/PostText";

interface PostDetailContentProps {
  post: Post;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
}

export const PostDetailContent = ({ 
  post, 
  currentUserId,
  onPostAction 
}: PostDetailContentProps) => {
  const navigate = useNavigate();

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const username = post.author.username;
    console.log("Navigating to user profile:", username);
    navigate(`/@${username}`);
  };

  return (
    <Card className="mb-6 p-6">
      <PostHeader 
        author={post.author}
        timestamp={post.timestamp}
        onUsernameClick={handleUsernameClick}
      />
      <div className="mt-4">
        <PostText 
          content={post.content} 
          truncate={false} 
          isEdited={post.is_edited}
          originalContent={post.original_content}
        />
      </div>
      {post.media_urls && post.media_urls.length > 0 && (
        <PostMedia mediaUrls={post.media_urls} onMediaClick={() => {}} />
      )}
      <PostActions
        post={post}
        currentUserId={currentUserId}
        onAction={onPostAction}
      />
    </Card>
  );
};
