
import { useState, useRef } from 'react';
import { toast } from 'sonner';

export const useAudioStream = (selectedInputDevice?: string) => {
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startAudio = async () => {
    try {
      console.log('Requesting microphone access...');
      
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(selectedInputDevice && selectedInputDevice !== 'default' ? { deviceId: selectedInputDevice } : {})
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Microphone access granted, checking audio tracks...');
      const audioTrack = stream.getAudioTracks()[0];
      
      if (!audioTrack) {
        throw new Error('No audio track found in stream');
      }

      if (audioTrack.muted) {
        console.warn('Audio track is muted by system');
        toast.warning('Your microphone appears to be muted by your system');
      }

      if (!audioTrack.enabled) {
        console.warn('Audio track is disabled');
        toast.warning('Your microphone is disabled. Please check your system settings');
      }

      // Mute by default
      audioTrack.enabled = false;
      setIsMuted(true);
      setIsStreaming(true);
      setError(null);
      streamRef.current = stream;
      
      // Add audio track event listeners
      audioTrack.onended = () => {
        console.log('Audio track ended');
        setIsStreaming(false);
        setError('Audio connection lost');
        toast.error('Audio connection lost. Please try reconnecting.');
      };

      audioTrack.onmute = () => {
        console.log('Audio track muted by system');
        setIsMuted(true);
        toast.info('Your microphone was muted by the system');
      };

      audioTrack.onunmute = () => {
        console.log('Audio track unmuted by system');
        setIsMuted(false);
        toast.info('Your microphone is now active');
      };

      return stream;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not access microphone';
      
      // Provide more specific error messages
      let userMessage = 'Could not access your microphone. ';
      if (errorMessage.includes('Permission')) {
        userMessage += 'Please allow microphone access in your browser settings.';
      } else if (errorMessage.includes('NotFoundError')) {
        userMessage += 'No microphone found. Please check your device connections.';
      } else if (errorMessage.includes('NotReadableError')) {
        userMessage += 'Your microphone is being used by another application.';
      } else if (errorMessage.includes('network')) {
        userMessage += 'Please check your internet connection.';
      }
      
      setError(userMessage);
      setIsStreaming(false);
      toast.error(userMessage);
      return null;
    }
  };

  const toggleMute = () => {
    if (!streamRef.current) {
      console.error('No audio stream available');
      toast.error('No audio connection available. Please try rejoining the space.');
      return;
    }

    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      try {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log(`Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`);
        
        toast.success(`Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`);
        
        if (!audioTrack.readyState || audioTrack.readyState === 'ended') {
          setError('Audio track is not active');
          toast.error('Audio connection lost. Please try rejoining the space.');
          return;
        }

        if (!navigator.onLine) {
          setError('Internet connection lost');
          toast.error('Internet connection lost. Please check your connection.');
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
      toast.error('No microphone found. Please check your device connections.');
    }
  };

  const stopAudio = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      setIsStreaming(false);
      setIsMuted(true);
      console.log('Audio stream stopped');
    }
  };

  return {
    isMuted,
    isStreaming,
    error,
    startAudio,
    toggleMute,
    stopAudio,
    getStream: () => streamRef.current
  };
};
