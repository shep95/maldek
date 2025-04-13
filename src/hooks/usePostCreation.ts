import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleImageUpload } from "@/components/ai/utils/imageUploadUtils";
import { processImageFile, saveDraft } from "@/utils/postUploadUtils";

export const usePostCreation = (currentUser, onPostCreated, onClose) => {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [postsRemaining, setPostsRemaining] = useState<number | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  
  const checkPostsRemaining = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier_id, subscription_tiers(name)')
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .gt('ends_at', new Date().toISOString())
        .maybeSingle();
      
      if (subscription?.subscription_tiers?.name) {
        setPostsRemaining(null);
        return;
      }
      
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      const { data: recentPosts, error } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', currentUser.id)
        .gte('created_at', oneHourAgo.toISOString());
        
      if (error) {
        console.error('Error checking recent posts:', error);
        return;
      }
      
      setPostsRemaining(Math.max(0, 3 - (recentPosts?.length || 0)));
    } catch (error) {
      console.error('Error checking posts remaining:', error);
    }
  }, [currentUser?.id]);
  
  const handleFileSelect = useCallback((files: FileList) => {
    const filesArray = Array.from(files);
    setMediaFiles(prev => [...prev, ...filesArray]);
  }, []);
  
  const handlePaste = useCallback((file: File) => {
    if (file) {
      setMediaFiles(prev => [...prev, file]);
    }
  }, []);
  
  const saveToDrafts = useCallback(() => {
    if (content.trim()) {
      saveDraft({
        content,
        mediaFiles,
        scheduledFor: scheduledDate || undefined
      });
    }
  }, [content, mediaFiles, scheduledDate]);
  
  const resetFormState = useCallback(() => {
    setContent("");
    setMediaFiles([]);
    setIsSubmitting(false);
    setUploadProgress(0);
    setScheduledDate(null);
  }, []);
  
  const createPost = useCallback(async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media to your post");
      return;
    }
    
    if (!currentUser?.id) {
      toast.error("You must be logged in to create a post");
      return;
    }
    
    const { data: isPremiumUser } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('status', 'active')
      .gt('ends_at', new Date().toISOString())
      .limit(1);
    
    if (!isPremiumUser?.length && content.length > 280) {
      toast.error("Free accounts are limited to 280 characters per post. Upgrade to premium for unlimited characters.");
      return;
    }
    
    if (!isPremiumUser?.length) {
      await checkPostsRemaining();
      if (postsRemaining !== null && postsRemaining <= 0) {
        toast.error("You've reached your hourly post limit. Try again later or upgrade to premium for unlimited posts.");
        return;
      }
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    const mediaUrls: string[] = [];
    
    try {
      console.log('Create post clicked');
      
      if (mediaFiles.length > 0) {
        let progress = 0;
        const increment = 100 / mediaFiles.length;
        
        for (const file of mediaFiles) {
          const processedFile = await processImageFile(file);
          const mediaUrl = await handleImageUpload(
            processedFile, 
            currentUser.id,
            (fileProgress) => {
              const currentFileProgress = fileProgress * (increment / 100);
              setUploadProgress(progress + currentFileProgress);
            }
          );
          
          if (mediaUrl) {
            mediaUrls.push(mediaUrl);
          }
          
          progress += increment;
          setUploadProgress(progress);
        }
      }
      
      const postData = {
        content,
        user_id: currentUser.id,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        scheduled_for: scheduledDate ? scheduledDate.toISOString() : null
      };
      
      const { data: post, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();
      
      if (error) {
        console.error('Post creation error:', error);
        throw error;
      }
      
      console.log('Post created successfully:', post);
      resetFormState();
      if (onPostCreated) onPostCreated(post);
      return post;
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.message || "Failed to create post");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, content, mediaFiles, scheduledDate, checkPostsRemaining, postsRemaining, resetFormState, onPostCreated, onClose]);
  
  return {
    content,
    setContent,
    mediaFiles,
    setMediaFiles,
    isSubmitting,
    uploadProgress,
    postsRemaining,
    scheduledDate,
    setScheduledDate,
    handleFileSelect,
    handlePaste,
    saveToDrafts,
    createPost,
    resetFormState,
    checkPostsRemaining
  };
};
