
import { useState, useRef } from 'react';
import { toast } from 'sonner';

export const useAudioStream = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const startAudio = async (): Promise<MediaStream | null> => {
    try {
      console.log('Starting audio stream...');
      setIsInitializing(true);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      audioStreamRef.current = stream;
      setIsStreaming(true);
      setIsInitializing(false);
      console.log('Audio stream started successfully');
      return stream;
    } catch (err) {
      console.error('Error starting audio:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(errorMessage);
      setIsInitializing(false);
      toast.error('Failed to access microphone. Please check permissions.');
      return null;
    }
  };

  const stopAudio = () => {
    if (audioStreamRef.current) {
      console.log('Stopping audio stream...');
      audioStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      audioStreamRef.current = null;
      setIsStreaming(false);
    }
  };

  const toggleMute = () => {
    if (audioStreamRef.current) {
      const audioTracks = audioStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
      console.log(`Audio ${isMuted ? 'unmuted' : 'muted'}`);
    }
  };

  const getStream = () => audioStreamRef.current;

  return {
    isMuted,
    isStreaming,
    isInitializing,
    error,
    startAudio,
    stopAudio,
    toggleMute,
    getStream
  };
};
