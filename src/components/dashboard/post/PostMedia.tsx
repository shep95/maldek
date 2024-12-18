import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick?: (url: string) => void;
}

export const PostMedia = ({ mediaUrls, onMediaClick }: PostMediaProps) => {
  useEffect(() => {
    console.log('PostMedia mounted with URLs:', mediaUrls);
    
    // Validate each URL on mount
    mediaUrls.forEach(async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`URL ${url} status:`, response.status);
        if (!response.ok) {
          console.error(`Media URL validation failed for ${url}:`, {
            status: response.status,
            statusText: response.statusText
          });
        }
      } catch (error) {
        console.error(`Failed to validate URL ${url}:`, error);
      }
    });
  }, [mediaUrls]);

  if (!mediaUrls || mediaUrls.length === 0) {
    console.log('No media URLs provided');
    return null;
  }

  const extractFilePathFromUrl = (url: string): string => {
    try {
      // Handle both full Supabase URLs and relative paths
      const matches = url.match(/\/storage\/v\d\/object\/public\/posts\/(.+)/) || 
                     url.match(/\/posts\/(.+)/);
      if (matches && matches[1]) {
        console.log('Extracted file path:', matches[1]);
        return matches[1];
      }
      // Fallback to just the filename if no pattern matches
      const fileName = url.split('/').pop();
      console.log('Fallback file path:', fileName);
      return fileName || '';
    } catch (error) {
      console.error('Error extracting file path:', error);
      return '';
    }
  };

  const handleImageError = async (url: string, error: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image loading error for URL:', url);
    console.error('Error details:', {
      target: error.currentTarget.src,
      naturalWidth: error.currentTarget.naturalWidth,
      naturalHeight: error.currentTarget.naturalHeight,
      complete: error.currentTarget.complete,
      currentSrc: error.currentTarget.currentSrc
    });
    
    try {
      const filePath = extractFilePathFromUrl(url);
      console.log('Attempting to refresh URL for file:', filePath);

      if (!filePath) {
        throw new Error('Could not extract file path from URL');
      }

      const { data } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);
      
      if (data?.publicUrl) {
        console.log('Generated fresh public URL:', data.publicUrl);
        error.currentTarget.src = data.publicUrl;
        return;
      }
    } catch (fetchError) {
      console.error('Failed to refresh image URL:', fetchError);
    }

    // If refresh fails, show error state
    const img = error.currentTarget;
    img.style.display = 'none';
    
    // Add error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-2';
    errorDiv.textContent = 'Failed to load image';
    img.parentElement?.appendChild(errorDiv);
  };

  return (
    <div className="mt-4 grid gap-2 grid-cols-1">
      {mediaUrls.map((url, i) => {
        const isVideo = isVideoFile(url);
        console.log('Processing media URL:', url, 'Is video:', isVideo);

        return (
          <div key={url} className="relative rounded-lg overflow-hidden w-full max-w-3xl mx-auto">
            {isVideo ? (
              <AspectRatio ratio={16 / 9}>
                <video
                  src={url}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain bg-black rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    console.error('Video loading error:', e);
                    const video = e.currentTarget;
                    video.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-red-500 text-sm mt-2';
                    errorDiv.textContent = 'Failed to load video';
                    video.parentElement?.appendChild(errorDiv);
                  }}
                />
              </AspectRatio>
            ) : (
              <div 
                onClick={() => onMediaClick?.(url)} 
                className="cursor-pointer relative"
              >
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={url}
                    alt={`Media content ${i + 1}`}
                    className="w-full h-full object-contain rounded-lg hover:opacity-95 transition-opacity"
                    loading="lazy"
                    onError={(e) => handleImageError(url, e)}
                    onLoad={() => console.log('Image loaded successfully:', url)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                  >
                    <Maximize className="h-4 w-4 text-white" />
                  </Button>
                </AspectRatio>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};