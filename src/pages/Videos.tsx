import { useState } from "react";
import { VideoUploadDialog } from "@/components/videos/VideoUploadDialog";
import { Button } from "@/components/ui/button";
import { Plus, Play, Clock } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSession } from "@supabase/auth-helpers-react";

const Videos = () => {
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const session = useSession();
  const queryClient = useQueryClient();

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*, profiles:user_id(username, avatar_url)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
        throw error;
      }

      return data;
    }
  });

  const handleDeleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <VideoUploadDialog
        isOpen={isUploadingVideo}
        onOpenChange={setIsUploadingVideo}
      />

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="sm:max-w-4xl bg-black p-0 overflow-hidden">
          {selectedVideo && (
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full h-full"
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Videos</h1>
          <p className="text-muted-foreground">
            Watch and share videos with the community
          </p>
        </div>
        <Button
          onClick={() => setIsUploadingVideo(true)}
          className="gap-2 bg-accent hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          Upload Video
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-lg h-[300px]" />
          ))}
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video: any) => (
            <div
              key={video.id}
              className="group bg-card rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in"
            >
              <div 
                className="aspect-video relative cursor-pointer"
                onClick={() => setSelectedVideo(video.video_url)}
              >
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(video.duration)}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={video.profiles?.avatar_url || "/placeholder.svg"}
                    alt={video.profiles?.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg leading-tight truncate mb-1">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {video.profiles?.username || 'Unknown user'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {session?.user?.id === video.user_id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteVideo(video.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg">
          <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to share a video with the community
          </p>
          <Button
            onClick={() => setIsUploadingVideo(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Upload Video
          </Button>
        </div>
      )}
    </div>
  );
};

export default Videos;