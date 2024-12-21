import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVideoUrl = (videoUrl: string) => {
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPublicUrl = async () => {
      try {
        console.log('Processing video URL:', videoUrl);
        
        if (!videoUrl) {
          console.error('Invalid video URL:', videoUrl);
          setError('Invalid video URL');
          setIsLoading(false);
          return;
        }

        // If it's already a public URL, use it directly
        if (videoUrl.startsWith('http')) {
          console.log('Using direct URL:', videoUrl);
          const response = await fetch(videoUrl, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`URL not accessible: ${response.status}`);
          }
          setPublicUrl(videoUrl);
        } else {
          // If it's a storage path, get the public URL
          console.log('Getting public URL for storage path:', videoUrl);
          const { data } = supabase.storage
            .from('posts')
            .getPublicUrl(videoUrl);

          if (!data?.publicUrl) {
            throw new Error('Failed to generate public URL');
          }

          console.log('Generated public URL:', data.publicUrl);
          setPublicUrl(data.publicUrl);
        }
      } catch (err) {
        console.error('Error getting video URL:', err);
        setError('Failed to load video URL');
      } finally {
        setIsLoading(false);
      }
    };

    getPublicUrl();
  }, [videoUrl]);

  return { publicUrl, error, isLoading };
};