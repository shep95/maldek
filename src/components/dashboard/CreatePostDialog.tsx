import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";
import type { Author } from "@/utils/postUtils";
import { MediaUpload } from "./post/MediaUpload";
import { MentionInput } from "./post/MentionInput";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleImageUpload } from "@/components/ai/utils/imageUploadUtils";

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
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionedUser, setMentionedUser] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles = Array.from(files);
    console.log('Files selected:', validFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));

    if (validFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...validFiles]);
      validFiles.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        console.log('Created preview URL:', previewUrl, 'for file:', file.name);
        setMediaPreviewUrls(prev => [...prev, previewUrl]);
      });
    }
  };

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
        for (const file of mediaFiles) {
          console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
          
          const publicUrl = await handleImageUpload(file, currentUser.id);
          
          if (!publicUrl) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          console.log('Upload successful. Public URL:', publicUrl);
          mediaUrls.push(publicUrl);
        }
      }

      console.log('Creating post with media URLs:', mediaUrls);

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          user_id: currentUser.id,
          media_urls: mediaUrls,
        })
        .select('*, profiles(id, username, avatar_url)')
        .single();

      if (postError) {
        console.error('Post creation error:', postError);
        throw new Error(`Failed to create post: ${postError.message}`);
      }

      console.log('Post created successfully:', newPost);

      // Clean up
      setContent("");
      mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setMediaPreviewUrls([]);
      setMediaFiles([]);
      
      onPostCreated(newPost);
      onOpenChange(false);
      toast.success("Post created successfully!");

    } catch (error) {
      console.error('Detailed error:', error);
      toast.error(error.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancelling post creation');
    // Clean up any media preview URLs
    mediaPreviewUrls.forEach(url => {
      console.log('Revoking URL:', url);
      URL.revokeObjectURL(url);
    });
    
    // Reset all state
    setContent("");
    setMediaPreviewUrls([]);
    setMediaFiles([]);
    setMentionedUser("");
    
    // Close the dialog
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
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] bg-background"
          />
          
          <MentionInput
            mentionedUser={mentionedUser}
            onMentionChange={setMentionedUser}
            onMentionSubmit={() => {
              if (mentionedUser) {
                setContent(prev => `${prev} @${mentionedUser} `);
                setMentionedUser("");
              }
            }}
          />
          
          <MediaUpload
            mediaFiles={mediaFiles}
            mediaPreviewUrls={mediaPreviewUrls}
            onFileUpload={handleFileUpload}
            onRemoveMedia={(index) => {
              URL.revokeObjectURL(mediaPreviewUrls[index]);
              setMediaFiles(prev => prev.filter((_, i) => i !== index));
              setMediaPreviewUrls(prev => prev.filter((_, i) => i !== index));
            }}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="w-full gap-2"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePost} 
              className="w-full gap-2"
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};