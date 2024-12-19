import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, X, CalendarIcon } from "lucide-react";
import type { Author } from "@/utils/postUtils";
import { EnhancedUploadZone } from "./post/upload/EnhancedUploadZone";
import { RichTextEditor } from "./post/editor/RichTextEditor";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleImageUpload } from "@/components/ai/utils/imageUploadUtils";
import { processImageFile, saveDraft } from "@/utils/postUploadUtils";
import { format } from "date-fns";

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
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();

  const handleFileSelect = useCallback(async (files: FileList) => {
    console.log('Files selected:', Array.from(files).map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    const processedFiles = await Promise.all(
      Array.from(files).map(async file => {
        if (file.type.startsWith('image/')) {
          return processImageFile(file);
        }
        return file;
      })
    );

    setMediaFiles(prev => [...prev, ...processedFiles]);
  }, []);

  const handlePaste = useCallback(async (file: File) => {
    console.log('File pasted:', file.name, file.type, file.size);
    const processedFile = await processImageFile(file);
    setMediaFiles(prev => [...prev, processedFile]);
  }, []);

  const saveToDrafts = useCallback(() => {
    saveDraft({
      content,
      mediaFiles,
      scheduledFor: scheduledDate
    });
  }, [content, mediaFiles, scheduledDate]);

  const handleCreatePost = async () => {
    if (!currentUser?.id) {
      console.error('No user ID found');
      toast.error("User authentication error. Please try logging in again.");
      return;
    }

    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media to your post");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Starting post creation with media files:', mediaFiles.length);
      const mediaUrls: string[] = [];

      if (mediaFiles.length > 0) {
        let totalProgress = 0;

        for (const [index, file] of mediaFiles.entries()) {
          console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
          
          const publicUrl = await handleImageUpload(file, currentUser.id);
          
          if (!publicUrl) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          console.log('Upload successful. Public URL:', publicUrl);
          mediaUrls.push(publicUrl);

          // Update progress
          totalProgress = ((index + 1) / mediaFiles.length) * 100;
          setUploadProgress(totalProgress);
        }
      }

      console.log('Creating post with media URLs:', mediaUrls);

      const postData = {
        content: content.trim(),
        user_id: currentUser.id,
        media_urls: mediaUrls,
        scheduled_for: scheduledDate ? scheduledDate.toISOString() : null,
      };

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select('*, profiles(id, username, avatar_url)')
        .single();

      if (postError) {
        console.error('Post creation error:', postError);
        throw new Error(`Failed to create post: ${postError.message}`);
      }

      console.log('Post created successfully:', newPost);
      
      resetFormState();
      onPostCreated(newPost);
      onOpenChange(false);
      toast.success(scheduledDate ? "Post scheduled successfully!" : "Post created successfully!");

    } catch (error) {
      console.error('Detailed error:', error);
      toast.error(error.message || "Failed to create post");
      setIsSubmitting(false);
    }
  };

  const resetFormState = () => {
    console.log('Resetting form state');
    setContent("");
    setIsSubmitting(false);
    setMediaFiles([]);
    setUploadProgress(0);
    setScheduledDate(undefined);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (content.trim() || mediaFiles.length > 0) {
      saveToDrafts();
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
