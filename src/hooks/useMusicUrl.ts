import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useMusicUrl = (musicUrl: string | null) => {
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPublicUrl = async () => {
      // Gracefully handle null/undefined URLs without throwing errors
      if (!musicUrl) {
        setPublicUrl(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('useMusicUrl: Processing URL:', musicUrl);

        // If it's already a public URL, use it directly
        if (musicUrl.startsWith('http')) {
          console.log('useMusicUrl: Using direct URL:', musicUrl);
          setPublicUrl(musicUrl);
          return;
        }

        // Clean the path and ensure it's properly formatted
        const cleanPath = musicUrl.replace(/^\/+/, '').trim();
        console.log('useMusicUrl: Getting public URL for path:', cleanPath);

        // Get the public URL from Supabase storage
        const { data } = supabase.storage
          .from('background-music')
          .getPublicUrl(cleanPath);

        if (!data?.publicUrl) {
          console.error('useMusicUrl: Failed to generate URL');
          throw new Error('Failed to generate music URL');
        }

        console.log('useMusicUrl: Generated public URL:', data.publicUrl);
        setPublicUrl(data.publicUrl);
      } catch (err) {
        console.error('useMusicUrl: Error getting music URL:', {
          error: err,
          originalUrl: musicUrl,
          message: err instanceof Error ? err.message : 'Failed to load music URL'
        });
        setError(err instanceof Error ? err.message : 'Failed to load music URL');
      } finally {
        setIsLoading(false);
      }
    };

    getPublicUrl();
  }, [musicUrl]);

  return { publicUrl, error, isLoading };
};