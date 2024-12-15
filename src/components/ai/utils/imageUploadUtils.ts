import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleImageUpload = async (file: File, userId: string) => {
  try {
    console.log('Starting media upload for user:', userId);
    console.log('File details:', { 
      name: file.name, 
      size: file.size, 
      type: file.type,
      lastModified: file.lastModified
    });

    // Increase size limit to 2GB for testing
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      toast.error(`File size must be less than 2GB`);
      return null;
    }

    // Generate file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log('Uploading file to path:', filePath);

    // Determine content type based on file type
    const isVideo = file.type.startsWith('video/');
    const contentType = isVideo ? 'video/mp4' : file.type;

    console.log('Using content type:', contentType, 'for file type:', file.type);

    // Upload with forced content type for videos
    const { error: uploadError, data } = await supabase.storage
      .from('posts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: contentType // Force video/mp4 for all video files
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error(`Upload failed: ${uploadError.message}`);
      return null;
    }

    console.log('File uploaded successfully, data:', data);

    // Get public URL with cache busting
    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);
    toast.success('Media uploaded successfully!');
    return publicUrl;

  } catch (error: any) {
    console.error('Upload error:', error);
    toast.error(`Upload failed: ${error.message}`);
    return null;
  }
};