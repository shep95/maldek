import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostHeader } from "@/components/dashboard/post/PostHeader";
import { PostMedia } from "@/components/dashboard/post/PostMedia";
import { PostActions } from "@/components/dashboard/post/PostActions";
import { useQuery } from "@tanstack/react-query";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      // Transform the data to match our expected format
      return {
        ...data,
        isLiked: false, // You might want to fetch this from a likes table
        isBookmarked: false, // You might want to fetch this from a bookmarks table
        timestamp: new Date(data.created_at),
        mediaUrls: data.media_urls || []
      };
    },
  });

  const { data: comments, isLoading: isLoadingComments, refetch: refetchComments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Comment[];
    },
  });

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUserId) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment("");
      refetchComments();
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  if (isLoadingPost || isLoadingComments) {
    return <div className="p-4">Loading...</div>;
  }

  if (!post) {
    return <div className="p-4">Post not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className="mb-6 p-6">
        <PostHeader 
          author={{
            id: post.author.id,
            username: post.author.username,
            profilePicture: post.author.avatar_url || '',
            name: post.author.username
          }} 
          timestamp={post.timestamp} 
        />
        <p className="mt-4 text-foreground whitespace-pre-wrap">{post.content}</p>
        {post.media_urls && post.media_urls.length > 0 && (
          <PostMedia mediaUrls={post.media_urls} onMediaClick={() => {}} />
        )}
        <PostActions
          postId={post.id}
          likes={post.likes}
          comments={(comments?.length || 0)}
          reposts={post.reposts}
          isLiked={post.isLiked}
          isBookmarked={post.isBookmarked}
          authorId={post.user_id}
          currentUserId={currentUserId || ''}
          onPostAction={() => {}}
        />
      </Card>

      {currentUserId && (
        <div className="mb-6">
          <div className="flex gap-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1"
            />
            <Button onClick={handleSubmitComment}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments?.map((comment) => (
          <Card key={comment.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate(`/profile/${comment.user.username}`)}>
                <AvatarImage src={comment.user.avatar_url || undefined} />
                <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <h4 className="font-semibold cursor-pointer hover:underline" 
                      onClick={() => navigate(`/profile/${comment.user.username}`)}>
                    @{comment.user.username}
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-foreground">{comment.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PostDetail;