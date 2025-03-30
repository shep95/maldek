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
        .single();

      const maxSize = (subscription?.subscription_tiers?.max_upload_size_mb || 50) * 1024 * 1024; // Convert MB to bytes
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

      // Ensure we don't exceed 6 files total
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
    // Check if adding this file would exceed the 6 file limit
    if (mediaFiles.length >= 6) {
      toast.error("Maximum of 6 media files allowed");
      return;
    }

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier_id, subscription_tiers(max_upload_size_mb, supports_gif_uploads)')
      .eq('user_id', currentUser.id)
      .eq('status', 'active')
      .gt('ends_at', new Date().toISOString())
      .single();

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
  };

  const saveToDrafts = () => {
    // Implementation for saving to drafts
    console.log('Saving to drafts:', { content, mediaFiles, scheduledDate });
  };

  const moderateContent = async (mediaUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: {
          mediaUrl,
          userId: currentUser.id
        }
      })

      if (error) throw error

      return data.is_safe
    } catch (error) {
      console.error('Content moderation failed:', error)
      throw new Error('Content moderation failed')
    }
  }

  const handleCreatePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media to your post");
      return;
    }

    try {
      setIsSubmitting(true);
      const mediaUrls: string[] = [];

      // Check if user has premium subscription to bypass character limits
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier_id, subscription_tiers(name), is_lifetime')
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .gt('ends_at', new Date().toISOString())
        .maybeSingle();
      
      const hasPremium = !!subscription?.subscription_tiers?.name || subscription?.is_lifetime;

      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${currentUser.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(filePath, file);

          if (uploadError) {
            toast.error(`Failed to upload ${file.name}`);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('posts')
            .getPublicUrl(filePath);

          // Check content moderation before allowing the URL
          const isSafe = await moderateContent(publicUrl);
          if (!isSafe) {
            // Delete the uploaded file
            await supabase.storage
              .from('posts')
              .remove([filePath]);
            
            toast.error("Your content was flagged as inappropriate and cannot be posted");
            return;
          }

          mediaUrls.push(publicUrl);
        }
      }

      let scheduledForDate: string | undefined;
      
      if (scheduledDate) {
        // Convert the date to EST and format it as ISO string
        scheduledForDate = formatInTimeZone(
          scheduledDate,
          'America/New_York',
          "yyyy-MM-dd'T'HH:mm:ssXXX"
        );

        // Validate the scheduled date is in the future
        const now = new Date();
        if (scheduledDate <= now) {
          toast.error("Scheduled date must be in the future");
          return;
        }

        console.log('Scheduling post for:', scheduledForDate);
      }

      // Create the post data - IP address will be automatically logged by the database trigger
      const postData = {
        content: content.trim(),
        user_id: currentUser.id,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        scheduled_for: scheduledForDate
      };

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert([postData])
        .select('*, profiles(id, username, avatar_url)')
        .single();

      if (postError) {
        if (postError.message.includes('Cannot schedule posts')) {
          toast.error("You need an active subscription to schedule posts", {
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

      await checkPostsRemaining();
      
      setContent("");
      setMediaFiles([]);
      setUploadProgress(0);
      setScheduledDate(undefined);
      
      onPostCreated(newPost);
      onOpenChange(false);
      toast.success(scheduledDate ? "Post scheduled successfully!" : "Post created successfully!");

    } catch (error: any) {
      console.error('Post creation error:', error);
      if (error.message.includes('can only post 3 times per hour')) {
        toast.error("Free users can only post 3 times per hour. Upgrade your account to post more!", {
          duration: 5000,
          action: {
            label: "Upgrade",
            onClick: () => window.location.href = '/subscription'
          }
        });
      } else if (error.message.includes('Post exceeds character limit')) {
        toast.error("Your post exceeds the character limit for your subscription tier. Upgrade for longer posts!", {
          duration: 5000,
          action: {
            label: "Upgrade",
            onClick: () => window.location.href = '/subscription'
          }
        });
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
