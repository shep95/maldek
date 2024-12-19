import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Maximize, Image as ImageIcon } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick?: (url: string) => void;
}

export const PostMedia = ({ mediaUrls, onMediaClick }: PostMediaProps) => {
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>(
    mediaUrls.reduce((acc, url) => ({ ...acc, [url]: true }), {})
  );
  const [errorStates, setErrorStates] = useState<{ [key: string]: boolean }>(
    mediaUrls.reduce((acc, url) => ({ ...acc, [url]: false }), {})
  );

  if (!mediaUrls || mediaUrls.length === 0) {
    console.log('No media URLs provided');
    return null;
  }

  const getPublicUrl = (url: string) => {
    if (url.startsWith('http')) {
      console.log('URL is already public:', url);
      return url;
    }
    const { data } = supabase.storage
      .from('posts')
      .getPublicUrl(url);
    console.log('Generated public URL:', data.publicUrl);
    return data.publicUrl;
  };

  const handleImageLoad = (url: string) => {
    console.log('Image loaded successfully:', url);
    setLoadingStates(prev => ({ ...prev, [url]: false }));
  };

  const handleImageError = (url: string, e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image loading error:', {
      url,
      src: e.currentTarget.src,
      naturalWidth: e.currentTarget.naturalWidth,
      naturalHeight: e.currentTarget.naturalHeight,
      complete: e.currentTarget.complete
    });
    
    setLoadingStates(prev => ({ ...prev, [url]: false }));
    setErrorStates(prev => ({ ...prev, [url]: true }));
  };

  return (
    <div className="mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
      {mediaUrls.map((url, i) => {
        const isVideo = isVideoFile(url);
        const publicUrl = getPublicUrl(url);
        console.log('Processing media URL:', url, 'Public URL:', publicUrl, 'Is video:', isVideo);

        return (
          <div key={url} className="relative rounded-lg overflow-hidden group">
            {loadingStates[url] && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
              </div>
            )}

            {isVideo ? (
              <AspectRatio ratio={16 / 9}>
                <video
                  src={publicUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover bg-muted rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                  onLoadStart={() => console.log('Video loading started:', url)}
                  onLoadedData={() => setLoadingStates(prev => ({ ...prev, [url]: false }))}
                  onError={(e) => {
                    console.error('Video loading error:', e);
                    setLoadingStates(prev => ({ ...prev, [url]: false }));
                    setErrorStates(prev => ({ ...prev, [url]: true }));
                  }}
                />
              </AspectRatio>
            ) : (
              <div 
                onClick={() => !errorStates[url] && onMediaClick?.(publicUrl)} 
                className="cursor-pointer relative"
              >
                <AspectRatio ratio={16 / 9}>
                  {errorStates[url] ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                      <div className="text-center p-4">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Failed to load media</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={publicUrl}
                      alt={`Media content ${i + 1}`}
                      className="w-full h-full object-cover rounded-lg transition-opacity duration-200 hover:opacity-95"
                      loading="lazy"
                      onLoad={() => handleImageLoad(url)}
                      onError={(e) => handleImageError(url, e)}
                      style={{ display: loadingStates[url] ? 'none' : 'block' }}
                    />
                  )}
                  {!errorStates[url] && !loadingStates[url] && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMediaClick?.(publicUrl);
                      }}
                    >
                      <Maximize className="h-4 w-4 text-white" />
                    </Button>
                  )}
                </AspectRatio>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};