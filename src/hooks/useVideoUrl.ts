import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useVideoUrl = (videoUrl: string | null) => {
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPublicUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!videoUrl) {
          throw new Error('Invalid video URL');
        }

        console.log('useVideoUrl: Processing URL:', videoUrl);

        // If it's already a public URL, use it directly
        if (videoUrl.startsWith('http')) {
          console.log('useVideoUrl: Using direct URL:', videoUrl);
          setPublicUrl(videoUrl);
          return;
        }

        // Clean the path and ensure it's properly formatted
        const cleanPath = videoUrl.replace(/^\/+/, '').trim();
        console.log('useVideoUrl: Getting public URL for path:', cleanPath);

        // Get the public URL from Supabase storage
        const { data } = supabase.storage
          .from('videos')
          .getPublicUrl(cleanPath);

        if (!data?.publicUrl) {
          console.error('useVideoUrl: Failed to generate URL');
          throw new Error('Failed to generate video URL');
        }

        console.log('useVideoUrl: Generated public URL:', data.publicUrl);
        setPublicUrl(data.publicUrl);
      } catch (err) {
        console.error('useVideoUrl: Error getting video URL:', {
          error: err,
          originalUrl: videoUrl,
          message: err instanceof Error ? err.message : 'Failed to load video URL'
        });
        setError(err instanceof Error ? err.message : 'Failed to load video URL');
      } finally {
        setIsLoading(false);
      }
    };

    getPublicUrl();
  }, [videoUrl]);

  return { publicUrl, error, isLoading };
};