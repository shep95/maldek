import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Trash2, Play, Pause } from "lucide-react";
import { MusicUpload } from "@/components/music/MusicUpload";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";

interface MusicTrack {
  id: string;
  title: string;
  music_url: string;
  duration: number;
  playlist_order: number;
  created_at: string;
}

export const ProfileMusicTab = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const { currentTrack, isPlaying, togglePlay } = useBackgroundMusic();
  const [deletingTrack, setDeletingTrack] = useState<string | null>(null);

  const { data: musicTracks, isLoading } = useQuery({
    queryKey: ['user-music', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const { data, error } = await supabase
        .from('user_background_music')
        .select('*')
        .eq('user_id', session.user.id)
        .order('playlist_order', { ascending: true });

      if (error) {
        console.error('Error fetching music:', error);
        throw error;
      }

      return data as MusicTrack[];
    },
    enabled: !!session?.user?.id,
  });

  const handleDeleteTrack = async (trackId: string, musicUrl: string) => {
    if (!session?.user?.id) return;

    setDeletingTrack(trackId);

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('user_background_music')
        .delete()
        .eq('id', trackId)
        .eq('user_id', session.user.id);

      if (dbError) throw dbError;

      // Delete from storage
      if (musicUrl) {
        const fileName = musicUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('background-music')
            .remove([`${session.user.id}/${fileName}`]);
        }
      }

      // Invalidate queries to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['user-music'] });
      await queryClient.invalidateQueries({ queryKey: ['background-music'] });

      toast.success("Track deleted successfully");

    } catch (error) {
      console.error('Error deleting track:', error);
      toast.error("Failed to delete track");
    } finally {
      setDeletingTrack(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayTrack = (track: MusicTrack) => {
    // If this track is currently playing, toggle pause
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      // If it's a different track, we'd need to implement track switching
      // For now, just show a message
      toast.info("Use the music player at the bottom to control playback");
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to manage your music playlist</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Upload New Music</h3>
        <MusicUpload onUploadComplete={() => {
          // Refresh the music list after upload
          queryClient.invalidateQueries({ queryKey: ['user-music'] });
        }} />
      </div>

      {/* Playlist Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Playlist</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : musicTracks && musicTracks.length > 0 ? (
          <div className="space-y-3">
            {musicTracks.map((track) => (
              <Card key={track.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePlayTrack(track)}
                        className="flex-shrink-0"
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Music className="h-8 w-8 text-accent flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{track.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDuration(track.duration)} • {new Date(track.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTrack(track.id, track.music_url)}
                      disabled={deletingTrack === track.id}
                      className="text-red-500 hover:text-red-600 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-2">No music uploaded yet</h4>
              <p className="text-sm text-muted-foreground">
                Upload your first track to start building your playlist
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};