import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { RightSidebar } from "@/components/dashboard/RightSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { VideoUploadDialog } from "@/components/videos/VideoUploadDialog";
import { Button } from "@/components/ui/button";
import { Plus, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Videos = () => {
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
        throw error;
      }

      return data;
    }
  });

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar setIsCreatingPost={() => {}} />

      <VideoUploadDialog
        isOpen={isUploadingVideo}
        onOpenChange={setIsUploadingVideo}
      />

      <main className="flex-1 p-4 md:ml-72 lg:mr-96 md:p-8 pb-20 md:pb-8">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Videos</h1>
            <Button
              onClick={() => setIsUploadingVideo(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Upload Video
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading videos...</div>
          ) : videos && videos.length > 0 ? (
            <div className="grid gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-card rounded-lg overflow-hidden shadow-lg"
                >
                  <div className="aspect-video relative">
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                    <p className="text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              No videos yet. Upload your first video!
            </div>
          )}
        </div>
      </main>

      <RightSidebar />
      <MobileNav />
    </div>
  );
};

export default Videos;