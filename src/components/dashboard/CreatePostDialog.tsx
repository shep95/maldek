import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
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

  console.log('CreatePostDialog rendered with currentUser:', currentUser);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    console.log('Files selected:', files.length);

    const validFiles = Array.from(files).filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
      
      if (!isValid) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name} (max ${file.type.startsWith('video/') ? '100MB' : '5MB'})`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...validFiles]);
      validFiles.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        setMediaPreviewUrls(prev => [...prev, previewUrl]);
      });
      console.log('Valid files added:', validFiles.length);
    }
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviewUrls[index]);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviewUrls(prev => prev.filter((_, i) => i !== index));
    console.log('Media removed at index:', index);
  };

  const handleMentionUser = () => {
    if (mentionedUser) {
      setContent(prev => `${prev} @${mentionedUser} `);
      setMentionedUser("");
    }
  };

  const handleCreatePost = async () => {
    console.log('Starting post creation with:', { content, mediaFiles, currentUser });
    
    if (!currentUser?.id) {
      console.error('No user ID available:', currentUser);
      toast.error("User authentication error. Please try logging in again.");
      return;
    }

    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media to your post");
      return;
    }

    try {
      setIsSubmitting(true);
      const mediaUrls: string[] = [];

      if (mediaFiles.length > 0) {
        console.log('Uploading media files:', mediaFiles.length);
        
        for (const file of mediaFiles) {
          const mediaUrl = await handleImageUpload(file, currentUser.id);
          if (mediaUrl) {
            mediaUrls.push(mediaUrl);
            console.log('Media uploaded successfully:', mediaUrl);
          }
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

      setContent("");
      mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setMediaPreviewUrls([]);
      setMediaFiles([]);
      
      onPostCreated(newPost);
      onOpenChange(false);
      toast.success("Post created successfully!");

    } catch (error) {
      console.error('Detailed error in post creation:', error);
      toast.error(error.message || "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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