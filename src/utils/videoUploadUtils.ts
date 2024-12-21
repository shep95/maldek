import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadVideoToSupabase = async (
  videoFile: File,
  thumbnailFile: File,
  userId: string
) => {
  try {
    // Upload video to videos bucket
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

    // Get video URL
    const { data: videoData } = supabase.storage
      .from('videos')
      .getPublicUrl(videoPath);

    // Upload thumbnail to videos bucket
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