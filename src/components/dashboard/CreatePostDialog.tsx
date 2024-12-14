import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import type { Author } from "@/utils/postUtils";
import { MediaUpload } from "./post/MediaUpload";
import { MentionInput } from "./post/MentionInput";
import { usePostCreation } from "./post/usePostCreation";

interface CreatePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: Author;
  onPostCreated: (newPost: any) => void;
}

export const CreatePostDialog = ({
  isOpen,
  onOpenChange,
  currentUser,
  onPostCreated
}: CreatePostDialogProps) => {
  const {
    postContent,
    setPostContent,
    mediaFiles,
    mentionedUser,
    isSubmitting,
    mediaPreviewUrls,
    handleFileUpload,
    removeMedia,
    handleMentionUser,
    setMentionedUser,
    handleCreatePost
  } = usePostCreation(currentUser, onPostCreated, onOpenChange);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, media, or mention other users in your post.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="min-h-[120px] bg-background"
          />
          
          <MentionInput
            mentionedUser={mentionedUser}
            onMentionChange={setMentionedUser}
            onMentionSubmit={handleMentionUser}
          />
          
          <MediaUpload
            mediaFiles={mediaFiles}
            mediaPreviewUrls={mediaPreviewUrls}
            onFileUpload={handleFileUpload}
            onRemoveMedia={removeMedia}
          />
          
          <Button 
            onClick={handleCreatePost} 
            className="w-full gap-2"
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};