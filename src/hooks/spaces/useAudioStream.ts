import { useState } from 'react';
import { toast } from 'sonner';

export const useAudioStream = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      return stream;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not access microphone';
      setError(errorMessage);
      toast.error(`Microphone error: ${errorMessage}`);
      return null;
    }
  };

  const toggleMute = (stream: MediaStream | null) => {
    if (!stream) {
      console.error('No audio stream available');
      toast.error('No audio stream available');
      return;
    }

    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
      console.log(`Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`);
    } else {
      console.error('No audio track found');
      toast.error('No audio track found');
    }
  };

  return {
    isMuted,
    error,
    startAudio,
    toggleMute
  };
};