
import { useState, useEffect, useRef } from 'react';

export const useAudioLevelDetector = (stream: MediaStream | null, isActive: boolean = true) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || !isActive) {
      setAudioLevel(0);
      setIsSpeaking(false);
      cleanup();
      return;
    }

    const setupAudioAnalysis = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const detectAudioLevel = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average volume
          const average = dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;
          const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1
          const scaledLevel = Math.floor(normalizedLevel * 5); // Scale to 0-5 for visual bars
          
          setAudioLevel(scaledLevel);
          setIsSpeaking(average > 10); // Threshold for speaking detection
          
          animationFrameRef.current = requestAnimationFrame(detectAudioLevel);
        };
        
        detectAudioLevel();
      } catch (error) {
        console.error('Error setting up audio analysis:', error);
      }
    };

    setupAudioAnalysis();

    return cleanup;
  }, [stream, isActive]);

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
  };

  return { audioLevel, isSpeaking, cleanup };
};
