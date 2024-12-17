import { useState } from 'react';
import { toast } from 'sonner';

export const useAudioStream = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startAudio = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('Microphone access granted');
      // Mute by default
      stream.getAudioTracks()[0].enabled = false;
      setIsMuted(true);
      setIsStreaming(true);
      setError(null);
      
      // Add audio track event listeners
      stream.getAudioTracks()[0].onended = () => {
        console.log('Audio track ended');
        setIsStreaming(false);
        setError('Audio track ended unexpectedly');
        toast.error('Audio connection lost. Please try reconnecting.');
      };

      stream.getAudioTracks()[0].onmute = () => {
        console.log('Audio track muted by system');
        setIsMuted(true);
      };

      stream.getAudioTracks()[0].onunmute = () => {
        console.log('Audio track unmuted by system');
        setIsMuted(false);
      };

      return stream;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not access microphone';
      setError(errorMessage);
      setIsStreaming(false);
      toast.error(`Microphone error: ${errorMessage}`);
      return null;
    }
  };

  const toggleMute = (stream: MediaStream | null) => {
    if (!stream) {
      console.error('No audio stream available');
      toast.error('No audio stream available. Please try rejoining the space.');
      return;
    }

    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      try {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log(`Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`);
        
        // Show feedback toast
        toast.success(`Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`);
        
        // Check if the track is actually working
        if (!audioTrack.readyState || audioTrack.readyState === 'ended') {
          setError('Audio track is not active');
          toast.error('Audio connection lost. Please try rejoining the space.');
          return;
        }
      } catch (err) {
        console.error('Error toggling microphone:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error toggling microphone';
        setError(errorMessage);
        toast.error(`Microphone error: ${errorMessage}`);
      }
    } else {
      console.error('No audio track found');
      toast.error('No audio track found. Please try rejoining the space.');
    }
  };

  return {
    isMuted,
    isStreaming,
    error,
    startAudio,
    toggleMute
  };
};