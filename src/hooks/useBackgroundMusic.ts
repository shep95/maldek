import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useMusicUrl } from './useMusicUrl';

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

  // Use the music URL hook to get the proper public URL
  const currentTrack = backgroundMusic || playlist[currentTrackIndex];
  const { publicUrl: currentTrackUrl, error: urlError, isLoading: isUrlLoading } = useMusicUrl(currentTrack?.music_url || null);

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
    if (currentTrackUrl && !didInitialize.current) {
      didInitialize.current = true;
      audio.volume = volume;
      audio.loop = isLooping;
      audio.src = currentTrackUrl;
      
      // Don't autoplay immediately, wait for user interaction
      console.log('Music loaded:', currentTrack?.title);
    }
  }, [currentTrackUrl, audio, volume, isLooping, currentTrack?.title]);

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
      // Check for URL loading error first
      if (urlError) {
        toast.error(`Audio URL error: ${urlError}`);
        return;
      }

      // Wait for URL to load if still loading
      if (isUrlLoading) {
        toast.error('Audio still loading, please wait...');
        return;
      }

      // Ensure we have a proper URL
      if (!currentTrackUrl) {
        toast.error('No music URL available');
        return;
      }

      if (isPlaying) {
        audio.pause();
        console.log('Paused:', currentTrack?.title);
        return;
      }

      console.log('Attempting to play audio:', {
        url: currentTrackUrl,
        title: currentTrack?.title
      });

      // Reset audio element completely
      audio.pause();
      audio.currentTime = 0;
      audio.volume = volume;
      audio.loop = isLooping;
      
      // Clear all event handlers
      audio.onerror = null;
      audio.oncanplaythrough = null;
      audio.onloadeddata = null;
      audio.oncanplay = null;
      
      // Remove any attributes that might cause issues
      audio.removeAttribute('crossOrigin');
      audio.preload = 'auto';

      let playAttempts = 0;
      const maxAttempts = 3;

      const attemptPlay = async (url: string, attemptNumber: number) => {
        return new Promise<boolean>((resolve, reject) => {
          console.log(`Play attempt ${attemptNumber} with URL:`, url);
          
          const timeoutId = setTimeout(() => {
            reject(new Error(`Timeout on attempt ${attemptNumber}`));
          }, 10000); // 10 second timeout

          audio.oncanplaythrough = async () => {
            clearTimeout(timeoutId);
            try {
              await audio.play();
              console.log(`Success on attempt ${attemptNumber}`);
              localStorage.setItem(AUTOPLAY_STORAGE_KEY, 'true');
              resolve(true);
            } catch (playError) {
              console.error(`Play error on attempt ${attemptNumber}:`, playError);
              reject(playError);
            }
          };

          audio.onerror = (event) => {
            clearTimeout(timeoutId);
            console.error(`Audio error on attempt ${attemptNumber}:`, {
              error: audio.error,
              code: audio.error?.code,
              message: audio.error?.message,
              networkState: audio.networkState,
              readyState: audio.readyState
            });
            reject(new Error(`Audio error code ${audio.error?.code}`));
          };

          // Set source and load
          audio.src = url;
          audio.load();
        });
      };

      // Attempt 1: Direct URL
      try {
        await attemptPlay(currentTrackUrl, 1);
        return; // Success!
      } catch (error) {
        console.log('Attempt 1 failed:', error);
        playAttempts++;
      }

      // Attempt 2: URL with cache busting
      if (playAttempts < maxAttempts) {
        try {
          const cacheBustUrl = currentTrackUrl + (currentTrackUrl.includes('?') ? '&' : '?') + 'cb=' + Date.now();
          await attemptPlay(cacheBustUrl, 2);
          return; // Success!
        } catch (error) {
          console.log('Attempt 2 failed:', error);
          playAttempts++;
        }
      }

      // Attempt 3: Blob conversion
      if (playAttempts < maxAttempts) {
        try {
          console.log('Attempting blob conversion...');
          const response = await fetch(currentTrackUrl, {
            method: 'GET',
            headers: {
              'Accept': 'audio/*',
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          console.log('Blob created:', {
            size: blob.size,
            type: blob.type
          });
          
          const blobUrl = URL.createObjectURL(blob);
          await attemptPlay(blobUrl, 3);
          
          // Clean up blob URL after successful play
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          return; // Success!
          
        } catch (error) {
          console.error('Blob conversion failed:', error);
        }
      }

      // All attempts failed
      toast.error('Unable to play this audio file. Try uploading a different MP3 file.');
      
    } catch (error) {
      console.error('Error in togglePlay:', error);
      toast.error('Failed to initialize audio player');
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