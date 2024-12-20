import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, X, CalendarIcon, Save } from "lucide-react";
import { EnhancedUploadZone } from "./post/upload/EnhancedUploadZone";
import { RichTextEditor } from "./post/editor/RichTextEditor";
import { format } from "date-fns";
import { usePostCreation } from "./post/hooks/usePostCreation";
import type { CreatePostDialogProps } from "./post/types/postTypes";
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
    resetFormState,
    loadDraft,
    hasDraft
  } = usePostCreation(currentUser, onPostCreated, onOpenChange);

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (content.trim()) {
      saveToDrafts();
      toast.success("Post saved to drafts");
    }
    
    console.log('Cancelling post creation');
    resetFormState();
    onOpenChange(false);
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
            onMention={(username) => setContent(prev => `${prev}@${username} `)}
            onHashtag={(tag) => setContent(prev => `${prev}#${tag} `)}
          />
          
          <EnhancedUploadZone
            onFileSelect={handleFileSelect}
            onPaste={handlePaste}
            isUploading={isSubmitting}
            uploadProgress={uploadProgress}
          />

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
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

            {hasDraft && (
              <Button
                variant="outline"
                onClick={loadDraft}
                className="flex-1 gap-2"
              >
                <Save className="h-4 w-4" />
                Load Draft
              </Button>
            )}
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
              onClick={createPost} 
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