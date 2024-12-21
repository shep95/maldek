import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVideoUrl = (videoUrl: string) => {
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPublicUrl = async () => {
      try {
        if (!videoUrl) {
          console.error('Invalid video URL:', videoUrl);
          setError('Invalid video URL');
          setIsLoading(false);
          return;
        }

        if (videoUrl.startsWith('http')) {
          console.log('Using direct URL:', videoUrl);
          setPublicUrl(videoUrl);
        } else {
          const cleanPath = videoUrl.replace(/^\/+/, '').trim();
          console.log('Cleaned video path:', cleanPath);
          
          // Use 'posts' bucket instead of 'videos'
          const { data } = supabase.storage
            .from('posts')
            .getPublicUrl(cleanPath);

          if (!data?.publicUrl) {
            console.error('Failed to generate public URL');
            setError('Failed to generate video URL');
            setIsLoading(false);
            return;
          }

          // Verify URL accessibility
          try {
            const response = await fetch(data.publicUrl, { method: 'HEAD' });
            if (!response.ok) {
              throw new Error(`URL not accessible: ${response.status}`);
            }
            console.log('Video URL is accessible:', data.publicUrl);
            setPublicUrl(data.publicUrl);
          } catch (err) {
            console.error('Error verifying video URL:', err);
            setError('Video file not accessible');
          }
        }
      } catch (err) {
        console.error('Error getting public URL:', err);
        setError('Failed to load video URL');
      } finally {
        setIsLoading(false);
      }
    };

    getPublicUrl();
  }, [videoUrl]);

  return { publicUrl, error, isLoading };
};