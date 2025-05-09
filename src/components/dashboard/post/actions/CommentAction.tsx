
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface CommentActionProps {
  postId: string;
  comments: number;
}

export const CommentAction = ({ postId, comments }: CommentActionProps) => {
  const navigate = useNavigate();

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/post/${postId}`);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 hover:bg-accent/10"
      onClick={handleComment}
    >
      <MessageSquare className="h-4 w-4" />
      <AnimatedCounter value={comments || 0} />
    </Button>
  );
};
