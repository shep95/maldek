import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Comment } from "@/utils/commentUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentCard } from "../comments/CommentCard";
import { useQueryClient } from "@tanstack/react-query";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId: string;
}

export const CommentSection = ({
  postId,
  comments,
  currentUserId
}: CommentSectionProps) => {
  const [newComment, setNewComment] = useState<string>("");
  const [commentList, setCommentList] = useState(comments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setCommentList(comments);
  }, [comments]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    console.log("Submitting comment...");

    try {
      const { error, data } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          post_id: postId,
          user_id: currentUserId
        })
        .select(`
          id,
          content,
          created_at,
          parent_id,
          user:profiles (
            id,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error("Error adding comment:", error);
        throw error;
      }

      console.log("Comment added successfully:", data);

      // Optimistically update the UI
      const newCommentObj = data as Comment;
      setCommentList(prevComments => [...prevComments, newCommentObj]);
      
      // Clear the input
      setNewComment("");
      
      // Invalidate the comments query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-lg font-medium text-gray-100">Comments</h3>
      <form onSubmit={handleCommentSubmit} className="space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[100px] bg-[#151515] border-[#222226] text-gray-200 placeholder:text-gray-500 focus:ring-orange-500 rounded-lg"
        />
        <Button 
          type="submit" 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          disabled={!newComment.trim() || isSubmitting}
        >
          {isSubmitting ? "Adding Comment..." : "Add Comment"}
        </Button>
      </form>
      <div className="space-y-4">
        {commentList.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            userLanguage="en"
            level={0}
            replies={[]}
          />
        ))}
      </div>
    </div>
  );
};