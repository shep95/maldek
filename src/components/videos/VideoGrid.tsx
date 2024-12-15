import { Play } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface VideoGridProps {
  videos: any[];
  onVideoSelect: (url: string) => void;
  onDeleteVideo: (id: string) => void;
}

export const VideoGrid = ({ videos, onVideoSelect, onDeleteVideo }: VideoGridProps) => {
  const session = useSession();

  const handleVideoClick = (video: any) => {
    console.log('Video clicked:', video);
    
    if (!video.video_url) {
      console.error('No video URL found:', video);
      toast.error("Video URL not found");
      return;
    }

    onVideoSelect(video.video_url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video: any) => (
        <div
          key={video.id}
          className="group relative bg-card rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
          onClick={() => handleVideoClick(video)}
        >
          <div className="aspect-video relative cursor-pointer">
            {/* Video Thumbnail */}
            <img
              src={video.thumbnail_url || "/placeholder.svg"}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                console.error('Thumbnail load error');
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Video Info */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight truncate">
                  {video.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {video.description}
                </p>
              </div>
              
              {session?.user?.id === video.user_id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteVideo(video.id);
                  }}
                  className="text-red-500 hover:text-red-600 px-2 py-1 rounded"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};