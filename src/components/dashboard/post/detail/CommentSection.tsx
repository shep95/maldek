import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { CommentCard } from "../comments/CommentCard";
import { createNotification } from "../utils/notificationUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: string;
  postAuthorId: string;
  currentUserId: string | null;
  comments: any[];
  userLanguage: string;
  onCommentAdded: () => void;
}

export const CommentSection = ({
  postId,
  postAuthorId,
  currentUserId,
  comments,
  userLanguage,
  onCommentAdded
}: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUserId || !postId) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      console.log('Submitting new comment:', { postId, userId: currentUserId, content: newComment });
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: newComment.trim()
        });

      if (error) throw error;

      if (postAuthorId && postAuthorId !== currentUserId) {
        await createNotification(
          postAuthorId,
          currentUserId,
          postId,
          'comment'
        );
      }

      setNewComment("");
      toast.success("Comment added successfully");
      onCommentAdded();
      
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  return (
    <>
      {currentUserId && (
        <div className="mb-6">
          <div className="flex gap-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <Button onClick={handleSubmitComment}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments?.map((comment) => (
          <CommentCard 
            key={comment.id} 
            comment={comment}
            userLanguage={userLanguage}
          />
        ))}
      </div>
    </>
  );
};