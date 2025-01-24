import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Comment } from "@/utils/commentUtils"; // Assuming you have a Comment type defined

interface CommentSectionProps {
  postId: string;
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    user: {
      username: string;
      avatar_url: string | null;
    };
  }>;
  currentUserId: string;
}

export const CommentSection = ({
  postId,
  comments,
  currentUserId
}: CommentSectionProps) => {
  const [newComment, setNewComment] = useState<string>("");
  const [commentList, setCommentList] = useState(comments);

  useEffect(() => {
    setCommentList(comments);
  }, [comments]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          post_id: postId,
          user_id: currentUserId
        });

      if (error) throw error;

      setNewComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium">Comments</h3>
      <form onSubmit={handleCommentSubmit} className="mt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="mt-2 btn">
          Add Comment
        </button>
      </form>
      <div className="mt-4">
        {commentList.map((comment) => (
          <div key={comment.id} className="border-b py-2">
            <div className="flex items-center">
              {comment.user.avatar_url && (
                <img
                  src={comment.user.avatar_url}
                  alt={comment.user.username}
                  className="h-8 w-8 rounded-full mr-2"
                />
              )}
              <span className="font-semibold">{comment.user.username}</span>
            </div>
            <p className="mt-1">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
