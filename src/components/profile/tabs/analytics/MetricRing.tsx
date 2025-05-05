
import { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";

interface MetricRingProps {
  title: string;
  value: number;
}

export const MetricRing = ({ title, value }: MetricRingProps) => {
  const [progress, setProgress] = useState(0);
  const [pulseEffect, setPulseEffect] = useState(false);
  const isMobile = useIsMobile();
  
  // Animate progress on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(value);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [value]);
  
  // Pulse animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 1000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate circle properties
  const radius = isMobile ? 40 : 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`relative w-20 h-20 md:w-32 md:h-32 flex items-center justify-center ${
          pulseEffect ? 'animate-pulse duration-1000' : ''
        }`}
      >
        {/* Background circle */}
        <svg className="absolute w-full h-full" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="stroke-white/5"
            strokeWidth={isMobile ? "6" : "8"}
            fill="transparent"
          />
        </svg>
        
        {/* Progress circle with glowing effect */}
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="stroke-accent drop-shadow-[0_0_10px_rgba(249,115,22,0.7)]"
            strokeWidth={isMobile ? "6" : "8"}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        
        {/* Value display */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-xl md:text-3xl font-bold text-white">{progress}%</span>
        </div>
      </div>
      <p className="mt-2 md:mt-3 text-xs md:text-sm text-center text-gray-300">{title}</p>
    </div>
  );
};
