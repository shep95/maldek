
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useSpace } from '@/contexts/SpaceContext';

export const useImprovedAudioStream = () => {
  const { selectedAudioInput, selectedAudioOutput } = useSpace();
  const [isMuted, setIsMuted] = useState(true);
  const [isDeafened, setIsDeafened] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelCheckIntervalRef = useRef<number | null>(null);

  const startAudio = useCallback(async () => {
    try {
      console.log('Starting audio with device:', selectedAudioInput);
      
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedAudioInput ? { exact: selectedAudioInput } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Verify we got the right device
      const audioTrack = stream.getAudioTracks()[0];
      console.log('Audio track settings:', audioTrack.getSettings());
      console.log('Audio track capabilities:', audioTrack.getCapabilities());
      
      if (!audioTrack) {
        throw new Error('No audio track found in stream');
      }

      // Set up audio level monitoring
      audioContextRef.current = new AudioContext({ sampleRate: 48000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);

      // Start monitoring audio levels
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const checkAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(Math.round((average / 255) * 100));
        }
      };

      levelCheckIntervalRef.current = window.setInterval(checkAudioLevel, 100);

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
        toast.info('Your microphone was muted by the system');
      };

      audioTrack.onunmute = () => {
        console.log('Audio track unmuted by system');
        if (!isMuted) {
          toast.info('Your microphone is now active');
        }
      };

      toast.success('Audio initialized successfully');
      return stream;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      
      let userMessage = 'Could not access your microphone. ';
      if (err instanceof Error) {
        if (err.message.includes('Permission')) {
          userMessage += 'Please allow microphone access in your browser settings.';
        } else if (err.message.includes('NotFoundError')) {
          userMessage += 'No microphone found. Please check your device connections.';
        } else if (err.message.includes('NotReadableError')) {
          userMessage += 'Your microphone is being used by another application.';
        } else if (err.message.includes('OverconstrainedError')) {
          userMessage += 'The selected microphone doesn\'t support the required settings.';
        } else {
          userMessage += err.message;
        }
      }
      
      setError(userMessage);
      setIsStreaming(false);
      toast.error(userMessage);
      return null;
    }
  }, [selectedAudioInput]);

  const toggleMute = useCallback(() => {
    if (!streamRef.current) {
      console.error('No audio stream available');
      toast.error('No audio connection available. Please try rejoining the space.');
      return;
    }

    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      try {
        const newMutedState = !isMuted;
        audioTrack.enabled = !newMutedState;
        setIsMuted(newMutedState);
        
        console.log(`Microphone ${newMutedState ? 'muted' : 'unmuted'}`);
        toast.success(`Microphone ${newMutedState ? 'muted' : 'unmuted'}`);
        
        // Verify the track is working
        const settings = audioTrack.getSettings();
        console.log('Audio track settings after toggle:', settings);
        
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
  }, [isMuted]);

  const toggleDeafen = useCallback(() => {
    setIsDeafened(!isDeafened);
    toast.success(`Audio ${!isDeafened ? 'deafened' : 'undeafened'}`);
  }, [isDeafened]);

  const stopAudio = useCallback(() => {
    console.log('Stopping audio stream');
    
    if (levelCheckIntervalRef.current) {
      clearInterval(levelCheckIntervalRef.current);
      levelCheckIntervalRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.label);
        track.stop();
      });
      streamRef.current = null;
    }
    
    setIsStreaming(false);
    setIsMuted(true);
    setIsDeafened(false);
    setAudioLevel(0);
    setError(null);
  }, []);

  const switchAudioDevice = useCallback(async (deviceId: string) => {
    console.log('Switching to audio device:', deviceId);
    
    if (streamRef.current) {
      stopAudio();
      // Wait a bit before restarting with new device
      setTimeout(() => {
        startAudio();
      }, 500);
    }
  }, [startAudio, stopAudio]);

  return {
    isMuted,
    isDeafened,
    isStreaming,
    audioLevel,
    error,
    startAudio,
    toggleMute,
    toggleDeafen,
    stopAudio,
    switchAudioDevice,
    getStream: () => streamRef.current
  };
};
