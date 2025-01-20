import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type BackgroundMusic = Database['public']['Tables']['user_background_music']['Row'];

export const useBackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isFading, setIsFading] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlist, setPlaylist] = useState<BackgroundMusic[]>([]);

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
    }
  });

  useEffect(() => {
    if (backgroundMusic?.music_url && !audioRef.current) {
      console.log('Initializing audio with URL:', backgroundMusic.music_url);
      audioRef.current = new Audio(backgroundMusic.music_url);
      audioRef.current.volume = volume;
      
      // Set up event listeners
      audioRef.current.addEventListener('ended', () => {
        console.log('Track ended, playing next');
        playNext();
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

      // Start playing
      audioRef.current.play().catch(error => {
        console.error('Error starting playback:', error);
      });
      setIsPlaying(true);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [backgroundMusic]);

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
      setIsPlaying(true);
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
      setIsPlaying(true);
    }
  };

  const fadeOut = () => {
    if (!audioRef.current || isFading) return;
    
    setIsFading(true);
    const fadeInterval = setInterval(() => {
      if (audioRef.current && audioRef.current.volume > 0.1) {
        audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.1);
      } else {
        clearInterval(fadeInterval);
        if (audioRef.current) {
          audioRef.current.volume = 0;
        }
        setIsFading(false);
      }
    }, 100);
  };

  const fadeIn = () => {
    if (!audioRef.current || isFading) return;
    
    setIsFading(true);
    const fadeInterval = setInterval(() => {
      if (audioRef.current && audioRef.current.volume < volume) {
        audioRef.current.volume = Math.min(volume, audioRef.current.volume + 0.1);
      } else {
        clearInterval(fadeInterval);
        if (audioRef.current) {
          audioRef.current.volume = volume;
        }
        setIsFading(false);
      }
    }, 100);
  };

  const togglePlay = () => {
    console.log('Toggling play/pause');
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error toggling play:', error);
      });
    }
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
    togglePlay,
    setVolume: setMusicVolume,
    fadeOut,
    fadeIn,
    playNext,
    playPrevious,
    currentTrack: playlist[currentTrackIndex],
    updatePlaylistOrder
  };
};