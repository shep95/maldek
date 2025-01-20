import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, X, CalendarIcon } from "lucide-react";
import { EnhancedUploadZone } from "./post/upload/EnhancedUploadZone";
import { RichTextEditor } from "./post/editor/RichTextEditor";
import { format } from "date-fns";
import { usePostCreation } from "./post/hooks/usePostCreation";
import type { CreatePostDialogProps } from "./post/types/postTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CreatePostDialog = ({
  isOpen,
  onOpenChange,
  currentUser,
  onPostCreated
}: CreatePostDialogProps) => {
  const {
    content,
    setContent,
    isSubmitting,
    uploadProgress,
    scheduledDate,
    setScheduledDate,
    handleFileSelect,
    handlePaste,
    saveToDrafts,
    createPost,
    resetFormState
  } = usePostCreation(currentUser, onPostCreated, onOpenChange);

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (content.trim()) {
      saveToDrafts();
    }
    
    console.log('Cancelling post creation');
    resetFormState();
    onOpenChange(false);
  };

  const handleMention = async (username: string) => {
    try {
      const { data: mentionedUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !mentionedUser) {
        console.error('Error finding mentioned user:', userError);
        return;
      }

      console.log('Mentioned user found:', mentionedUser);
      setContent(prev => `${prev}@${username} `);
    } catch (error) {
      console.error('Error handling mention:', error);
      toast.error("Failed to process mention");
    }
  };

  const handleCreatePost = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await createPost();
  };

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
          <RichTextEditor
            value={content}
            onChange={setContent}
            onMention={handleMention}
            onHashtag={(tag) => setContent(prev => `${prev}#${tag} `)}
          />
          
          <EnhancedUploadZone
            onFileSelect={handleFileSelect}
            onPaste={handlePaste}
            isUploading={isSubmitting}
            uploadProgress={uploadProgress}
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !scheduledDate && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduledDate ? format(scheduledDate, "PPP") : "Schedule post"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
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
              onClick={handleCreatePost}
              className="w-full gap-2"
              disabled={isSubmitting}
              type="button"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : scheduledDate ? 'Schedule' : 'Create Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};