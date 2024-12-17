import { useState } from 'react';

export const useAudioStream = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Mute by default
      stream.getAudioTracks()[0].enabled = false;
      setIsMuted(true);
      return stream;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone');
      return null;
    }
  };

  const toggleMute = (stream: MediaStream | null) => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  return {
    isMuted,
    error,
    startAudio,
    toggleMute
  };
};