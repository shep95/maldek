import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleImageUpload = async (file: File, userId: string) => {
  try {
    console.log('Starting media upload for user:', userId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    // Increase size limit to 500MB for testing
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      toast.error(`File size must be less than 500MB`);
      return null;
    }

    // Determine if it's a video file
    const isVideo = file.type.startsWith('video/');
    console.log('File type:', isVideo ? 'video' : 'image');

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log('Uploading file to path:', filePath);

    // Use the videos bucket for video files, posts bucket for images
    const bucket = isVideo ? 'videos' : 'posts';
    console.log('Using storage bucket:', bucket);

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error(`Upload error: ${uploadError.message}`);
      return null;
    }

    console.log('File uploaded successfully, data:', data);

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in file upload:', error);
    toast.error(`Upload error: ${error.message}`);
    return null;
  }
};