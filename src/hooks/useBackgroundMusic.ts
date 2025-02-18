
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
  const [audio] = useState(() => new Audio());
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
  const didInitialize = useRef(false);

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

  // Initial setup and autoplay
  useEffect(() => {
    if (backgroundMusic?.music_url && !didInitialize.current) {
      didInitialize.current = true;
      audio.volume = volume;
      audio.loop = isLooping;
      audio.src = backgroundMusic.music_url;
      
      // Always try to autoplay when music is first loaded after sign in
      audio.play().catch(() => {
        console.log('Autoplay prevented by browser. User interaction required.');
      });
    }
  }, [backgroundMusic?.music_url]);

  // Handle track ended
  useEffect(() => {
    const handleEnded = () => {
      if (!isLooping) {
        // If it's the last track and we're not looping the current track,
        // restart from the beginning of the playlist
        if (currentTrackIndex === playlist.length - 1) {
          setCurrentTrackIndex(0);
          if (playlist[0]?.music_url) {
            audio.src = playlist[0].music_url;
            audio.play().catch(console.error);
          }
        } else {
          playNext();
        }
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [isLooping, currentTrackIndex, playlist]);

  // Handle play/pause state
  useEffect(() => {
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Handle volume changes
  useEffect(() => {
    audio.volume = volume;
    localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
  }, [volume]);

  // Handle loop changes
  useEffect(() => {
    audio.loop = isLooping;
    localStorage.setItem(LOOP_STORAGE_KEY, isLooping.toString());
  }, [isLooping]);

  const togglePlay = () => {
    if (!audio.src && backgroundMusic?.music_url) {
      audio.src = backgroundMusic.music_url;
    }

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
    
    localStorage.setItem(AUTOPLAY_STORAGE_KEY, audio.paused ? 'false' : 'true');
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    
    if (playlist[nextIndex]?.music_url) {
      audio.src = playlist[nextIndex].music_url;
      audio.play().catch(console.error);
    }
  };

  const playPrevious = () => {
    if (playlist.length === 0) return;
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    
    if (playlist[prevIndex]?.music_url) {
      audio.src = playlist[prevIndex].music_url;
      audio.play().catch(console.error);
    }
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
