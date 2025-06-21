
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { memo } from "react";

interface CommentActionProps {
  postId: string;
  comments: number;
}

export const CommentAction = memo(({ postId, comments }: CommentActionProps) => {
  const navigate = useNavigate();

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate postId to prevent navigation errors
    if (!postId || typeof postId !== 'string') {
      console.error('Invalid postId for navigation:', postId);
      return;
    }
    
    navigate(`/post/${postId}`);
  };

  // Ensure comments is a valid number
  const safeCommentCount = Math.max(0, Number(comments) || 0);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 hover:bg-accent/10"
      onClick={handleComment}
      disabled={!postId}
    >
      <MessageSquare className="h-4 w-4" />
      <AnimatedCounter value={safeCommentCount} />
    </Button>
  );
});

CommentAction.displayName = 'CommentAction';
