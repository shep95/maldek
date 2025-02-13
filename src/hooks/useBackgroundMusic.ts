
import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type BackgroundMusic = Database['public']['Tables']['user_background_music']['Row'];

const VOLUME_STORAGE_KEY = 'background_music_volume';
const AUTOPLAY_STORAGE_KEY = 'background_music_autoplay';
const LOOP_STORAGE_KEY = 'background_music_loop';

export const useBackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });
  const [isLooping, setIsLooping] = useState(() => {
    const savedLoop = localStorage.getItem(LOOP_STORAGE_KEY);
    return savedLoop === 'true';
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlist, setPlaylist] = useState<BackgroundMusic[]>([]);
  const queryClient = useQueryClient();

  const { data: backgroundMusic } = useQuery({
    queryKey: ['background-music'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_background_music')
        .select('*')
        .eq('user_id', user.id)
        .order('playlist_order', { ascending: true });

      if (error) {
        console.error('Error fetching background music:', error);
        return null;
      }

      setPlaylist(data || []);
      return data?.[currentTrackIndex] || null;
    },
    staleTime: Infinity
  });

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => {
      if (!isLooping) {
        playNext();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => toast.error('Error playing audio');

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [isLooping]);

  // Handle track source
  useEffect(() => {
    if (backgroundMusic?.music_url) {
      audioRef.current.src = backgroundMusic.music_url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => toast.error('Error playing audio'));
      }
    }
  }, [backgroundMusic?.music_url]);

  // Handle volume
  useEffect(() => {
    audioRef.current.volume = volume;
    localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
  }, [volume]);

  // Handle loop
  useEffect(() => {
    audioRef.current.loop = isLooping;
    localStorage.setItem(LOOP_STORAGE_KEY, isLooping.toString());
  }, [isLooping]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => toast.error('Error playing audio'));
    }
    localStorage.setItem(AUTOPLAY_STORAGE_KEY, (!isPlaying).toString());
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
  };

  const playPrevious = () => {
    if (playlist.length === 0) return;
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
  };

  const deleteTrack = async (trackId: string) => {
    try {
      const { error } = await supabase
        .from('user_background_music')
        .delete()
        .eq('id', trackId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['background-music'] });
      toast.success('Track deleted successfully');

      if (playlist[currentTrackIndex]?.id === trackId) {
        playNext();
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      toast.error('Failed to delete track');
    }
  };

  const toggleLoop = () => setIsLooping(!isLooping);
  const setMusicVolume = (newVolume: number) => setVolume(newVolume);
  const updatePlaylistOrder = (newPlaylist: BackgroundMusic[]) => setPlaylist(newPlaylist);

  return {
    isPlaying,
    volume,
    isLooping,
    togglePlay,
    toggleLoop,
    setVolume: setMusicVolume,
    playNext,
    playPrevious,
    deleteTrack,
    currentTrack: playlist[currentTrackIndex],
    updatePlaylistOrder,
    playlist
  };
};
