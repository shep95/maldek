import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostHeader } from "@/components/dashboard/post/PostHeader";
import { PostMedia } from "@/components/dashboard/post/PostMedia";
import { PostActions } from "@/components/dashboard/post/PostActions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createNotification } from "@/components/dashboard/post/utils/notificationUtils";
import { CommentCard } from "@/components/dashboard/post/comments/CommentCard";

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userLanguage, setUserLanguage] = useState<string>('en');
  const queryClient = useQueryClient();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      if (user?.id) {
        const { data, error } = await supabase
          .from('user_settings')
          .select('preferred_language')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setUserLanguage(data.preferred_language);
        }
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!postId) return;

    console.log('Subscribing to comments for post:', postId);
    const channel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          console.log('Received comment update:', payload);
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from comments channel');
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      console.log('Fetching post details:', postId);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        throw error;
      }

      console.log('Post details fetched:', data);
      return {
        ...data,
        isLiked: false,
        isBookmarked: false,
        timestamp: new Date(data.created_at),
        mediaUrls: data.media_urls || []
      };
    },
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      console.log('Fetching comments for post:', postId);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      console.log('Comments fetched:', data);
      return data;
    },
  });

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

      // Create notification for post author
      if (post?.author?.id && post.author.id !== currentUserId) {
        await createNotification(
          post.author.id,
          currentUserId,
          postId,
          'comment'
        );
      }

      setNewComment("");
      toast.success("Comment added successfully");
      
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  if (isLoadingPost || isLoadingComments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold">Post not found</h2>
        <Button 
          variant="ghost" 
          className="mt-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>
      </div>
    );
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
            avatar_url: post.author.avatar_url,
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
    </div>
  );
};

export default PostDetail;
