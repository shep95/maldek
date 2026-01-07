
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Author } from "@/utils/postUtils";
import { formatInTimeZone } from 'date-fns-tz';

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
  const [postsRemaining, setPostsRemaining] = useState<number | null>(null);

  const checkPostsRemaining = useCallback(async () => {
    try {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier_id, subscription_tiers(name, post_character_limit, max_upload_size_mb)')
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .gt('ends_at', new Date().toISOString())
        .maybeSingle();

      if (subscription?.subscription_tiers?.name) {
        setPostsRemaining(null);
        return;
      }

      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('user_id', currentUser.id)
        .gt('created_at', hourAgo);

      setPostsRemaining(3 - (count || 0));
    } catch (error) {
      console.error('Error fetching remaining posts:', error);
    }
  }, [currentUser.id]);

  useEffect(() => {
    checkPostsRemaining();
  }, [checkPostsRemaining]);

  const handleFileSelect = async (files: FileList) => {
    console.log('Files selected:', Array.from(files));
    
    try {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier_id, subscription_tiers(max_upload_size_mb, supports_gif_uploads)')
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .gt('ends_at', new Date().toISOString())
        .maybeSingle();

      const maxSize = (subscription?.subscription_tiers?.max_upload_size_mb || 50) * 1024 * 1024;
      const supportsGif = subscription?.subscription_tiers?.supports_gif_uploads || false;

      const validFiles = Array.from(files).filter(file => {
        const isValidSize = file.size <= maxSize;
        const isGif = file.type === 'image/gif';
        const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');

        if (!isValidSize) {
          toast.error(`File too large: ${file.name}. Maximum size is ${maxSize / (1024 * 1024)}MB`);
          return false;
        }

        if (isGif && !supportsGif) {
          toast.error("Your subscription tier doesn't support GIF uploads");
          return false;
        }

        if (!isValidType) {
          toast.error(`Invalid file type: ${file.name}`);
          return false;
        }

        return true;
      });

      const availableSlots = 6 - mediaFiles.length;
      const filesToAdd = validFiles.slice(0, availableSlots);

      if (filesToAdd.length > 0) {
        setMediaFiles(prev => [...prev, ...filesToAdd]);
      }
      
      if (validFiles.length > availableSlots) {
        toast.error(`Only added ${filesToAdd.length} files. Maximum of 6 files allowed.`);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error("Failed to validate file upload permissions");
    }
  };

  const handlePaste = async (file: File) => {
    if (mediaFiles.length >= 6) {
      toast.error("Maximum of 6 media files allowed");
      return;
    }

    try {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier_id, subscription_tiers(max_upload_size_mb, supports_gif_uploads)')
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .gt('ends_at', new Date().toISOString())
        .maybeSingle();

      const maxSize = (subscription?.subscription_tiers?.max_upload_size_mb || 50) * 1024 * 1024;
      const supportsGif = subscription?.subscription_tiers?.supports_gif_uploads || false;

      if (file.size > maxSize) {
        toast.error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      if (file.type === 'image/gif' && !supportsGif) {
        toast.error("Your subscription tier doesn't support GIF uploads");
        return;
      }

      setMediaFiles(prev => [...prev, file]);
    } catch (error) {
      console.error('Error validating pasted file:', error);
      toast.error("Failed to validate file");
    }
  };

  const saveToDrafts = () => {
    console.log('Saving to drafts:', { content, mediaFiles, scheduledDate });
  };

  const handleCreatePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media to your post");
      return;
    }

    if (!currentUser?.id) {
      toast.error("You must be logged in to create a post");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(0);
      
      console.log('Creating post with content:', content);
      console.log('Media files:', mediaFiles.length);

      // Check user subscription for limits
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier_id, subscription_tiers(name), is_lifetime')
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .gt('ends_at', new Date().toISOString())
        .maybeSingle();
      
      const hasPremium = !!subscription?.subscription_tiers?.name || subscription?.is_lifetime;

      // Upload media files if any
      const mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        let uploadedCount = 0;
        for (const file of mediaFiles) {
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${currentUser.id}/${fileName}`;

            console.log('Uploading file:', fileName);

            const { error: uploadError } = await supabase.storage
              .from('posts')
              .upload(filePath, file);

            if (uploadError) {
              console.error('Upload error:', uploadError);
              toast.error(`Failed to upload ${file.name}`);
              throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('posts')
              .getPublicUrl(filePath);

            mediaUrls.push(publicUrl);
            uploadedCount++;
            setUploadProgress((uploadedCount / mediaFiles.length) * 100);
            console.log('Successfully uploaded:', publicUrl);
          } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
          }
        }
      }

      // Handle scheduling
      let scheduledForDate: string | undefined;
      if (scheduledDate) {
        scheduledForDate = formatInTimeZone(
          scheduledDate,
          'America/New_York',
          "yyyy-MM-dd'T'HH:mm:ssXXX"
        );

        const now = new Date();
        if (scheduledDate <= now) {
          toast.error("Scheduled date must be in the future");
          return;
        }

        console.log('Scheduling post for:', scheduledForDate);
      }

      // Create the post
      const postData = {
        content: content.trim(),
        user_id: currentUser.id,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        scheduled_for: scheduledForDate
      };

      console.log('Inserting post data:', postData);

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert([postData])
        .select(`
          *,
          profiles!inner (
            id,
            username,
            avatar_url,
            user_subscriptions (
              status,
              subscription_tiers (
                name,
                checkmark_color
              )
            )
          )
        `)
        .single();

      if (postError) {
        console.error('Post creation error:', postError);
        if (postError.message.includes('can only post 3 times per hour')) {
          toast.error("Free users can only post 3 times per hour. Upgrade your account to post more!", {
            duration: 5000,
            action: {
              label: "Upgrade",
              onClick: () => window.location.href = '/subscription'
            }
          });
          return;
        }
        throw postError;
      }

      console.log('Post created successfully:', newPost);

      // Update remaining posts count
      await checkPostsRemaining();
      
      // Reset form
      setContent("");
      setMediaFiles([]);
      setUploadProgress(0);
      setScheduledDate(undefined);
      
      // Notify parent components - do NOT close dialog here, let the success animation handle it
      if (onPostCreated) {
        onPostCreated(newPost);
      }

    } catch (error: any) {
      console.error('Post creation error:', error);
      toast.error(error.message || "Failed to create post");
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
    setMediaFiles,
    isSubmitting,
    uploadProgress,
    scheduledDate,
    setScheduledDate,
    postsRemaining,
    handleFileSelect,
    handlePaste,
    saveToDrafts,
    createPost: handleCreatePost,
    resetFormState,
    checkPostsRemaining
  };
};
