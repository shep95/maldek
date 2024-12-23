import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleImageUpload } from "@/components/ai/utils/imageUploadUtils";
import { processImageFile, saveDraft } from "@/utils/postUploadUtils";
import { isVideoFile } from "@/utils/mediaUtils";
import type { Author } from "@/utils/postUtils";
import type { PostData } from "../components/dashboard/post/types/postTypes";

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
          return await processImageFile(file);
        }
        return file;
      })
    );

    setMediaFiles(prev => [...prev, ...processedFiles]);
  }, []);

  const handlePaste = useCallback(async (file: File) => {
    console.log('File pasted:', file.name, file.type, file.size);
    try {
      const processedFile = file.type.startsWith('image/') 
        ? await processImageFile(file)
        : file;
      setMediaFiles(prev => [...prev, processedFile]);
    } catch (error) {
      console.error('Error processing pasted file:', error);
      toast.error(`Failed to process pasted file: ${error.message}`);
    }
  }, []);

  const saveToDrafts = useCallback(() => {
    saveDraft({
      content,
      mediaFiles,
      scheduledFor: scheduledDate
    });
  }, [content, mediaFiles, scheduledDate]);

  const uploadMedia = async (file: File): Promise<string> => {
    console.log('Starting upload for file:', { name: file.name, type: file.type, size: file.size });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;
      const bucket = isVideoFile(file) ? 'videos' : 'posts';

      console.log(`Uploading to ${bucket} bucket:`, filePath);

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('Upload successful. Public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Detailed upload error:', error);
      throw error;
    }
  };

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
          
          const publicUrl = await uploadMedia(file);
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