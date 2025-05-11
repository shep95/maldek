
import { useState } from "react";
import { VideoUploadDialog } from "@/components/videos/VideoUploadDialog";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { debounce } from "lodash";
import { VideoDialog } from "@/components/videos/VideoDialog";
import { VideoGrid } from "@/components/videos/VideoGrid";
import { VideoControls } from "@/components/videos/controls/VideoControls";
import { cn } from "@/lib/utils";

const Videos = () => {
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const queryClient = useQueryClient();

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos', searchQuery, sortBy],
    queryFn: async () => {
      console.log('Fetching videos with search:', searchQuery);
      let query = supabase
        .from('videos')
        .select(`
          *,
          post_analytics(view_count),
          profiles:user_id(username, avatar_url)
        `);

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'views':
          query = query.order('trending_score', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
        throw error;
      }

      // Process video data to include view_count
      const processedVideos = data.map(video => ({
        ...video,
        view_count: video.post_analytics?.reduce((sum, analytics) => sum + (analytics.view_count || 0), 0) || 0
      }));

      console.log('Fetched videos with views:', processedVideos);
      return processedVideos;
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

  const handleVideoSelect = async (videoUrl: string, videoId: string) => {
    // Increment view count when a video is selected
    try {
      await supabase.rpc('increment_post_view', { post_id: videoId });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
    
    setSelectedVideo(videoUrl);
  };

  const handleSearch = debounce((value: string) => {
    console.log('Searching videos:', value);
    setSearchQuery(value);
  }, 300);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <VideoUploadDialog
        isOpen={isUploadingVideo}
        onOpenChange={setIsUploadingVideo}
      />

      <VideoDialog
        videoUrl={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Videos</h1>
          <p className="text-muted-foreground">
            Watch and share videos with the community
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              className="pl-10 w-full md:w-[300px]"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsUploadingVideo(true)}
            className="gap-2 bg-accent hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
            Upload Video
          </Button>
        </div>
      </div>

      <VideoControls
        viewMode={viewMode}
        sortBy={sortBy}
        onViewModeChange={setViewMode}
        onSortChange={setSortBy}
      />

      {isLoading ? (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        )}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-lg h-[300px] animate-pulse" />
          ))}
        </div>
      ) : videos && videos.length > 0 ? (
        <VideoGrid
          videos={videos}
          onVideoSelect={(url, id) => handleVideoSelect(url, id)}
          onDeleteVideo={handleDeleteVideo}
          viewMode={viewMode}
        />
      ) : (
        <div className="text-center py-12 bg-card rounded-lg">
          <h3 className="text-lg font-semibold mb-2">No videos found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try a different search term' : 'Be the first to share a video with the community'}
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
