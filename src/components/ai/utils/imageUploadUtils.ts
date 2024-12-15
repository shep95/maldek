import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { compressVideo } from "@/utils/videoCompression";
import { handleOfflineUpload } from "@/utils/offlineUploadUtils";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

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

    console.log('Starting chunked upload to path:', filePath);
    toast.info('Uploading file...');

    // Implement chunked upload
    const chunks = Math.ceil(processedFile.size / CHUNK_SIZE);
    const uploadPromises = [];

    for (let i = 0; i < chunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, processedFile.size);
      const chunk = processedFile.slice(start, end);
      const chunkPath = `${filePath}_chunk_${i}`;

      uploadPromises.push(
        supabase.storage
          .from('posts')
          .upload(chunkPath, chunk, {
            cacheControl: '3600',
            upsert: true
          })
      );

      // Update progress
      const progress = Math.round((i + 1) / chunks * 100);
      console.log(`Upload progress: ${progress}%`);
      if (progress % 20 === 0) { // Show progress every 20%
        toast.info(`Upload progress: ${progress}%`);
      }
    }

    // Wait for all chunks to upload
    const results = await Promise.all(uploadPromises);
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      console.error('Chunk upload errors:', errors);
      toast.error('Upload failed. Please try again.');
      return null;
    }

    console.log('All chunks uploaded successfully');

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