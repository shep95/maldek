import { Card } from "@/components/ui/card";
import { PostHeader } from "./post/PostHeader";
import { PostMedia } from "./post/PostMedia";
import { PostActions } from "./post/PostActions";
import { Post } from "@/utils/postUtils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const checkEditability = () => {
      const now = new Date();
      const postTime = new Date(post.timestamp);
      const diffInMinutes = (now.getTime() - postTime.getTime()) / (1000 * 60);
      setCanEdit(diffInMinutes <= 5 && post.user_id === currentUserId);
    };

    checkEditability();
    const timer = setInterval(checkEditability, 10000); // Check every 10 seconds

    return () => clearInterval(timer);
  }, [post.timestamp, post.user_id, currentUserId]);

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
    // Prevent navigation if clicking on buttons or links
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

  const renderContent = (content: string) => {
    // Split content by spaces and process each part
    return content.split(' ').map((word, index) => {
      if (word.startsWith('@')) {
        const username = word.slice(1); // Remove @ symbol
        return (
          <span key={index}>
            <Button
              variant="link"
              className="p-0 h-auto text-orange-500 font-semibold hover:text-orange-600"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${username}`);
              }}
            >
              {word}
            </Button>
            {' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  return (
    <Card 
      className="border border-muted bg-card/50 backdrop-blur-sm p-6 cursor-pointer hover:bg-accent/5"
      onClick={handlePostClick}
    >
      <div className="space-y-4">
        <PostHeader author={post.author} timestamp={post.timestamp} />
        
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

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(post.content);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-foreground whitespace-pre-wrap">{renderContent(post.content)}</p>
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