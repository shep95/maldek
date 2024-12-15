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

    // Log the upload attempt
    console.log('Attempting upload with config:', {
      bucket,
      filePath,
      fileSize: file.size,
      fileType: file.type,
      cacheControl: '3600',
      upsert: true
    });

    // Test bucket access before upload
    const { data: bucketInfo, error: bucketError } = await supabase
      .storage
      .getBucket(bucket);

    if (bucketError) {
      console.error('Bucket access error:', bucketError);
      toast.error(`Storage bucket access error: ${bucketError.message}`);
      return null;
    }

    console.log('Bucket info:', bucketInfo);

    // Attempt the upload
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error details:', {
        name: uploadError.name,
        message: uploadError.message,
        stack: uploadError.stack
      });
      toast.error(`Upload error: ${uploadError.message}`);
      return null;
    }

    console.log('File uploaded successfully, data:', data);

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);
    
    // Verify the uploaded file
    const { data: fileData, error: fileError } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (fileError) {
      console.error('File verification error:', fileError);
      toast.error('File uploaded but verification failed');
      return null;
    }

    console.log('File verified successfully');
    return publicUrl;

  } catch (error: any) {
    console.error('Detailed error in file upload:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    toast.error(`Upload error: ${error.message}`);
    return null;
  }
};