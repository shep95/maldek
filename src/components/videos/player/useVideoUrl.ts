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
        console.log('URL type:', typeof videoUrl);
        console.log('URL length:', videoUrl?.length);
        
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
          // Clean the storage path by removing any leading slashes or spaces
          const cleanPath = videoUrl.replace(/^\/+/, '').trim();
          console.log('Original storage path:', videoUrl);
          console.log('Cleaned storage path:', cleanPath);
          
          // Get the public URL from the posts bucket
          const { data } = supabase.storage
            .from('posts')
            .getPublicUrl(cleanPath);

          if (!data?.publicUrl) {
            console.error('No public URL generated for path:', cleanPath);
            throw new Error('Failed to generate public URL');
          }

          console.log('Generated public URL:', data.publicUrl);
          
          // Verify the URL is accessible
          const response = await fetch(data.publicUrl, { method: 'HEAD' });
          if (!response.ok) {
            console.error('URL not accessible:', response.status, response.statusText);
            throw new Error(`URL not accessible: ${response.status}`);
          }

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