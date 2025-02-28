import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoGrid } from "@/components/videos/VideoGrid";
import { VideoDialog } from "@/components/videos/VideoDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Videos = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch videos
  const { data: videos = [], isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*');

      if (error) {
        console.error('Error fetching videos:', error);
        throw error;
      }

      return data;
    },
  });

  const handleDeleteVideo = async (id: string) => {
    try {
      await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      // Optionally refetch videos or update state
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-8">
      <h1 className="text-3xl font-bold">Videos</h1>
      
      {/* VideoGrid with refactored handler */}
      <VideoGrid 
        videos={videos} 
        onVideoSelect={url => setSelectedVideo(url)}
        onDeleteVideo={handleDeleteVideo} 
        viewMode={viewMode}
      />
      
      {/* Video Dialog */}
      <VideoDialog 
        videoUrl={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
      />
      
      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-red-500">
          Error loading videos: {error.message}
        </div>
      )}
    </div>
  );
};

export default Videos;
