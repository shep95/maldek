import { Card } from "@/components/ui/card";
import { PostHeader } from "./post/PostHeader";
import { PostMedia } from "./post/PostMedia";
import { PostActions } from "./post/PostActions";
import { Post } from "@/utils/postUtils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PostContent } from "./post/PostContent";
import { EditControls } from "./post/EditControls";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
  onMediaClick: (url: string) => void;
  onUpdatePost?: (postId: string, newContent: string) => void;
}

export const PostCard = ({ 
  post, 
  currentUserId, 
  onPostAction, 
  onMediaClick,
  onUpdatePost 
}: PostCardProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [canEdit, setCanEdit] = useState(false);
  const [userLanguage, setUserLanguage] = useState<string>('en');

  useEffect(() => {
    const checkEditability = () => {
      const now = new Date();
      const postTime = new Date(post.timestamp);
      const diffInMinutes = (now.getTime() - postTime.getTime()) / (1000 * 60);
      setCanEdit(diffInMinutes <= 5 && post.user_id === currentUserId);
    };

    checkEditability();
    const timer = setInterval(checkEditability, 10000);

    return () => clearInterval(timer);
  }, [post.timestamp, post.user_id, currentUserId]);

  useEffect(() => {
    const fetchUserLanguage = async () => {
      if (!currentUserId) return;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('preferred_language')
        .eq('user_id', currentUserId)
        .single();

      if (error) {
        console.error('Error fetching user language:', error);
        return;
      }

      if (data) {
        setUserLanguage(data.preferred_language);
      }
    };

    fetchUserLanguage();
  }, [currentUserId]);

  const handleSaveEdit = () => {
    if (editedContent.trim() === '') {
      toast.error("Post content cannot be empty");
      return;
    }

    onUpdatePost?.(post.id, editedContent);
    setIsEditing(false);
    toast.success("Post updated successfully");
  };

  const handlePostClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).tagName === 'BUTTON' ||
      (e.target as HTMLElement).tagName === 'A' ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('a')
    ) {
      return;
    }
    navigate(`/post/${post.id}`);
  };

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/@${post.author.username}`);
  };

  return (
    <Card 
      className="border border-muted bg-card/50 backdrop-blur-sm p-6 cursor-pointer hover:bg-accent/5"
      onClick={handlePostClick}
    >
      <div className="space-y-4">
        <div onClick={handleUsernameClick}>
          <PostHeader author={post.author} timestamp={post.timestamp} />
        </div>
        
        {canEdit && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}

        <PostContent
          content={post.content}
          userLanguage={userLanguage}
          isEditing={isEditing}
          editedContent={editedContent}
          onEditContentChange={setEditedContent}
        />

        {isEditing && (
          <EditControls
            onCancel={() => {
              setIsEditing(false);
              setEditedContent(post.content);
            }}
            onSave={handleSaveEdit}
          />
        )}

        {post.media_urls && post.media_urls.length > 0 && (
          <PostMedia mediaUrls={post.media_urls} onMediaClick={onMediaClick} />
        )}

        <PostActions
          postId={post.id}
          likes={post.likes}
          comments={post.comments}
          reposts={post.reposts}
          isLiked={post.isLiked}
          isBookmarked={post.isBookmarked}
          authorId={post.user_id}
          currentUserId={currentUserId}
          onPostAction={onPostAction}
        />
      </div>
    </Card>
  );
};