
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });
  const [isLooping, setIsLooping] = useState(() => {
    const savedLoop = localStorage.getItem(LOOP_STORAGE_KEY);
    return savedLoop === 'true';
  });
  const [isFading, setIsFading] = useState(false);
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

      console.log('Fetched playlist:', data);
      setPlaylist(data);
      return data[currentTrackIndex];
    },
    staleTime: Infinity // Prevent unnecessary refetches
  });

  useEffect(() => {
    if (backgroundMusic?.music_url && !audioRef.current) {
      console.log('Initializing audio with URL:', backgroundMusic.music_url);
      audioRef.current = new Audio(backgroundMusic.music_url);
      audioRef.current.volume = volume;
      audioRef.current.loop = isLooping;
      
      // Set up event listeners
      audioRef.current.addEventListener('ended', () => {
        console.log('Track ended');
        if (!isLooping) {
          playNext();
        }
      });

      audioRef.current.addEventListener('play', () => {
        console.log('Audio started playing');
        setIsPlaying(true);
      });

      audioRef.current.addEventListener('pause', () => {
        console.log('Audio paused');
        setIsPlaying(false);
      });

      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
      });

      // Check if autoplay is enabled
      const shouldAutoplay = localStorage.getItem(AUTOPLAY_STORAGE_KEY) !== 'false';
      if (shouldAutoplay) {
        audioRef.current.play().catch(error => {
          console.error('Error starting autoplay:', error);
        });
      }
    }

    // Cleanup function that only stops the audio but doesn't remove the element
    return () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.pause();
      }
    };
  }, [backgroundMusic]);

  // Save volume to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Save loop state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOOP_STORAGE_KEY, isLooping.toString());
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  const playNext = () => {
    console.log('Playing next track');
    if (playlist.length === 0) return;
    
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    console.log('Next track index:', nextIndex);
    setCurrentTrackIndex(nextIndex);
    
    if (audioRef.current) {
      audioRef.current.src = playlist[nextIndex].music_url;
      audioRef.current.play().catch(error => {
        console.error('Error playing next track:', error);
      });
    }
  };

  const playPrevious = () => {
    console.log('Playing previous track');
    if (playlist.length === 0) return;
    
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    console.log('Previous track index:', prevIndex);
    setCurrentTrackIndex(prevIndex);
    
    if (audioRef.current) {
      audioRef.current.src = playlist[prevIndex].music_url;
      audioRef.current.play().catch(error => {
        console.error('Error playing previous track:', error);
      });
    }
  };

  const deleteTrack = async (trackId: string) => {
    try {
      const { error } = await supabase
        .from('user_background_music')
        .delete()
        .eq('id', trackId);

      if (error) throw error;

      // Update local state and refetch
      await queryClient.invalidateQuery({ queryKey: ['background-music'] });
      toast.success('Track deleted successfully');

      // If the current track was deleted, play the next one
      if (playlist[currentTrackIndex]?.id === trackId) {
        playNext();
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      toast.error('Failed to delete track');
    }
  };

  const togglePlay = () => {
    console.log('Toggling play/pause');
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem(AUTOPLAY_STORAGE_KEY, 'false');
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error toggling play:', error);
      });
      setIsPlaying(true);
      localStorage.setItem(AUTOPLAY_STORAGE_KEY, 'true');
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const setMusicVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const updatePlaylistOrder = (newPlaylist: BackgroundMusic[]) => {
    console.log('Updating playlist order:', newPlaylist);
    setPlaylist(newPlaylist);
  };

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
