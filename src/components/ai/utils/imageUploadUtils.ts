
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleOfflineUpload } from "@/utils/offlineUploadUtils";
import { validateMediaFile, isVideoFile } from "@/utils/mediaUtils";

export const handleImageUpload = async (file: File, userId: string, onProgress?: (progress: number) => void) => {
  try {
    console.log('Starting media upload for user:', userId);
    console.log('File details:', { 
      name: file.name, 
      size: `${(file.size / 1024).toFixed(2)}KB`, 
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    // Verify file size and content
    const validation = await validateMediaFile(file, userId);
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

    // Determine bucket based on file type
    const bucket = isVideoFile(file) ? 'videos' : 'posts';
    console.log(`Uploading ${file.type} to ${bucket} bucket at path:`, filePath);
    toast.info(`Uploading ${isVideoFile(file) ? 'video' : 'media'}...`);

    // Track upload progress
    let lastProgress = 0;
    const options = {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
      duplex: 'half'
    };

    // Create XMLHttpRequest to track progress
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        if (progress !== lastProgress) {
          console.log(`Upload progress: ${progress.toFixed(2)}%`);
          onProgress?.(progress);
          lastProgress = progress;
        }
      }
    });

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, options);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log('Generated public URL:', data.publicUrl);
    toast.success(`${isVideoFile(file) ? 'Video' : 'Media'} uploaded successfully!`);
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
