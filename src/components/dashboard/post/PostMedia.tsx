
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Maximize, Image as ImageIcon, Download } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/videos/VideoPlayer";

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

  const handleDownload = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = url.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      toast.success('Download started');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download media');
    }
  };

  return (
    <div className="mt-4">
      <div className={`grid ${mediaUrls.length === 1 ? '' : 'grid-cols-2'} gap-2`}>
        {mediaUrls.map((url, i) => {
          const isVideo = isVideoFile(url);
          const publicUrl = getPublicUrl(url);

          return (
            <div key={url} className="relative overflow-hidden group">
              {isVideo ? (
                <VideoPlayer 
                  videoUrl={url} 
                  controls 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div onClick={() => onMediaClick?.(publicUrl)}>
                  <AspectRatio ratio={mediaUrls.length === 1 ? 16 / 9 : 1}>
                    <img
                      src={publicUrl}
                      alt={`Media content ${i + 1}`}
                      className="w-full h-full object-cover bg-muted/10 rounded-[22px] cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/50 hover:bg-black/70"
                        onClick={(e) => handleDownload(publicUrl, e)}
                        title="Download media"
                      >
                        <Download className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/50 hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMediaClick?.(publicUrl);
                        }}
                        title="View full size"
                      >
                        <Maximize className="h-4 w-4 text-white" />
                      </Button>
                    </div>
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
