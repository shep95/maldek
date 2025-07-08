import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Repeat, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";

interface MusicPlayerProps {
  className?: string;
}

export const MusicPlayer = ({ className }: MusicPlayerProps) => {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrevious, volume: musicVolume, setVolume: setMusicVolume, isLooping, toggleLoop } = useBackgroundMusic();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [localVolume, setLocalVolume] = useState(musicVolume * 100);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = localVolume / 100;
      audio.playbackRate = playbackSpeed;
      audio.loop = isLooping;

      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, [localVolume, playbackSpeed, isLooping]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  // Always show the music player interface
  const displayTrack = currentTrack || {
    title: 'No music loaded',
    music_url: '',
    duration: 0
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border",
      "hidden md:block",
      className
    )}>
      <audio
        ref={audioRef}
        src={currentTrack?.music_url || ''}
        onPlay={() => !isPlaying && togglePlay()}
        onPause={() => isPlaying && togglePlay()}
      />
      
      <div className="flex items-center justify-between px-6 py-3 max-w-full mx-auto">
        {/* Song Info */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-foreground truncate">
              {displayTrack.title}
            </h4>
            <p className="text-sm text-muted-foreground truncate">
              {currentTrack ? 'Music Track' : 'Upload music in your profile'}
            </p>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={playPrevious}
              className="h-8 w-8"
              disabled={!currentTrack}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              className="h-10 w-10"
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
              className="h-8 w-8"
              disabled={!currentTrack}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLoop}
              className={cn("h-8 w-8", isLooping && "text-accent")}
              disabled={!currentTrack}
            >
              <Repeat className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeedChange}
              className="text-xs px-2 h-8"
              disabled={!currentTrack}
            >
              {playbackSpeed}x
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-muted-foreground min-w-[35px]">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground min-w-[35px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[localVolume]}
            max={100}
            step={1}
            onValueChange={(value) => {
              setLocalVolume(value[0]);
              setMusicVolume(value[0] / 100);
            }}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};