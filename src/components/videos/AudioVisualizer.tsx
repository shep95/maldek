
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | HTMLVideoElement | null;
  className?: string;
  barCount?: number;
  color?: string;
}

export const AudioVisualizer = ({ 
  audioElement, 
  className,
  barCount = 70,
  color = "bg-accent"
}: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;
    
    // Initialize audio context if not already created
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    
    const draw = () => {
      if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Calculate bar dimensions
      const barWidth = canvas.clientWidth / barCount;
      const barMargin = 2;
      const effectiveBarWidth = barWidth - barMargin;
      
      // Draw bars
      ctx.fillStyle = color.startsWith('#') ? color : '#10b981'; // default to emerald-500 if not hex
      
      for (let i = 0; i < barCount; i++) {
        // Get data point from frequency data (with some smoothing)
        const dataIndex = Math.floor(i * (dataArrayRef.current.length / barCount));
        const dataPoint = dataArrayRef.current[dataIndex];
        
        // Calculate bar height based on frequency data (0-255)
        const heightPercent = dataPoint / 255;
        const barHeight = Math.max(3, heightPercent * canvas.clientHeight);
        
        // Draw the bar
        ctx.beginPath();
        ctx.roundRect(
          i * barWidth, 
          canvas.clientHeight - barHeight, 
          effectiveBarWidth, 
          barHeight,
          [3, 3, 0, 0]
        );
        ctx.fill();
      }
      
      // Request next frame
      animationRef.current = requestAnimationFrame(draw);
    };
    
    // Start visualization if audio is playing
    if (!audioElement.paused) {
      animationRef.current = requestAnimationFrame(draw);
    }
    
    // Add event listeners to manage visualization
    const handlePlay = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      animationRef.current = requestAnimationFrame(draw);
    };
    
    const handlePause = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
    };
  }, [audioElement, barCount, color]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={cn("w-full h-12 rounded-md", className)}
    />
  );
};
