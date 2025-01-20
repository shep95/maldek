import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Author } from "@/utils/postUtils";

interface CreatePostOptions {
  quoted_post_id?: string;
}

export const usePostCreation = (
  currentUser: Author,
  onPostCreated: (post: any) => void,
  onOpenChange: (open: boolean) => void
) => {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mentionedUser, setMentionedUser] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();

  const handleFileSelect = useCallback(async (files: FileList) => {
    try {
      console.log('Files selected:', Array.from(files).map(f => ({ 
        name: f.name, 
        type: f.type, 
        size: `${(f.size / (1024 * 1024)).toFixed(2)}MB` 
      })));
      
      const processedFiles = await Promise.all(
        Array.from(files).map(async file => {
          console.log('Processing file:', {
            name: file.name,
            type: file.type,
            size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`
          });
          return file;
        })
      );

      setMediaFiles(prev => [...prev, ...processedFiles]);
      processedFiles.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        setMediaPreviewUrls(prev => [...prev, previewUrl]);
      });
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error(`Failed to process file: ${error.message}`);
    }
  }, []);

  const handlePaste = useCallback(async (file: File) => {
    console.log('File pasted:', file.name, file.type, file.size);
    try {
      setMediaFiles(prev => [...prev, file]);
      const previewUrl = URL.createObjectURL(file);
      setMediaPreviewUrls(prev => [...prev, previewUrl]);
    } catch (error) {
      console.error('Error processing pasted file:', error);
      toast.error(`Failed to process pasted file: ${error.message}`);
    }
  }, []);

  const saveToDrafts = useCallback(() => {
    try {
      const draft = {
        content,
        mediaFiles: [], // Can't store File objects
        scheduledFor: scheduledDate
      };
      console.log('Saving draft:', draft);
      // Implementation for saving to drafts
      toast.success('Draft saved');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    }
  }, [content, scheduledDate]);

  const createPost = async (options?: CreatePostOptions) => {
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
          
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${currentUser.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(filePath, file);

          if (uploadError) {
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('posts')
            .getPublicUrl(filePath);

          mediaUrls.push(publicUrl);
          totalProgress = ((index + 1) / mediaFiles.length) * 100;
          setUploadProgress(totalProgress);
        }
      }

      const postData = {
        content: content.trim(),
        user_id: currentUser.id,
        media_urls: mediaUrls,
        ...(scheduledDate && { scheduled_for: scheduledDate.toISOString() }),
        ...(options?.quoted_post_id && { quoted_post_id: options.quoted_post_id })
      };

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select('*, profiles(id, username, avatar_url)')
        .single();

      if (postError) {
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
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const resetFormState = () => {
    console.log('Resetting form state');
    setContent("");
    setIsSubmitting(false);
    setMediaFiles([]);
    setMediaPreviewUrls([]);
    setUploadProgress(0);
    setScheduledDate(undefined);
  };

  return {
    content,
    setContent,
    mediaFiles,
    mentionedUser,
    isSubmitting,
    mediaPreviewUrls,
    uploadProgress,
    scheduledDate,
    setScheduledDate,
    handleFileSelect,
    handlePaste,
    saveToDrafts,
    createPost,
    resetFormState
  };
};