import { Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoGridProps {
  videos: any[];
  onVideoSelect: (url: string) => void;
  onDeleteVideo: (id: string) => void;
}

export const VideoGrid = ({ videos, onVideoSelect, onDeleteVideo }: VideoGridProps) => {
  const session = useSession();

  const handleVideoClick = async (video: any) => {
    console.log('Video clicked:', video);
    
    if (!video.video_url) {
      console.error('No video URL found:', video);
      toast.error("Video URL not found");
      return;
    }

    try {
      // Get a fresh public URL for the video
      const { data: { publicUrl } } = supabase
        .storage
        .from('videos')
        .getPublicUrl(video.video_url.split('/').pop() || '');

      console.log('Opening video with public URL:', publicUrl);
      onVideoSelect(publicUrl);
      
    } catch (error) {
      console.error('Error handling video click:', error);
      toast.error("Failed to load video");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video: any) => (
        <div
          key={video.id}
          className="group bg-card rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in"
          onClick={() => handleVideoClick(video)}
        >
          <div className="aspect-video relative cursor-pointer">
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={`Thumbnail for ${video.title}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  console.error('Thumbnail load error:', e);
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full bg-black/20 flex items-center justify-center">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-12 w-12 text-white" />
            </div>
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(video.duration)}
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <img
                src={video.profiles?.avatar_url || "/placeholder.svg"}
                alt={`${video.profiles?.username || 'Unknown user'}'s avatar`}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight truncate mb-1">
                  {video.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {video.profiles?.username || 'Unknown user'}
                </p>
              </div>
              {session?.user?.id === video.user_id && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteVideo(video.id);
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const formatDuration = (seconds: number) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default VideoGrid;
