
import { useState, useEffect } from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
}

export const AnalyticsCard = ({ title, value, icon: Icon, trend }: AnalyticsCardProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Animate the number counting up
  useEffect(() => {
    const numericValue = typeof value === 'number' ? value : parseInt(value.toString()) || 0;
    let startValue = 0;
    const duration = 2000; // Animation duration in ms
    const frameRate = 30; // Updates per second
    const totalFrames = duration / (1000 / frameRate);
    const valueIncrement = numericValue / totalFrames;
    let currentFrame = 0;
    
    const timer = setInterval(() => {
      currentFrame++;
      startValue += valueIncrement;
      setAnimatedValue(Math.floor(startValue));
      
      if (currentFrame >= totalFrames) {
        clearInterval(timer);
        setAnimatedValue(numericValue);
      }
    }, 1000 / frameRate);
    
    return () => clearInterval(timer);
  }, [value]);

  // Format trend as a positive or negative value
  const isTrendPositive = trend && trend.startsWith('+');
  
  return (
    <Card 
      className={`p-3 md:p-4 bg-black/20 backdrop-blur border-accent/20 transition-all duration-300 ${
        isHovered ? 'shadow-[0_0_10px_rgba(249,115,22,0.15)]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
        <Icon className={`h-4 w-4 md:h-5 md:w-5 text-accent transition-all duration-300 ${
          isHovered ? 'scale-110' : ''
        }`} />
        <h3 className="text-xs md:text-sm font-medium text-gray-300">{title}</h3>
      </div>
      <div className="flex items-baseline gap-1 md:gap-2">
        <p className="text-xl md:text-2xl font-bold text-white">{animatedValue.toLocaleString()}</p>
        {trend && (
          <span className={`text-[10px] md:text-xs ${
            isTrendPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </Card>
  );
};

