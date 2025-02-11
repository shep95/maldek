
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Comment } from "@/utils/commentUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentCard } from "../comments/CommentCard";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "lucide-react";
import { GifPicker } from "./GifPicker";

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
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const commentMap = new Map();
    const rootComments: Comment[] = [];

    comments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
      
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    setCommentList(rootComments);
  }, [comments]);

  // Set up real-time subscription for comments
  useEffect(() => {
    const channel = supabase
      .channel(`public:comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        async (payload) => {
          console.log('Comment update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the complete comment data including user profile and gif_url
            const { data: newComment, error } = await supabase
              .from('comments')
              .select(`
                id,
                content,
                created_at,
                parent_id,
                gif_url,
                user:profiles (
                  id,
                  username,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('Error fetching new comment:', error);
              return;
            }

            console.log('New comment data:', newComment);

            if (newComment) {
              // Transform the data to match the Comment type
              const formattedComment: Comment = {
                ...newComment,
                user: {
                  id: newComment.user.id,
                  username: newComment.user.username,
                  avatar_url: newComment.user.avatar_url
                },
                replies: []
              };

              // Update the comment list
              setCommentList(prevComments => {
                if (formattedComment.parent_id) {
                  // This is a reply - find the parent and add it
                  return prevComments.map(comment => {
                    if (comment.id === formattedComment.parent_id) {
                      return {
                        ...comment,
                        replies: [...(comment.replies || []), formattedComment]
                      };
                    }
                    return comment;
                  });
                }
                // This is a root comment
                return [...prevComments, formattedComment];
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newComment.trim() && !selectedGif) || isSubmitting) return;

    setIsSubmitting(true);
    console.log("Submitting comment with GIF:", selectedGif);

    try {
      const { error, data } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          post_id: postId,
          user_id: currentUserId,
          gif_url: selectedGif
        })
        .select(`
          id,
          content,
          created_at,
          parent_id,
          gif_url,
          user:profiles (
            id,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      console.log("Comment added successfully:", data);
      
      // Reset form
      setNewComment("");
      setSelectedGif(null);
      setShowGifPicker(false);
      
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (content: string, parentId: string, gifUrl?: string): Promise<void> => {
    if (!content.trim() && !gifUrl) return;

    try {
      console.log("Submitting reply to comment:", { parentId, content, gifUrl });
      const { error } = await supabase
        .from('comments')
        .insert({
          content: content.trim(),
          post_id: postId,
          user_id: currentUserId,
          parent_id: parentId,
          gif_url: gifUrl
        })
        .select(`
          id,
          content,
          created_at,
          parent_id,
          gif_url,
          user:profiles (
            id,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
    } catch (error) {
      console.error("Failed to add reply:", error);
      throw error;
    }
  };

  const handleGifSelect = (gifUrl: string) => {
    console.log("Selected GIF URL:", gifUrl);
    setSelectedGif(gifUrl);
    setShowGifPicker(false);
  };

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-lg font-medium text-gray-100">Comments</h3>
      <form onSubmit={handleCommentSubmit} className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[100px] bg-[#151515] border-[#222226] text-gray-200 placeholder:text-gray-500 focus:ring-orange-500 rounded-lg"
          />
          {selectedGif && (
            <div className="relative">
              <img 
                src={selectedGif} 
                alt="Selected GIF" 
                className="w-32 h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1"
                onClick={() => setSelectedGif(null)}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowGifPicker(!showGifPicker)}
            className="shrink-0"
          >
            <Image className="h-4 w-4" />
          </Button>
          
          <Button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            disabled={(!newComment.trim() && !selectedGif) || isSubmitting}
          >
            {isSubmitting ? "Adding Comment..." : "Add Comment"}
          </Button>
        </div>

        {showGifPicker && (
          <div className="relative z-50">
            <GifPicker onSelect={handleGifSelect} onClose={() => setShowGifPicker(false)} />
          </div>
        )}
      </form>

      <div className="space-y-4">
        {commentList.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            userLanguage="en"
            onReplySubmit={handleReplySubmit}
            level={0}
            replies={comment.replies || []}
          />
        ))}
      </div>
    </div>
  );
};
