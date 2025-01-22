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
  if (!mediaUrls || mediaUrls.length === 0) {
    return null;
  }

  const getPublicUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    }
    const { data } = supabase.storage
      .from('posts')
      .getPublicUrl(url);
    return data.publicUrl;
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-2">
        {mediaUrls.map((url, i) => {
          const isVideo = isVideoFile(url);
          const publicUrl = getPublicUrl(url);

          return (
            <div key={url} className="relative overflow-hidden group">
              {isVideo ? (
                <AspectRatio ratio={16 / 9}>
                  <video
                    src={publicUrl}
                    controls
                    playsInline
                    loop
                    preload="metadata"
                    className="w-full h-full object-cover bg-muted rounded-[22px]"
                    onClick={(e) => e.stopPropagation()}
                  />
                </AspectRatio>
              ) : (
                <div onClick={() => onMediaClick?.(publicUrl)}>
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={publicUrl}
                      alt={`Media content ${i + 1}`}
                      className="w-full h-full object-cover bg-muted/10 rounded-[22px] cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      loading="lazy"
                    />
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
                  </AspectRatio>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};