
'use client';

import React, {
  ReactNode, 
  useRef,
  cloneElement,
  isValidElement,
  Children
} from 'react';
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from 'framer-motion';
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
  index?: number;
  mouseX?: MotionValue<number>;
  mouseY?: MotionValue<number>;
}

export const AnimatedNavItem = ({
  icon: Icon,
  label,
  path,
  active,
  onClick,
  className,
  index = 0,
  mouseX: parentMouseX,
  mouseY: parentMouseY,
}: AnimatedNavItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Motion values for the hover animation
  const mouseX = parentMouseX || useMotionValue(0);
  const mouseY = parentMouseY || useMotionValue(0);
  const mouseDistance = useMotionValue(0);
  
  // Spring configuration for smooth animations
  const springConfig: SpringOptions = { 
    mass: 0.5, 
    stiffness: 300, 
    damping: 30 
  };

  // Transform scale based on hover - only for the hovered icon
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
    [0, 0.25, 0]
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

  // Create a proxy scale for neighboring items effect
  // This will make icons above and below the hovered one slightly bigger
  const neighboringEffect = useTransform(
    mouseDistance,
    [-150, -100, 0, 100, 150],
    [1, 1.15, 1, 1.15, 1]
  );
  
  const neighboringScale = useSpring(neighboringEffect, {
    mass: 0.2,
    stiffness: 200,
    damping: 20
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          ref={ref}
          className={cn(
            "relative flex items-center justify-center w-20 h-20 mx-auto my-4 rounded-xl",
            "cursor-pointer transition-colors",
            active ? "text-white" : "text-foreground/80 hover:text-accent",
            className
          )}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{ 
            rotateX,
            rotateY,
            perspective: 1000,
            transformStyle: "preserve-3d"
          }}
        >
          {/* 3D circular background */}
          <motion.div 
            className={cn(
              "absolute rounded-full bg-gradient-to-br from-accent to-accent/50",
              active ? "opacity-20" : ""
            )}
            style={{ 
              opacity: active ? 0.3 : bgOpacity.get(),
              width: "80%",
              height: "80%",
              left: "10%",
              top: "10%",
              rotateX,
              rotateY,
              filter: "drop-shadow(0 0 12px rgba(255,120,0,0.4))",
              boxShadow: "inset 0 2px 6px rgba(255,255,255,0.4), 0 4px 8px rgba(0,0,0,0.2)",
              transform: "translateZ(-5px)"
            }}
          />
          
          {/* Inner glow effect for depth */}
          <motion.div 
            className="absolute rounded-full bg-accent/10"
            style={{ 
              opacity: active ? 0.5 : (bgOpacity.get() || 0) * 1.2,
              width: "60%",
              height: "60%",
              left: "20%",
              top: "20%",
              rotateX,
              rotateY,
              filter: "blur(8px)",
              boxShadow: "inset 0 -2px 5px rgba(0,0,0,0.2)",
              transform: "translateZ(-2px)"
            }}
          />
          
          {/* Icon container with 3D elevation */}
          <motion.div
            className="relative z-10"
            style={{ 
              scale: active ? 1 : (mouseDistance.get() < 50 ? scale : neighboringScale),
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              transform: "translateZ(10px)",
            }}
          >
            {/* Icon with 3D effects */}
            <div className="relative">
              <Icon 
                className={cn(
                  "h-7 w-7",
                  "drop-shadow-[0_3px_4px_rgba(0,0,0,0.4)]"
                )}
                strokeWidth={1.5} 
                style={{
                  filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.6))",
                  transform: "translateZ(5px)",
                }}
              />
              
              {/* Top light reflection */}
              <div 
                className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full opacity-80 pointer-events-none" 
                style={{ transform: "translateZ(2px) translateY(-1px)" }}
              />
              
              {/* Bottom shadow for depth */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full opacity-60 pointer-events-none" 
                style={{ transform: "translateZ(-2px) translateY(1px)" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-black/80 backdrop-blur-lg border-white/10">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// Define a type for the expected children with added props
type ChildProps = {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
};

// Create a container component for managing shared motion values
interface AnimatedNavContainerProps {
  children: ReactNode;
  className?: string;
}

export const AnimatedNavContainer = ({ children, className }: AnimatedNavContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };
  
  // Use proper TypeScript-compatible approach to pass props to children
  const childrenWithProps = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child, { 
        mouseX,
        mouseY
      } as ChildProps);
    }
    return child;
  });
  
  return (
    <motion.div 
      ref={containerRef}
      className={cn("py-4", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {childrenWithProps}
    </motion.div>
  );
};
