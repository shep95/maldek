import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleImageUpload } from "@/components/ai/utils/imageUploadUtils";
import { processImageFile, saveDraft } from "@/utils/postUploadUtils";
import type { Author } from "@/utils/postUtils";
import type { PostData } from "../types/postTypes";

export const usePostCreation = (
  currentUser: Author,
  onPostCreated: (post: any) => void,
  onOpenChange: (open: boolean) => void
) => {
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

  const createPost = async () => {
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

          totalProgress = ((index + 1) / mediaFiles.length) * 100;
          setUploadProgress(totalProgress);
        }
      }

      console.log('Creating post with media URLs:', mediaUrls);

      const postData: PostData = {
        content: content.trim(),
        user_id: currentUser.id,
        media_urls: mediaUrls,
      };

      if (scheduledDate) {
        postData.scheduled_for = scheduledDate.toISOString();
      }

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

      // Handle mentions
      const mentionRegex = /@(\w+)/g;
      const mentions = content.match(mentionRegex);

      if (mentions) {
        console.log('Processing mentions:', mentions);
        
        for (const mention of mentions) {
          const username = mention.slice(1); // Remove @ symbol
          
          // Get the mentioned user's ID
          const { data: mentionedUser, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

          if (userError || !mentionedUser) {
            console.error('Error finding mentioned user:', userError);
            continue;
          }

          // Create mention record
          const { error: mentionError } = await supabase
            .from('mentions')
            .insert({
              user_id: currentUser.id,
              mentioned_user_id: mentionedUser.id,
              post_id: newPost.id
            });

          if (mentionError) {
            console.error('Error creating mention:', mentionError);
            continue;
          }

          // Create notification for mentioned user
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              recipient_id: mentionedUser.id,
              actor_id: currentUser.id,
              post_id: newPost.id,
              type: 'mention'
            });

          if (notificationError) {
            console.error('Error creating notification:', notificationError);
          }
        }
      }
      
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

  return {
    content,
    setContent,
    mediaFiles,
    isSubmitting,
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