
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export const useAudioStream = (selectedInputDevice?: string) => {
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startAudio = async () => {
    if (isInitializing) {
      console.log('Audio initialization already in progress');
      return streamRef.current;
    }

    setIsInitializing(true);
    
    try {
      console.log('Starting audio with device:', selectedInputDevice);
      
      // Stop existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(selectedInputDevice && selectedInputDevice !== 'default' ? { deviceId: selectedInputDevice } : {})
        }
      };
      
      console.log('Requesting audio with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const audioTrack = stream.getAudioTracks()[0];
      
      if (!audioTrack) {
        throw new Error('No audio track found in stream');
      }

      console.log('Audio track obtained:', audioTrack.label);

      // Start muted by default
      audioTrack.enabled = false;
      setIsMuted(true);
      setIsStreaming(true);
      setError(null);
      streamRef.current = stream;
      
      // Add event listeners
      audioTrack.onended = () => {
        console.log('Audio track ended');
        setIsStreaming(false);
        setError('Audio connection lost');
        toast.error('Audio connection lost. Please try reconnecting.');
      };

      audioTrack.onmute = () => {
        console.log('Audio track muted by system');
        setIsMuted(true);
      };

      audioTrack.onunmute = () => {
        console.log('Audio track unmuted by system');
        if (audioTrack.enabled) {
          setIsMuted(false);
        }
      };

      toast.success('Microphone connected successfully');
      return stream;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not access microphone';
      
      let userMessage = 'Could not access your microphone. ';
      if (errorMessage.includes('Permission')) {
        userMessage += 'Please allow microphone access in your browser settings.';
      } else if (errorMessage.includes('NotFoundError')) {
        userMessage += 'No microphone found. Please check your device connections.';
      } else if (errorMessage.includes('NotReadableError')) {
        userMessage += 'Your microphone is being used by another application.';
      } else {
        userMessage += 'Please check your microphone settings.';
      }
      
      setError(userMessage);
      setIsStreaming(false);
      toast.error(userMessage);
      return null;
    } finally {
      setIsInitializing(false);
    }
  };

  const toggleMute = () => {
    if (!streamRef.current) {
      console.error('No audio stream available');
      toast.error('No audio connection available. Please try reconnecting.');
      return;
    }

    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (!audioTrack) {
      console.error('No audio track found');
      toast.error('No microphone found. Please check your device connections.');
      return;
    }

    try {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
      console.log(`Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`);
      
      if (audioTrack.readyState === 'ended') {
        setError('Audio track is not active');
        toast.error('Audio connection lost. Please try reconnecting.');
        return;
      }
    } catch (err) {
      console.error('Error toggling microphone:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error toggling microphone';
      setError(errorMessage);
      toast.error(`Microphone error: ${errorMessage}`);
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
      setError(null);
      console.log('Audio stream stopped');
    }
  };

  // Auto-restart audio when device changes
  useEffect(() => {
    if (isStreaming && selectedInputDevice) {
      console.log('Device changed, restarting audio stream');
      const restartAudio = async () => {
        await startAudio();
      };
      restartAudio();
    }
  }, [selectedInputDevice]);

  return {
    isMuted,
    isStreaming,
    isInitializing,
    error,
    startAudio,
    toggleMute,
    stopAudio,
    getStream: () => streamRef.current
  };
};
