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

    // Enhanced upload configuration
    const { error: uploadError, data } = await supabase.storage
      .from('posts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type.startsWith('video/') ? 'video/mp4' : file.type // Force video/mp4 for videos
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
      .getPublicUrl(filePath, {
        transform: {
          quality: file.type.startsWith('video/') ? undefined : 75
        }
      });

    console.log('Generated public URL:', publicUrl);
    toast.success('Media uploaded successfully!');
    return publicUrl;

  } catch (error: any) {
    console.error('Upload error:', error);
    toast.error(`Upload failed: ${error.message}`);
    return null;
  }
};