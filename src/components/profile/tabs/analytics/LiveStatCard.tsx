
import { useEffect, useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface LiveStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

export const LiveStatCard = ({ title, value, icon: Icon, comingSoon = false }: LiveStatCardProps) => {
  const [displayValue, setDisplayValue] = useState(comingSoon ? "Coming Soon" : value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(typeof value === 'number' ? value : 0);
  
  useEffect(() => {
    if (comingSoon || typeof value === 'string') {
      setDisplayValue(value);
      return;
    }
    
    if (value !== prevValueRef.current) {
      // Animate number counting when value changes
      let startTime: number;
      const duration = 1500; // 1.5 seconds animation
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
    }
  }, [value, comingSoon]);

  return (
    <Card className={`p-4 md:p-6 bg-black/20 backdrop-blur border-accent/20 transition-all duration-300 ${
      isAnimating ? 'shadow-[0_0_10px_rgba(249,115,22,0.1)]' : ''
    }`}>
      <div className="flex items-center gap-3 md:gap-4">
        <div className={`p-2 md:p-3 rounded-full bg-accent/10 text-accent ${
          isAnimating && !comingSoon ? 'animate-pulse' : ''
        }`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
          <h3 className="text-sm md:text-lg font-medium text-gray-300">{title}</h3>
          <p className={`text-xl md:text-2xl font-bold ${comingSoon ? 'text-amber-500/80 italic' : 'text-accent'}`}>
            {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
          </p>
        </div>
      </div>
    </Card>
  );
};
