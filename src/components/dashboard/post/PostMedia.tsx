
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

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick?: (url: string) => void;
  subscription?: any;
}

export const PostMedia = ({ mediaUrls, onMediaClick, subscription }: PostMediaProps) => {
  const [imageDimensions, setImageDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const [showWatermark, setShowWatermark] = useState(false);
  const hasPaidSubscription = subscription?.tier?.name === 'Creator' || 
                              subscription?.tier?.name === 'True Emperor';
  const [publicImageUrls, setPublicImageUrls] = useState<string[]>([]);
  
  useEffect(() => {
    // Process all media URLs to transform storage URLs to public URLs
    const processMediaUrls = async () => {
      // Filter and transform image URLs
      const imageUrls = mediaUrls.filter(url => !isVideoFile(url));
      const transformedImageUrls = imageUrls.map(url => getPublicUrl(url));
      setPublicImageUrls(transformedImageUrls);
      
      // Load dimensions for all images
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
          // Fallback dimensions if image fails to load
          resolve({ width: 16, height: 9 });
        };
        img.src = url;
      });
    };
    
    processMediaUrls();
  }, [mediaUrls]);

  useEffect(() => {
    if (hasPaidSubscription) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isPrintScreen = e.key === 'PrintScreen';
      const isMacScreenshot = (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '4';
      const isWindowsSnippingTool = (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 's';
      
      if (isPrintScreen || isMacScreenshot || isWindowsSnippingTool) {
        setShowWatermark(true);
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

  const getAspectRatio = (url: string) => {
    const dimensions = imageDimensions[url];
    if (!dimensions) return 16 / 9; // default aspect ratio while loading

    const ratio = dimensions.width / dimensions.height;
    
    // Check if it's close to common aspect ratios
    if (Math.abs(ratio - 1) < 0.1) return 1; // Square
    if (Math.abs(ratio - 16/9) < 0.1) return 16/9; // 16:9
    if (Math.abs(ratio - 4/3) < 0.1) return 4/3; // 4:3
    
    return ratio; // Use actual ratio if it doesn't match common ones
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
  
  // Check if there are 3 or more media items and if they're all images
  const imageUrls = mediaUrls.filter(url => !isVideoFile(url));
  const videoUrls = mediaUrls.filter(url => isVideoFile(url));
  
  // Use carousel for 3+ images
  const shouldUseCarousel = imageUrls.length >= 3;
  
  return (
    <div className="mt-4 space-y-4">
      {/* Display videos in grid */}
      {videoUrls.length > 0 && (
        <div className={`grid ${videoUrls.length === 1 ? '' : 'grid-cols-2'} gap-2`}>
          {videoUrls.map((url, i) => (
            <div key={url} className="relative overflow-hidden group rounded-lg">
              <VideoPlayer 
                videoUrl={url} 
                controls 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Display images in carousel if 3+ images */}
      {shouldUseCarousel && publicImageUrls.length >= 3 && (
        <ThreeDPhotoCarousel imageUrls={publicImageUrls} />
      )}
      
      {/* Display images in grid if less than 3 */}
      {imageUrls.length > 0 && imageUrls.length < 3 && (
        <div className={`grid ${imageUrls.length === 1 ? '' : 'grid-cols-2'} gap-2`}>
          {imageUrls.map((url, i) => {
            const publicUrl = getPublicUrl(url);
            const aspectRatio = getAspectRatio(url);
            
            return (
              <div key={url} className="relative overflow-hidden group rounded-lg">
                <div onClick={() => onMediaClick?.(publicUrl)}>
                  <AspectRatio ratio={aspectRatio}>
                    <div className="relative bg-black/5 rounded-lg">
                      <img
                        src={publicUrl}
                        alt={`Media content ${i + 1}`}
                        className="w-full h-full object-contain p-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] rounded-lg"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
