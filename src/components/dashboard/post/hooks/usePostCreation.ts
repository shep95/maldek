
import { useState, useEffect } from "react";
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

  const fetchRemainingPosts = async () => {
    try {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
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

      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('user_id', currentUser.id)
        .gt('created_at', hourAgo);

      setPostsRemaining(3 - (count || 0));
    } catch (error) {
      console.error('Error fetching remaining posts:', error);
    }
  };

  useEffect(() => {
    fetchRemainingPosts();
  }, [currentUser.id]);

  const handleFileSelect = async (files: FileList) => {
    console.log('Files selected:', Array.from(files));
    setMediaFiles(prev => [...prev, ...Array.from(files)]);
  };

  const handlePaste = async (file: File) => {
    setMediaFiles(prev => [...prev, file]);
  };

  const saveToDrafts = () => {
    // Implementation for saving to drafts
    console.log('Saving to drafts:', { content, mediaFiles, scheduledDate });
  };

  const createPost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media to your post");
      return;
    }

    try {
      setIsSubmitting(true);
      const mediaUrls: string[] = [];

      if (mediaFiles.length > 0) {
        for (const [index, file] of mediaFiles.entries()) {
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
          setUploadProgress(((index + 1) / mediaFiles.length) * 100);
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

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert([{
          content: content.trim(),
          user_id: currentUser.id,
          media_urls: mediaUrls,
          scheduled_for: scheduledForDate
        }])
        .select('*, profiles(id, username, avatar_url)')
        .single();

      if (postError) {
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

      await fetchRemainingPosts();
      
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
      } else if (error.message.includes('Cannot schedule posts')) {
        toast.error(error.message, {
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
    isSubmitting,
    uploadProgress,
    scheduledDate,
    setScheduledDate,
    postsRemaining,
    handleFileSelect,
    handlePaste,
    saveToDrafts,
    createPost,
    resetFormState
  };
};
