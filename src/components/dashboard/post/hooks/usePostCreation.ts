
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Author } from "@/utils/postUtils";
import { formatInTimeZone } from 'date-fns-tz';
import { useQueryClient } from "@tanstack/react-query";

// Simple local content moderation
const moderateContentLocally = (content: string, mediaUrls: string[] = []) => {
  const inappropriateKeywords = [
    // Adult content
    'porn', 'xxx', 'nude', 'naked', 'sex', 'adult', 'nsfw', 'explicit',
    // Violence/Gore
    'gore', 'blood', 'violence', 'kill', 'murder', 'death', 'suicide',
    'weapon', 'gun', 'knife', 'bomb', 'terrorist', 'torture',
    // Hate speech
    'hate', 'racist', 'nazi', 'fascist', 'terrorist'
  ];

  const textToCheck = content.toLowerCase();
  const urlsToCheck = mediaUrls.join(' ').toLowerCase();
  
  for (const keyword of inappropriateKeywords) {
    if (textToCheck.includes(keyword) || urlsToCheck.includes(keyword)) {
      return {
        isSafe: false,
        flaggedContent: keyword,
        reason: 'Content contains inappropriate material'
      };
    }
  }
  
  return { isSafe: true };
};

const suspendUserAccount = async (userId: string, reason: string) => {
  try {
    const suspensionEnd = new Date();
    suspensionEnd.setHours(suspensionEnd.getHours() + 24); // 24 hour suspension

    const { error } = await supabase
      .from('profiles')
      .update({
        is_suspended: true,
        suspension_reason: reason,
        suspension_end: suspensionEnd.toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error suspending user:', error);
    }
  } catch (error) {
    console.error('Error in suspendUserAccount:', error);
  }
};

const checkUserSuspension = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_suspended, suspension_end, suspension_reason')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking suspension:', error);
      return { isSuspended: false };
    }

    if (data.is_suspended) {
      const now = new Date();
      const suspensionEnd = new Date(data.suspension_end);
      
      if (now >= suspensionEnd) {
        // Suspension has expired, remove it
        await supabase
          .from('profiles')
          .update({
            is_suspended: false,
            suspension_reason: null,
            suspension_end: null
          })
          .eq('id', userId);
        
        return { isSuspended: false };
      }
      
      return { 
        isSuspended: true, 
        reason: data.suspension_reason,
        endsAt: suspensionEnd
      };
    }
    
    return { isSuspended: false };
  } catch (error) {
    console.error('Error checking suspension:', error);
    return { isSuspended: false };
  }
};

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
  const queryClient = useQueryClient();

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
    console.log('Saving to drafts:', { content, mediaFiles, scheduledDate });
  };

  const handleCreatePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media to your post");
      return;
    }

    // Check network connectivity
    if (!navigator.onLine) {
      toast.error("No network connection. Please check your internet and try again.");
      return;
    }

    // Check if user is suspended
    const suspensionStatus = await checkUserSuspension(currentUser.id);
    if (suspensionStatus.isSuspended) {
      const timeRemaining = Math.ceil((suspensionStatus.endsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60));
      toast.error(`Your account is suspended for ${timeRemaining} more hours. Reason: ${suspensionStatus.reason}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const mediaUrls: string[] = [];

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

          mediaUrls.push(publicUrl);
        }
      }

      // Local content moderation
      const moderationResult = moderateContentLocally(content, mediaUrls);
      if (!moderationResult.isSafe) {
        // Suspend user account for 24 hours
        await suspendUserAccount(currentUser.id, `Inappropriate content: ${moderationResult.reason}`);
        
        // Delete uploaded media
        if (mediaUrls.length > 0) {
          for (const url of mediaUrls) {
            const filePath = url.split('/').pop();
            if (filePath) {
              await supabase.storage
                .from('posts')
                .remove([`${currentUser.id}/${filePath}`]);
            }
          }
        }
        
        toast.error("Your account has been suspended for 24 hours due to inappropriate content");
        return;
      }

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

      const postData = {
        content: content.trim(),
        user_id: currentUser.id,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        scheduled_for: scheduledForDate
      };

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

      // Immediately invalidate and refetch posts to show the new post
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      await queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      
      // Force a refetch to ensure the new post appears immediately
      await queryClient.refetchQueries({ queryKey: ['posts'] });

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
