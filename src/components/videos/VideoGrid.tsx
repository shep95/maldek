import { useState } from "react";
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from "sonner";
import { Play } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { VideoMetadata } from "./VideoMetadata";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface VideoGridProps {
  videos: any[];
  onVideoSelect: (url: string) => void;
  onDeleteVideo: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

export const VideoGrid = ({ 
  videos, 
  onVideoSelect, 
  onDeleteVideo,
  viewMode = 'grid' 
}: VideoGridProps) => {
  const session = useSession();

  const handleVideoClick = async (video: any) => {
    console.log('Video clicked:', {
      id: video.id,
      title: video.title,
      video_url: video.video_url,
      storage_path: !video.video_url.startsWith('http') ? video.video_url : 'direct_url',
      full_details: video
    });
    
    if (!video.video_url) {
      console.error('No video URL found:', video);
      toast.error("Video URL not found");
      return;
    }

    // Get public URL if it's a storage path
    let publicUrl = video.video_url;
    if (!video.video_url.startsWith('http')) {
      const { data } = supabase.storage
        .from('videos')
        .getPublicUrl(video.video_url);
      publicUrl = data.publicUrl;
      console.log('Generated public URL:', {
        original: video.video_url,
        public: publicUrl,
        bucket: 'videos',
        isStoragePath: true
      });
    } else {
      console.log('Using direct URL:', {
        url: publicUrl,
        isStoragePath: false
      });
    }

    onVideoSelect(publicUrl);
  };

  // Log all videos on render for debugging
  console.log('All videos:', videos.map(v => ({
    id: v.id,
    title: v.title,
    video_url: v.video_url,
    storage_path: !v.video_url.startsWith('http') ? v.video_url : 'direct_url',
    created_at: v.created_at,
    user_id: v.user_id
  })));

  return (
    <div className={cn(
      "grid gap-6",
      viewMode === 'grid' 
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
        : "grid-cols-1"
    )}>
      {videos.map((video: any) => {
        // Get public URL for thumbnail
        let thumbnailUrl = video.thumbnail_url;
        if (!video.thumbnail_url.startsWith('http')) {
          const { data } = supabase.storage
            .from('videos')
            .getPublicUrl(video.thumbnail_url);
          thumbnailUrl = data.publicUrl;
        }

        // Log individual video details
        console.log(`Processing video "${video.title}":`, {
          id: video.id,
          video_url: video.video_url,
          thumbnail_url: thumbnailUrl,
          original_thumbnail: video.thumbnail_url,
          storage_path: !video.video_url.startsWith('http') ? video.video_url : 'direct_url'
        });

        return (
          <div
            key={video.id}
            className={cn(
              "group relative bg-card rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300",
              viewMode === 'list' && "flex gap-4"
            )}
            onClick={() => handleVideoClick(video)}
          >
            <div className="relative cursor-pointer aspect-video">
              <img
                src={thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Error loading thumbnail:', video.thumbnail_url);
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-12 w-12 text-white" />
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Video Info */}
            <div className="p-4 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg leading-tight truncate">
                    {video.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {video.description}
                  </p>
                  <VideoMetadata
                    views={video.view_count}
                    createdAt={video.created_at}
                    duration={video.duration}
                  />
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
        );
      })}
    </div>
  );
};