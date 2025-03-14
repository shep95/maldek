
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
  const mouseY = useMotionValue(0);
  const mouseDistance = useMotionValue(0);
  
  // Spring configuration for smooth animations
  const springConfig: SpringOptions = { 
    mass: 0.5, 
    stiffness: 300, 
    damping: 30 
  };

  // Transform scale based on hover
  const scaleTransform = useTransform(
    mouseDistance,
    [-150, 0, 150],
    [1, 1.35, 1]
  );
  
  // Apply spring to scale for smoother animation
  const scale = useSpring(scaleTransform, springConfig);
  
  // Transform background opacity based on hover
  const bgOpacityTransform = useTransform(
    mouseDistance,
    [-150, 0, 150],
    [0.05, 0.25, 0.05]
  );
  
  // Apply spring to background opacity
  const bgOpacity = useSpring(bgOpacityTransform, springConfig);
  
  // Transform rotation based on mouse position
  const rotateX = useTransform(
    mouseY,
    (value) => {
      if (!ref.current) return 0;
      const rect = ref.current.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      return (value - centerY) * 0.05;
    }
  );
  
  const rotateY = useTransform(
    mouseX,
    (value) => {
      if (!ref.current) return 0;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      return (centerX - value) * 0.05;
    }
  );

  // Handle mouse move to update motion values
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
    
    // Calculate distance from center (Pythagorean theorem)
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    mouseDistance.set(distance);
  };
  
  // Reset values when mouse leaves
  const handleMouseLeave = () => {
    mouseDistance.set(150);
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
            "relative flex items-center justify-center w-16 h-16 mx-auto my-3 rounded-xl",
            "cursor-pointer transition-colors",
            active ? "text-white" : "text-foreground/80 hover:text-accent",
            className
          )}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{ 
            scale,
            rotateX,
            rotateY,
            perspective: 1000,
            transformStyle: "preserve-3d"
          }}
        >
          {/* Background glow effect */}
          <motion.div 
            className={cn(
              "absolute inset-0 rounded-xl",
              active ? "bg-accent" : "bg-accent"
            )}
            style={{ 
              opacity: active ? 0.2 : bgOpacity,
              scale: active ? 1 : scale,
              rotateX,
              rotateY,
            }}
          />
          
          {/* Icon */}
          <motion.div
            className="relative z-10"
            style={{ 
              scale: active ? 1 : scale,
              rotateX,
              rotateY,
             }}
          >
            <Icon className="h-6 w-6" />
          </motion.div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-black/80 backdrop-blur-lg border-white/10">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
