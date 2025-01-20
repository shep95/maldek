import { Share2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createNotification } from "../utils/notificationUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { QuotePostDialog } from "../QuotePostDialog";
import { useSession } from "@supabase/auth-helpers-react";

interface RepostActionProps {
  postId: string;
  authorId: string;
  currentUserId: string;
  reposts: number;
  onAction: (postId: string, action: 'repost' | 'quote') => void;
}

export const RepostAction = ({ postId, authorId, currentUserId, reposts, onAction }: RepostActionProps) => {
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const session = useSession();
  
  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!currentUserId) {
        toast.error('Please sign in to repost');
        return;
      }

      const { error: repostError } = await supabase
        .from('posts')
        .update({ reposts: reposts + 1 })
        .eq('id', postId);
      
      if (repostError) throw repostError;
      await createNotification(authorId, currentUserId, postId, 'repost');
      onAction(postId, 'repost');
      toast.success('Post reposted successfully');
    } catch (error) {
      console.error('Error handling repost:', error);
      toast.error('Failed to repost');
    }
  };

  const handleQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) {
      toast.error('Please sign in to quote');
      return;
    }
    setShowQuoteDialog(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span>{reposts || 0}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleRepost}>
            <Share2 className="h-4 w-4 mr-2" />
            Repost
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleQuote}>
            <Quote className="h-4 w-4 mr-2" />
            Quote Post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showQuoteDialog && session && (
        <QuotePostDialog
          isOpen={showQuoteDialog}
          onOpenChange={setShowQuoteDialog}
          currentUser={{
            id: session.user.id,
            username: '',
            avatar_url: null
          }}
          quotedPost={{
            id: postId,
            content: '',
            user_id: authorId,
            author: {
              id: authorId,
              username: '',
              avatar_url: null
            },
            timestamp: new Date(),
            media_urls: [],
            likes: 0,
            comments: 0,
            reposts: 0,
            isLiked: false,
            isBookmarked: false
          }}
          onPostCreated={() => {
            setShowQuoteDialog(false);
            onAction(postId, 'quote');
          }}
        />
      )}
    </>
  );
};