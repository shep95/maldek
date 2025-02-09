
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleImageUpload } from "@/components/ai/utils/imageUploadUtils";
import { processImageFile, saveDraft } from "@/utils/postUploadUtils";
import { isVideoFile } from "@/utils/mediaUtils";
import type { Author } from "@/utils/postUtils";
import type { PostData } from "../components/dashboard/post/types/postTypes";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleFileSelect = useCallback(async (files: FileList) => {
    try {
      console.log('Files selected:', Array.from(files).map(f => ({ 
        name: f.name, 
        type: f.type, 
        size: `${(f.size / (1024 * 1024)).toFixed(2)}MB` 
      })));
      
      const processedFiles = await Promise.all(
        Array.from(files).map(async file => {
          if (file.type.startsWith('image/')) {
            return await processImageFile(file);
          }
          return file;
        })
      );

      setMediaFiles(prev => [...prev, ...processedFiles]);
    } catch (error: any) {
      console.error('Error processing files:', error);
      toast.error(`Failed to process files: ${error.message}`);
    }
  }, []);

  const handlePaste = useCallback(async (file: File) => {
    try {
      console.log('File pasted:', file.name, file.type, file.size);
      const processedFile = file.type.startsWith('image/') 
        ? await processImageFile(file)
        : file;
      setMediaFiles(prev => [...prev, processedFile]);
    } catch (error: any) {
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

  const createPost = async () => {
    if (!currentUser?.id) {
      console.error('No user ID found');
      toast.error("Please sign in to create a post");
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
          console.log('Processing file:', {
            name: file.name,
            type: file.type,
            size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`
          });
          
          const publicUrl = await handleImageUpload(file, currentUser.id, (progress) => {
            const currentFileProgress = (progress + (index * 100)) / mediaFiles.length;
            setUploadProgress(currentFileProgress);
          });

          if (!publicUrl) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          console.log('File uploaded successfully:', publicUrl);
          mediaUrls.push(publicUrl);

          totalProgress = ((index + 1) / mediaFiles.length) * 100;
          setUploadProgress(totalProgress);
        }
      }

      const postData: PostData = {
        content: content.trim(),
        user_id: currentUser.id,
        media_urls: mediaUrls,
        scheduled_for: scheduledDate?.toISOString()
      };

      console.log('Creating post with data:', postData);

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select('*, profiles(id, username, avatar_url)')
        .single();

      if (postError) {
        console.error('Post creation error:', postError);
        throw new Error(postError.message);
      }

      console.log('Post created successfully:', newPost);
      
      resetFormState();
      onPostCreated(newPost);
      onOpenChange(false);
      
      // Force navigation to dashboard and scroll to top
      console.log('Navigating to dashboard after post creation');
      navigate('/dashboard', { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      toast.success(scheduledDate ? "Post scheduled successfully!" : "Post created successfully!");

    } catch (error: any) {
      console.error('Post creation error:', error);
      if (error.message?.includes('timeout')) {
        toast.error("Connection timed out. Please try again.");
      } else if (error.message?.includes('network')) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error(error.message || "Failed to create post");
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const resetFormState = () => {
    console.log('Resetting form state');
    setContent("");
    setMediaFiles([]);
    setIsSubmitting(false);
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
