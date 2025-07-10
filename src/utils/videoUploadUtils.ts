
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadVideoToSupabase = async (
  videoFile: File,
  thumbnailFile: File,
  userId: string,
  onProgress?: (progress: number) => void
) => {
  try {
    // Step 1: Upload video (0-60%)
    onProgress?.(0);
    const videoPath = `${userId}/${Date.now()}_${videoFile.name}`;
    console.log('Uploading video to path:', videoPath);
    
    const { error: videoError } = await supabase.storage
      .from('videos') // Explicitly specify videos bucket
      .upload(videoPath, videoFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (videoError) {
      console.error('Video upload error:', videoError);
      throw new Error(`Failed to upload video: ${videoError.message}`);
    }

    onProgress?.(60);
    // Get video URL
    const { data: videoData } = supabase.storage
      .from('videos')
      .getPublicUrl(videoPath);

    // Step 2: Upload thumbnail (60-100%)
    const thumbnailPath = `${userId}/thumbnails/${Date.now()}_${thumbnailFile.name}`;
    console.log('Uploading thumbnail to path:', thumbnailPath);
    
    const { error: thumbnailError } = await supabase.storage
      .from('videos') // Same bucket for thumbnails
      .upload(thumbnailPath, thumbnailFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (thumbnailError) {
      console.error('Thumbnail upload error:', thumbnailError);
      throw new Error(`Failed to upload thumbnail: ${thumbnailError.message}`);
    }

    onProgress?.(100);

    // Get thumbnail URL
    const { data: thumbnailData } = supabase.storage
      .from('videos')
      .getPublicUrl(thumbnailPath);

    return {
      videoUrl: videoData.publicUrl,
      thumbnailUrl: thumbnailData.publicUrl
    };
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(error.message || "Failed to upload video");
    throw error;
  }
};
