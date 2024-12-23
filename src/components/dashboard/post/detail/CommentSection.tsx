import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentCard } from "../comments/CommentCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Organize comments into a tree structure
  const organizeComments = (comments: any[]) => {
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First pass: Create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: Organize into tree structure
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.parent_id) {
        const parentComment = commentMap.get(comment.parent_id);
        if (parentComment) {
          parentComment.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!currentUserId) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: content.trim(),
          post_id: postId,
          user_id: currentUserId,
          parent_id: parentId || null
        });

      if (error) throw error;

      // Clear input if this is a new top-level comment
      if (!parentId) {
        setNewComment("");
      }

      // Refresh comments
      onCommentAdded();
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });

      // Create notification for post author if it's not their own comment
      if (currentUserId !== postAuthorId) {
        await supabase
          .from('notifications')
          .insert({
            recipient_id: postAuthorId,
            actor_id: currentUserId,
            type: 'comment',
            post_id: postId
          });
      }

      // If this is a reply, also notify the parent comment author
      if (parentId) {
        const parentComment = comments.find(c => c.id === parentId);
        if (parentComment && parentComment.user.id !== currentUserId) {
          await supabase
            .from('notifications')
            .insert({
              recipient_id: parentComment.user.id,
              actor_id: currentUserId,
              type: 'comment',
              post_id: postId
            });
        }
      }

    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const organizedComments = organizeComments(comments);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button
            onClick={() => handleSubmitComment(newComment)}
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {organizedComments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            userLanguage={userLanguage}
            onReplySubmit={handleSubmitComment}
            replies={comment.replies}
          />
        ))}
      </div>
    </div>
  );
};