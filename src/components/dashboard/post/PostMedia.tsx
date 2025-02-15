import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Maximize, Image as ImageIcon, Download } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { cn } from "@/lib/utils";

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick?: (url: string) => void;
  subscription?: any;
}

export const PostMedia = ({ mediaUrls, onMediaClick, subscription }: PostMediaProps) => {
  const [showWatermark, setShowWatermark] = useState(false);
  const hasPaidSubscription = subscription?.tier?.name === 'Creator' || 
                             subscription?.tier?.name === 'True Emperor';

  useEffect(() => {
    if (hasPaidSubscription) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect common screenshot shortcuts
      const isPrintScreen = e.key === 'PrintScreen';
      const isMacScreenshot = (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '4';
      const isWindowsSnippingTool = (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 's';
      
      if (isPrintScreen || isMacScreenshot || isWindowsSnippingTool) {
        setShowWatermark(true);
        // Keep watermark visible for a short duration after screenshot
        setTimeout(() => setShowWatermark(false), 2000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPaidSubscription]);

  if (!mediaUrls || mediaUrls.length === 0) {
    return null;
  }

  const canDownload = subscription?.tier?.name === 'Creator' || subscription?.tier?.name === 'True Emperor';

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
    
    if (!canDownload) {
      toast.error('Please upgrade to Creator or Emperor subscription to download media', {
        action: {
          label: "Upgrade",
          onClick: () => window.location.href = '/subscription'
        }
      });
      return;
    }

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
                    <div className="relative">
                      <img
                        src={publicUrl}
                        alt={`Media content ${i + 1}`}
                        className="w-full h-full object-cover bg-muted/10 rounded-[22px] cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                        loading="lazy"
                      />
                      {showWatermark && !hasPaidSubscription && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-white text-[100px] font-bold opacity-50 rotate-[-45deg]">
                            Bosley
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "bg-black/50 hover:bg-black/70",
                          !canDownload && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={(e) => handleDownload(publicUrl, e)}
                        title={canDownload ? "Download media" : "Upgrade to download"}
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
