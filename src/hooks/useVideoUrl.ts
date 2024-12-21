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

        // If it's already a public URL, use it directly
        if (videoUrl.startsWith('http')) {
          console.log('Using direct URL:', videoUrl);
          setPublicUrl(videoUrl);
          return;
        }

        // Clean the path and ensure it's properly formatted
        const cleanPath = videoUrl.replace(/^\/+/, '').trim();
        console.log('Getting public URL for path:', cleanPath);

        const { data } = supabase.storage
          .from('videos')
          .getPublicUrl(cleanPath);

        if (!data?.publicUrl) {
          throw new Error('Failed to generate video URL');
        }

        console.log('Generated public URL:', data.publicUrl);
        setPublicUrl(data.publicUrl);
      } catch (err) {
        console.error('Error getting video URL:', err);
        setError(err instanceof Error ? err.message : 'Failed to load video URL');
      } finally {
        setIsLoading(false);
      }
    };

    getPublicUrl();
  }, [videoUrl]);

  return { publicUrl, error, isLoading };
};