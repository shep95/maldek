import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface VideosTabProps {
  userId: string;
}

export const VideosTab = ({ userId }: VideosTabProps) => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['profile-videos', userId],
    queryFn: async () => {
      console.log('Fetching videos for user:', userId);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        throw error;
      }
      console.log('Fetched videos:', data);
      return data;
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-muted overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return videos && videos.length > 0 ? (
    <div className="grid gap-6 md:grid-cols-2">
      {videos.map((video) => (
        <div key={video.id} className="rounded-lg border border-muted overflow-hidden">
          <video
            src={video.video_url}
            poster={video.thumbnail_url}
            controls
            className="w-full"
          />
          <div className="p-4">
            <h3 className="font-semibold mb-2">{video.title}</h3>
            <p className="text-muted-foreground text-sm">{video.description}</p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="p-4 text-center text-muted-foreground">
      <div className="p-8 rounded-lg bg-gradient-to-b from-background/50 to-background/30 backdrop-blur-sm border border-accent/10 animate-fade-in">
        No videos yet
      </div>
    </div>
  );
};