
import { useEffect, useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface LiveStatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}

export const LiveStatCard = ({ title, value, icon: Icon }: LiveStatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(0);
  
  useEffect(() => {
    if (value === displayValue) return;
    
    // Animate number counting
    let startTime: number;
    const duration = 2000; // 2 seconds animation
    const startValue = prevValueRef.current;
    
    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const currentValue = Math.floor(startValue + progress * (value - startValue));
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setIsAnimating(false);
        prevValueRef.current = value;
      }
    };
    
    setIsAnimating(true);
    requestAnimationFrame(animateCount);
    
    return () => {
      prevValueRef.current = displayValue;
    };
  }, [value]);

  return (
    <Card className={`p-6 bg-black/20 backdrop-blur border-accent/20 transition-all duration-300 ${
      isAnimating ? 'shadow-[0_0_20px_rgba(249,115,22,0.15)]' : ''
    }`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full bg-accent/10 text-accent ${
          isAnimating ? 'animate-pulse' : ''
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-300">{title}</h3>
          <p className="text-2xl font-bold text-accent">{displayValue.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
};
