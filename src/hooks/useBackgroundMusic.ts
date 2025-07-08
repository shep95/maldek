
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

  const { data: backgroundMusic, refetch: refetchMusic } = useQuery({
    queryKey: ['user-music'],
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

      if (data && data.length > 0) {
        setPlaylist(data);
        return data[0]; // Always return the first track initially
      }
      
      return null;
    },
    staleTime: 30000, // Cache for 30 seconds to allow for real-time updates
    enabled: true // Ensure query runs
  });

  // Real-time subscription for music updates
  useEffect(() => {
    const channel = supabase
      .channel('background-music-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_background_music'
        },
        () => {
          console.log('Background music changed, refetching...');
          refetchMusic();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchMusic]);

  // Initial setup and autoplay
  useEffect(() => {
    if (backgroundMusic?.music_url && !didInitialize.current) {
      didInitialize.current = true;
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      audio.volume = volume;
      audio.loop = isLooping;
      audio.src = backgroundMusic.music_url;
      
      // Don't autoplay immediately, wait for user interaction
      console.log('Music loaded:', backgroundMusic.title);
    }
  }, [backgroundMusic?.music_url, audio, volume, isLooping]);

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

  const togglePlay = async () => {
    try {
      // Ensure we have a track and audio source
      const currentTrack = backgroundMusic || playlist[currentTrackIndex];
      if (!currentTrack?.music_url) {
        toast.error('No music track available');
        return;
      }

      if (isPlaying) {
        audio.pause();
        console.log('Paused:', currentTrack.title);
        return;
      }

      // Load audio via fetch to avoid CORS issues
      console.log('Loading audio from:', currentTrack.music_url);
      
      try {
        const response = await fetch(currentTrack.music_url);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status}`);
        }
        
        console.log('Response headers:', response.headers.get('content-type'));
        const audioBlob = await response.blob();
        console.log('Audio blob type:', audioBlob.type, 'size:', audioBlob.size);
        
        // Check if the blob is actually audio
        if (!audioBlob.type.startsWith('audio/') && audioBlob.size === 0) {
          throw new Error('Invalid audio file or empty response');
        }
        
        // Try direct URL first as fallback
        audio.src = currentTrack.music_url;
        audio.crossOrigin = 'anonymous';
        audio.volume = volume;
        audio.loop = isLooping;
        
        await audio.play();
        console.log('Successfully playing:', currentTrack.title);
        
        localStorage.setItem(AUTOPLAY_STORAGE_KEY, 'true');
      } catch (fetchError) {
        console.error('Audio load error:', fetchError);
        console.error('Failed URL:', currentTrack.music_url);
        throw new Error(`Audio playback failed: ${fetchError.message}`);
      }
    } catch (error) {
      console.error('Error toggling play:', error);
      toast.error('Failed to play music. Try refreshing the page.');
    }
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

      await queryClient.invalidateQueries({ queryKey: ['user-music'] });
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
    currentTrack: backgroundMusic || playlist[currentTrackIndex],
    updatePlaylistOrder,
    playlist
  };
};
