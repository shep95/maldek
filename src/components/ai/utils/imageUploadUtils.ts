import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { compressVideo } from "@/utils/videoCompression";
import { handleOfflineUpload } from "@/utils/offlineUploadUtils";

export const handleImageUpload = async (file: File, userId: string) => {
  try {
    console.log('Starting media upload for user:', userId);
    console.log('File details:', { 
      name: file.name, 
      size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`, 
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    let processedFile = file;
    if (file.type.startsWith('video/')) {
      try {
        processedFile = await compressVideo(file);
      } catch (error) {
        console.error('Compression error:', error);
        toast.error('Failed to compress video');
        return null;
      }
    }

    // Verify final file size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (processedFile.size > maxSize) {
      console.error('File still too large after compression:', `${(processedFile.size / (1024 * 1024)).toFixed(2)}MB`);
      toast.error(`File size must be less than 50MB. Please try a smaller file.`);
      return null;
    }

    // Check if device is offline and handle offline upload
    const canUploadNow = await handleOfflineUpload(processedFile, userId, {
      type: processedFile.type,
      originalName: file.name
    });

    if (!canUploadNow) {
      return null;
    }

    // Generate file path
    const fileExt = processedFile.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log('Starting upload to path:', filePath);
    toast.info('Uploading file...');

    // Upload file
    const { error: uploadError, data } = await supabase.storage
      .from('posts')
      .upload(filePath, processedFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: processedFile.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error(`Upload failed: ${uploadError.message}`);
      return null;
    }

    console.log('File uploaded successfully, data:', data);

    // Get public URL
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