
'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from 'framer-motion';
import { ReactNode, useRef } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AnimatedNavItemProps {
  icon: LucideIcon;
  label: string;
  path?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AnimatedNavItem = ({
  icon: Icon,
  label,
  path,
  active,
  onClick,
  className,
}: AnimatedNavItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Motion values for the hover animation
  const mouseX = useMotionValue(0);
  const mouseDistance = useMotionValue(0);
  
  // Spring configuration for smooth animations
  const springConfig: SpringOptions = { 
    mass: 0.1, 
    stiffness: 150, 
    damping: 12 
  };

  // Transform scale based on hover
  const scaleTransform = useTransform(
    mouseDistance,
    [-100, 0, 100],
    [1, 1.15, 1]
  );
  
  // Apply spring to scale for smoother animation
  const scale = useSpring(scaleTransform, springConfig);
  
  // Transform background opacity based on hover
  const bgOpacityTransform = useTransform(
    mouseDistance,
    [-100, 0, 100],
    [0.05, 0.15, 0.05]
  );
  
  // Apply spring to background opacity
  const bgOpacity = useSpring(bgOpacityTransform, springConfig);

  // Handle mouse move to update motion values
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    
    mouseX.set(e.clientX);
    mouseDistance.set(e.clientX - centerX);
  };
  
  // Reset values when mouse leaves
  const handleMouseLeave = () => {
    mouseDistance.set(100);
  };

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          ref={ref}
          className={cn(
            "relative flex items-center justify-center w-14 h-14 mx-auto my-2 rounded-lg",
            "cursor-pointer transition-colors",
            active ? "text-white" : "text-foreground/80 hover:text-accent",
            className
          )}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{ scale }}
        >
          {/* Background glow effect */}
          <motion.div 
            className={cn(
              "absolute inset-0 rounded-lg",
              active ? "bg-accent" : "bg-accent"
            )}
            style={{ 
              opacity: active ? 0.2 : bgOpacity,
              scale: active ? 1 : scale
            }}
          />
          
          {/* Icon */}
          <motion.div
            className="relative z-10"
            style={{ scale: active ? 1 : scale }}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-black/80 backdrop-blur-lg border-white/10">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
