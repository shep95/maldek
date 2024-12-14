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

    const validFiles = Array.from(files).filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        toast.error(`Invalid file type: ${file.name}`);
      }
      return isValid;
    });

    setMediaFiles(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const previewUrl = URL.createObjectURL(file);
      setMediaPreviewUrls(prev => [...prev, previewUrl]);
    });
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviewUrls[index]);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleMentionUser = () => {
    if (mentionedUser) {
      setContent(prev => `${prev} @${mentionedUser} `);
      setMentionedUser("");
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media to your post");
      return;
    }

    try {
      setIsSubmitting(true);
      const mediaUrls: string[] = [];

      // Upload media files
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);

        mediaUrls.push(publicUrl);
      }

      // Create post
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
        throw postError;
      }

      // Reset form
      setContent("");
      mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setMediaPreviewUrls([]);
      setMediaFiles([]);
      
      // Close dialog and notify success
      onPostCreated(newPost);
      onOpenChange(false);
      toast.success("Post created successfully!");

    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Failed to create post. Please try again.");
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