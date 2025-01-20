import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";
import { RichTextEditor } from "./editor/RichTextEditor";
import { PostCard } from "../PostCard";
import { usePostCreation } from "./hooks/usePostCreation";
import { Author } from "@/utils/postUtils";

interface QuotePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: Author;
  quotedPost: any;
  onPostCreated: (post: any) => void;
}

export const QuotePostDialog = ({
  isOpen,
  onOpenChange,
  currentUser,
  quotedPost,
  onPostCreated
}: QuotePostDialogProps) => {
  const {
    content,
    setContent,
    isSubmitting,
    createPost,
    resetFormState
  } = usePostCreation(currentUser, onPostCreated, onOpenChange);

  const handleQuotePost = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    try {
      await createPost({ quoted_post_id: quotedPost.id });
    } catch (error) {
      console.error('Error creating quote post:', error);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    resetFormState();
    onOpenChange(false);
  };

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicks from propagating to parent elements
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card" onClick={handleDialogClick}>
        <DialogHeader>
          <DialogTitle>Quote Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <RichTextEditor
            value={content}
            onChange={setContent}
            onMention={(username) => setContent(prev => `${prev}@${username} `)}
            onHashtag={(tag) => setContent(prev => `${prev}#${tag} `)}
          />
          
          <div className="border border-border rounded-lg p-4 bg-muted/30" onClick={e => e.stopPropagation()}>
            <PostCard
              post={quotedPost}
              currentUserId={currentUser.id}
              onPostAction={() => {}}
              isQuotedPost
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="w-full gap-2"
              type="button"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleQuotePost} 
              className="w-full gap-2"
              disabled={isSubmitting}
              type="button"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Posting...' : 'Quote Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};