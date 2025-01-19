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

  const { data: backgroundMusic } = useQuery({
    queryKey: ['background-music'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_background_music')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching background music:', error);
        return null;
      }

      return data;
    }
  });

  useEffect(() => {
    if (backgroundMusic?.music_url && !audioRef.current) {
      audioRef.current = new Audio(backgroundMusic.music_url);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      
      audioRef.current.addEventListener('ended', () => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [backgroundMusic]);

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
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const setMusicVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return {
    isPlaying,
    volume,
    togglePlay,
    setVolume: setMusicVolume,
    fadeOut,
    fadeIn
  };
};