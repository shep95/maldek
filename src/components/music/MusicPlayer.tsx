import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Repeat, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MusicPlayerProps {
  className?: string;
}

export const MusicPlayer = ({ className }: MusicPlayerProps) => {
  const session = useSession();
  const { currentTrack, isPlaying, togglePlay, playNext, playPrevious, volume: musicVolume, setVolume: setMusicVolume, isLooping, toggleLoop } = useBackgroundMusic();
  const [localVolume, setLocalVolume] = useState(musicVolume * 100);

  // Get user profile for avatar
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, username')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Sync local volume with global volume
  useEffect(() => {
    setLocalVolume(musicVolume * 100);
  }, [musicVolume]);

  const handleTogglePlay = async () => {
    console.log('Play button clicked, currentTrack:', currentTrack);
    console.log('isPlaying:', isPlaying);
    try {
      await togglePlay();
    } catch (error) {
      console.error('Error in handleTogglePlay:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Always show the music player interface
  const displayTrack = currentTrack || {
    title: 'No music loaded',
    music_url: '',
    duration: 0
  };

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50",
      "bg-background/20 backdrop-blur-xl border border-white/10",
      "rounded-2xl shadow-2xl shadow-black/20",
      "hidden md:block w-auto max-w-2xl mx-4",
      "backdrop-saturate-150",
      className
    )}>
      <div className="flex items-center justify-between px-6 py-4 max-w-full mx-auto">
        {/* Song Info */}
        <div className="flex items-center space-x-3 min-w-0 w-48">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.username || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-white/70" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-white text-sm truncate">
              {displayTrack.title}
            </h4>
            <p className="text-xs text-white/60 truncate">
              {currentTrack ? 'Music Track' : 'Upload music in your profile'}
            </p>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex flex-col items-center space-y-2 w-80">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={playPrevious}
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10"
              disabled={!currentTrack}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={handleTogglePlay}
              className="h-9 w-9 bg-accent hover:bg-accent/80 text-white border-accent/20 rounded-lg"
              disabled={!currentTrack}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={playNext}
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10"
              disabled={!currentTrack}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLoop}
              className={cn("h-7 w-7 text-white/80 hover:text-white hover:bg-white/10", isLooping && "text-accent")}
              disabled={!currentTrack}
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-white/60 min-w-[35px]">
              0:00
            </span>
            <Slider
              value={[0]}
              max={100}
              step={1}
              onValueChange={() => {}}
              className="flex-1 [&>span:first-child]:bg-white/20 [&>span:first-child>span]:bg-accent [&>span:last-child]:bg-accent [&>span:last-child]:border-0 [&>span:last-child]:shadow-lg [&>span:last-child]:rounded-full"
              disabled={!currentTrack}
            />
            <span className="text-xs text-white/60 min-w-[35px]">
              {formatTime(currentTrack?.duration || 0)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 w-32 justify-end">
          <Volume2 className="h-4 w-4 text-white/60" />
          <Slider
            value={[localVolume]}
            max={100}
            step={1}
            onValueChange={(value) => {
              setLocalVolume(value[0]);
              setMusicVolume(value[0] / 100);
            }}
            className="w-20 [&>span:first-child]:bg-white/20 [&>span:first-child>span]:bg-accent [&>span:last-child]:bg-accent [&>span:last-child]:border-0 [&>span:last-child]:shadow-lg [&>span:last-child]:rounded-full"
          />
        </div>
      </div>
    </div>
  );
};