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

  // Enhanced audio format bypass function
  const createCompatibleAudio = async (url: string): Promise<HTMLAudioElement> => {
    const testAudio = new Audio();
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Audio format test timeout'));
      }, 5000);

      testAudio.oncanplaythrough = () => {
        clearTimeout(timeoutId);
        resolve(testAudio);
      };

      testAudio.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Audio format not supported'));
      };

      // Configure for maximum compatibility
      testAudio.preload = 'metadata';
      testAudio.src = url;
    });
  };

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

      try {
        // Test audio compatibility first
        const compatibleAudio = await createCompatibleAudio(currentTrackUrl);
        
        // If test passed, configure main audio element
        audio.pause();
        audio.currentTime = 0;
        audio.volume = volume;
        audio.loop = isLooping;
        
        // Remove crossOrigin to avoid CORS issues
        audio.removeAttribute('crossOrigin');
        
        // Add cache busting to avoid format detection issues
        const urlWithCacheBust = currentTrackUrl + (currentTrackUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
        audio.src = urlWithCacheBust;
        
        // Clear previous handlers
        audio.onerror = null;
        audio.oncanplaythrough = null;

        // Set up success handler
        audio.oncanplaythrough = async () => {
          try {
            await audio.play();
            console.log('Successfully playing:', currentTrack?.title);
            localStorage.setItem(AUTOPLAY_STORAGE_KEY, 'true');
          } catch (playError) {
            console.error('Play error:', playError);
            toast.error('Browser blocked audio playback. Click to enable audio.');
          }
        };

        // Enhanced error handler with format bypass
        audio.onerror = () => {
          console.error('Audio playback failed, trying alternative approach...');
          
          // Try direct blob conversion as last resort
          fetch(currentTrackUrl)
            .then(response => response.blob())
            .then(blob => {
              const objectUrl = URL.createObjectURL(blob);
              audio.src = objectUrl;
              audio.load();
              
              audio.oncanplaythrough = async () => {
                try {
                  await audio.play();
                  toast.success('Audio format converted for compatibility');
                } catch (error) {
                  toast.error('Unable to play this audio format. Please convert to MP3.');
                }
              };
            })
            .catch(() => {
              toast.error('Audio format not supported. Please convert to MP3 format.');
            });
        };

        audio.load();
        
      } catch (compatibilityError) {
        console.error('Audio compatibility test failed:', compatibilityError);
        
        // Fallback: try direct play with error handling
        audio.pause();
        audio.volume = volume;
        audio.loop = isLooping;
        audio.src = currentTrackUrl;
        
        audio.onerror = () => {
          toast.error('Audio format not compatible. Please upload MP3 format.');
        };
        
        audio.oncanplaythrough = async () => {
          try {
            await audio.play();
            console.log('Fallback play successful');
          } catch (error) {
            toast.error('Cannot play this audio format. Please use MP3.');
          }
        };
        
        audio.load();
      }
      
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