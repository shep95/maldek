import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleImageUpload = async (file: File, userId: string) => {
  try {
    console.log('Starting image upload for user:', userId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      console.error('Invalid file type:', file.type);
      toast.error("Please upload only images or videos");
      return null;
    }

    // Validate file size (100MB for videos, 5MB for images)
    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      toast.error(`File size must be less than ${file.type.startsWith('video/') ? '100MB' : '5MB'}`);
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log('Uploading file to path:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error("Failed to upload file");
      return null;
    }

    console.log('File uploaded successfully');

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in file upload:', error);
    toast.error("Failed to upload file");
    return null;
  }
};