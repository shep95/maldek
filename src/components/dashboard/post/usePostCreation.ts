import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Author } from "@/utils/postUtils";

export const usePostCreation = (
  currentUser: Author,
  onPostCreated: (post: any) => void,
  onOpenChange: (open: boolean) => void
) => {
  const [postContent, setPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mentionedUser, setMentionedUser] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    const validFiles = fileArray.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isSizeValid = file.size <= 100 * 1024 * 1024; // 100MB limit
      
      if (!isValid) {
        toast.error(`Invalid file type: ${file.name}`);
      }
      if (!isSizeValid) {
        toast.error(`File too large: ${file.name}`);
      }
      
      return isValid && isSizeValid;
    });

    if (validFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...validFiles]);
      
      validFiles.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        setMediaPreviewUrls(prev => [...prev, previewUrl]);
      });
    }
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviewUrls[index]);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleMentionUser = () => {
    if (mentionedUser) {
      setPostContent(prev => `${prev} ${mentionedUser} `);
      setMentionedUser("");
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media to your post");
      return;
    }

    try {
      setIsSubmitting(true);
      const mediaUrls: string[] = [];

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

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert({
          content: postContent.trim(),
          user_id: currentUser.id,
          media_urls: mediaUrls,
        })
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

      setPostContent("");
      mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setMediaPreviewUrls([]);
      setMediaFiles([]);
      
      onPostCreated(newPost);
      onOpenChange(false);
      toast.success("Post created successfully!");

    } catch (error: any) {
      console.error('Error creating post:', error);
      if (error.message.includes('can only post 3 times per hour')) {
        toast.error("Free users can only post 3 times per hour. Upgrade your account to post more!", {
          duration: 5000,
          action: {
            label: "Upgrade",
            onClick: () => window.location.href = '/subscription'
          }
        });
      } else {
        toast.error("Failed to create post. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    postContent,
    setPostContent,
    mediaFiles,
    mentionedUser,
    isSubmitting,
    mediaPreviewUrls,
    postsRemaining,
    handleFileUpload,
    removeMedia,
    handleMentionUser,
    setMentionedUser,
    handleCreatePost
  };
};
