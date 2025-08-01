
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Maximize, Image as ImageIcon, Download } from "lucide-react";
import { isVideoFile } from "@/utils/mediaUtils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { cn } from "@/lib/utils";
import { ThreeDPhotoCarousel } from "@/components/ui/3d-carousel";
import { TelegramMediaViewer } from "@/components/dashboard/TelegramMediaViewer";

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick?: (url: string) => void;
  subscription?: any;
}

export const PostMedia = ({ mediaUrls, onMediaClick, subscription }: PostMediaProps) => {
  const [imageDimensions, setImageDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const hasPaidSubscription = subscription?.tier?.name === 'Creator' || 
                              subscription?.tier?.name === 'True Emperor';
  const [publicImageUrls, setPublicImageUrls] = useState<string[]>([]);
  const [tgViewerOpen, setTgViewerOpen] = useState(false);
  const [tgViewerMedia, setTgViewerMedia] = useState<{ url: string; isVideo: boolean }>({ url: "", isVideo: false });

  useEffect(() => {
    const processMediaUrls = async () => {
      const imageUrls = mediaUrls.filter(url => !isVideoFile(url));
      const transformedImageUrls = imageUrls.map(url => getPublicUrl(url));
      setPublicImageUrls(transformedImageUrls);
      
      for (const url of imageUrls) {
        if (!isVideoFile(url)) {
          const publicUrl = getPublicUrl(url);
          try {
            const dimensions = await loadImageDimensions(publicUrl);
            setImageDimensions(prev => ({
              ...prev,
              [url]: dimensions
            }));
          } catch (err) {
            console.error("Failed to load image dimensions:", err);
          }
        }
      }
    };
    
    const loadImageDimensions = (url: string) => {
      return new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
          resolve({ width: 16, height: 9 });
        };
        img.src = url;
      });
    };
    
    processMediaUrls();
  }, [mediaUrls]);

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

  const getAspectRatio = (url: string) => {
    const dimensions = imageDimensions[url];
    if (!dimensions) return 16 / 9; // default aspect ratio while loading

    return dimensions.width / dimensions.height; // Return actual aspect ratio
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

  const handleImageClick = (url: string) => {
    setTgViewerMedia({ url, isVideo: false });
    setTgViewerOpen(true);
  };

  const handleVideoMaximize = (url: string) => {
    setTgViewerMedia({ url, isVideo: true });
    setTgViewerOpen(true);
  };

  const imageUrls = mediaUrls.filter(url => !isVideoFile(url));
  const videoUrls = mediaUrls.filter(url => isVideoFile(url));
  
  const shouldUseCarousel = imageUrls.length >= 3;
  
  return (
    <div className="mt-4 space-y-4">
      {videoUrls.length > 0 && (
        <div className={`grid ${videoUrls.length === 1 ? '' : 'grid-cols-2'} gap-2`}>
          {videoUrls.map((url, i) => (
            <div key={url} className="relative overflow-hidden group rounded-lg">
              <VideoPlayer
                videoUrl={url}
                controls
                className="w-full h-full object-contain rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white z-10"
                onClick={() => handleVideoMaximize(url)}
                title="View fullscreen"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {shouldUseCarousel && publicImageUrls.length >= 3 && (
        <ThreeDPhotoCarousel imageUrls={publicImageUrls} />
      )}

      {imageUrls.length > 0 && imageUrls.length < 3 && (
        <div className={`grid ${imageUrls.length === 1 ? '' : 'grid-cols-2'} gap-2`}>
          {imageUrls.map((url, i) => {
            const publicUrl = getPublicUrl(url);
            const aspectRatio = getAspectRatio(url);

            return (
              <div key={url} className="relative overflow-hidden group rounded-lg">
                <div onClick={() => handleImageClick(publicUrl)}>
                  <AspectRatio ratio={aspectRatio}>
                    <div className="relative bg-black/5 rounded-lg">
                      <img
                        src={publicUrl}
                        alt={`Media content ${i + 1}`}
                        className="w-full h-full object-contain p-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] rounded-lg"
                        loading="lazy"
                      />
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
                          handleImageClick(publicUrl);
                        }}
                        title="View"
                      >
                        <Maximize className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </AspectRatio>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TelegramMediaViewer
        open={tgViewerOpen}
        mediaUrl={tgViewerMedia.url}
        isVideo={tgViewerMedia.isVideo}
        onClose={() => setTgViewerOpen(false)}
        onFullscreen={() => {
          if (tgViewerMedia.isVideo || !tgViewerMedia.url) {
            window.open(tgViewerMedia.url, "_blank");
          } else {
            window.open(tgViewerMedia.url, "_blank");
          }
        }}
        onMinimize={() => setTgViewerOpen(false)}
        showMinimize={!tgViewerMedia.isVideo}
      />
    </div>
  );
};
