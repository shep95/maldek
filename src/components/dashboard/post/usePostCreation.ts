import { useState } from "react";
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      console.log("File upload started:", { numberOfFiles: files.length });
      const fileArray = Array.from(files);
      
      // Validate file types and sizes
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
        
        console.log("Files added successfully:", validFiles.map(f => ({ name: f.name, type: f.type })));
        toast.success(`${validFiles.length} media file(s) added to post`);
      }
    }
  };

  const removeMedia = (index: number) => {
    console.log("Removing media at index:", index);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(mediaPreviewUrls[index]);
    setMediaPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleMentionUser = () => {
    if (mentionedUser) {
      setPostContent((prev) => `${prev} ${mentionedUser} `);
      setMentionedUser("");
      console.log("Mentioned user added:", mentionedUser);
    }
  };

  const handleCreatePost = async () => {
    if (!currentUser.id) {
      console.error("No user ID found");
      toast.error("Please sign in to create a post");
      return;
    }

    if (!postContent.trim() && mediaFiles.length === 0) {
      console.error("No content or media provided");
      toast.error("Please add some content or media to your post");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Starting post creation with:", { 
        contentLength: postContent.length,
        numberOfMediaFiles: mediaFiles.length,
        userId: currentUser.id
      });

      const mediaUrls: string[] = [];

      // Upload media files if any
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${currentUser.id}/${fileName}`;

          console.log("Uploading file:", { fileName, fileType: file.type });

          const { data: uploadResult, error: uploadError } = await supabase.storage
            .from('posts')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            toast.error(`Failed to upload ${file.name}`);
            throw uploadError;
          }

          console.log("File uploaded successfully:", filePath);

          // Get the public URL for the uploaded file
          const { data: { publicUrl } } = supabase.storage
            .from('posts')
            .getPublicUrl(filePath);

          mediaUrls.push(publicUrl);
          console.log("Added public URL:", publicUrl);
        }
      }

      console.log("Creating post with media URLs:", mediaUrls);

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          content: postContent.trim(),
          user_id: currentUser.id,
          media_urls: mediaUrls,
        })
        .select(`
          id,
          content,
          media_urls,
          created_at,
          user_id,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .single();

      if (postError) {
        console.error("Error creating post:", postError);
        throw postError;
      }

      console.log("Post created successfully:", post);
      
      // Clean up
      setPostContent("");
      mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setMediaPreviewUrls([]);
      setMediaFiles([]);
      
      onPostCreated(post);
      onOpenChange(false);
      
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error in post creation:", error);
      toast.error("Failed to create post. Please try again.");
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
    handleFileUpload,
    removeMedia,
    handleMentionUser,
    setMentionedUser,
    handleCreatePost
  };
};