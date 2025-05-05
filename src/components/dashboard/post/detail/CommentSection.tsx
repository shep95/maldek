import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { Send, Image } from 'lucide-react';
import { GifPicker } from './GifPicker';
import { useProfileNavigation } from '@/hooks/useProfileNavigation';

interface CommentSectionProps {
  postId: string;
  comments: any[];
  currentUserId: string;
}

export const CommentSection = ({ postId, comments, currentUserId }: CommentSectionProps) => {
  const session = useSession();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const { navigateToProfile } = useProfileNavigation();
  
  const submitComment = async () => {
    if (!session) {
      toast.error('You must be logged in to comment.');
      return;
    }

    if (!commentText.trim() && !selectedGif) {
      toast.error('Comment cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            content: commentText,
            user_id: session.user.id,
            gif_url: selectedGif,
          },
        ])
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

      if (error) {
        console.error('Error submitting comment:', error);
        toast.error('Failed to submit comment.');
        return;
      }

      // Optimistically update the comments list
      queryClient.setQueryData(['comments', postId], (old: any[]) => {
        if (!old) return [data];
        return [...old, data];
      });

      setCommentText('');
      setSelectedGif(null);
      toast.success('Comment submitted successfully!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserClick = (username: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigateToProfile(username, e);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
      
      {session && (
        <div className="flex gap-3 items-start">
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={session.user?.user_metadata?.avatar_url} />
            <AvatarFallback>{session?.user?.email?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="resize-none"
              disabled={isSubmitting}
              rows={2}
            />
            
            {selectedGif && (
              <div className="relative w-48">
                <img src={selectedGif} alt="Selected GIF" className="rounded-md" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm"
                  onClick={() => setSelectedGif(null)}
                >
                  <Image className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowGifPicker(!showGifPicker)}
              >
                <Image className="mr-1 h-4 w-4" />
                GIF
              </Button>
              <Button 
                onClick={submitComment} 
                disabled={isSubmitting || (!commentText.trim() && !selectedGif)}
                size="sm"
              >
                <Send className="mr-1 h-4 w-4" />
                Comment
              </Button>
            </div>
            
            {showGifPicker && (
              <GifPicker 
                onSelect={(gif) => {
                  setSelectedGif(gif);
                  setShowGifPicker(false);
                }}
                onClose={() => setShowGifPicker(false)}
              />
            )}
          </div>
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar 
                className="h-8 w-8 cursor-pointer"
                onClick={(e) => handleUserClick(comment.user.username, e)}
              >
                <AvatarImage src={comment.user.avatar_url} />
                <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleUserClick(comment.user.username, e)}
                    className="font-semibold text-sm hover:underline"
                  >
                    @{comment.user.username}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                {comment.content && <p className="mt-1">{comment.content}</p>}
                
                {comment.gif_url && (
                  <div className="mt-2 max-w-sm">
                    <img 
                      src={comment.gif_url} 
                      alt="GIF" 
                      className="rounded-md max-h-[180px] object-cover w-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};
