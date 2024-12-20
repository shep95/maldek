import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleOfflineUpload } from "@/utils/offlineUploadUtils";
import { validateMediaFile } from "@/utils/mediaUtils";

export const handleImageUpload = async (file: File, userId: string) => {
  try {
    console.log('Starting media upload for user:', userId);
    console.log('File details:', { 
      name: file.name, 
      size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`, 
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    // Verify file size and content
    const validation = await validateMediaFile(file);
    if (!validation.isValid) {
      console.error('File validation failed:', validation.error);
      toast.error(validation.error);
      return null;
    }

    // Check if device is offline and handle offline upload
    const canUploadNow = await handleOfflineUpload(file, userId, {
      type: file.type,
      originalName: file.name
    });

    if (!canUploadNow) {
      return null;
    }

    // Generate file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log('Starting upload to path:', filePath);
    toast.info('Uploading file...');

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    console.log('Generated public URL:', data.publicUrl);
    toast.success('Media uploaded successfully!');
    return data.publicUrl;

  } catch (error: any) {
    console.error('Upload error:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    
    toast.error(`Upload failed: ${error.message}`);
    return null;
  }
};