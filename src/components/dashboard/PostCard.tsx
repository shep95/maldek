import { useNavigate } from "react-router-dom";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostActions } from "./post/PostActions";
import { PostMedia } from "./post/PostMedia";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Post } from "@/utils/postUtils";
import { useState } from "react";
import { EditControls } from "./post/EditControls";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
  onMediaClick?: (url: string) => void;
}

export const PostCard = ({ post, currentUserId, onPostAction, onMediaClick }: PostCardProps) => {
  const navigate = useNavigate();
  const { data: userSettings } = useUserSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);

  const handlePostClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('textarea') ||
      isEditing
    ) {
      return;
    }
    console.log('Navigating to post:', post.id);
    navigate(`/post/${post.id}`);
  };

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/@${post.author.username}`);
  };

  const handleEdit = async () => {
    try {
      setIsSaving(true);
      console.log('Updating post:', post.id, 'with content:', editedContent);
      
      const { error } = await supabase
        .from('posts')
        .update({ content: editedContent })
        .eq('id', post.id)
        .eq('user_id', currentUserId);

      if (error) throw error;

      toast.success('Post updated successfully');
      setIsEditing(false);
      // Update the local post content
      post.content = editedContent;
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    } finally {
      setIsSaving(false);
    }
  };

  const canEdit = currentUserId === post.author.id;

  return (
    <div 
      id={`post-${post.id}`} // Add ID for scroll targeting
      className={cn(
        "p-6 rounded-lg border border-muted bg-card/50 backdrop-blur-sm space-y-4 transition-all duration-300", // Added transition
        !isEditing && "cursor-pointer hover:bg-accent/5 transition-colors duration-200"
      )}
      onClick={handlePostClick}
    >
      <PostHeader 
        author={post.author} 
        timestamp={post.timestamp} 
        onUsernameClick={handleUsernameClick}
        canEdit={canEdit}
        isEditing={isEditing}
        onEditClick={() => setIsEditing(true)}
      />
      <PostContent 
        content={post.content} 
        userLanguage={userSettings?.preferred_language || 'en'}
        isEditing={isEditing}
        editedContent={editedContent}
        onEditContentChange={setEditedContent}
        truncate={true}
      />
      {post.media_urls && post.media_urls.length > 0 && (
        <PostMedia 
          mediaUrls={post.media_urls} 
          onMediaClick={onMediaClick}
        />
      )}
      {isEditing ? (
        <EditControls
          onCancel={() => {
            setIsEditing(false);
            setEditedContent(post.content);
          }}
          onSave={handleEdit}
          isSaving={isSaving}
        />
      ) : (
        <PostActions
          post={post}
          currentUserId={currentUserId}
          onAction={onPostAction}
        />
      )}
    </div>
  );
};