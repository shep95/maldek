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
      "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50",
      "bg-background/20 backdrop-blur-xl border border-white/10",
      "rounded-2xl shadow-2xl shadow-black/20",
      "hidden md:block w-auto max-w-2xl mx-4",
      "backdrop-saturate-150",
      className
    )}>
      <audio
        ref={audioRef}
        src={currentTrack?.music_url || ''}
        onPlay={() => !isPlaying && togglePlay()}
        onPause={() => isPlaying && togglePlay()}
      />
      
      <div className="flex items-center justify-between px-6 py-4 max-w-full mx-auto">
        {/* Song Info */}
        <div className="flex items-center space-x-3 min-w-0 w-48">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
            <Volume2 className="h-4 w-4 text-white/70" />
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
              onClick={togglePlay}
              className="h-9 w-9 bg-white/20 hover:bg-white/30 text-white border-white/20"
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

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeedChange}
              className="text-xs px-2 h-7 text-white/80 hover:text-white hover:bg-white/10"
              disabled={!currentTrack}
            >
              {playbackSpeed}x
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-white/60 min-w-[35px]">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1 [&>span:first-child]:bg-white/20 [&>span:first-child>span]:bg-white [&>span:last-child]:bg-white [&>span:last-child]:border-white"
            />
            <span className="text-xs text-white/60 min-w-[35px]">
              {formatTime(duration)}
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
            className="w-20 [&>span:first-child]:bg-white/20 [&>span:first-child>span]:bg-white [&>span:last-child]:bg-white [&>span:last-child]:border-white"
          />
        </div>
      </div>
    </div>
  );
};