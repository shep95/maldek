
'use client';

import React, { useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  SpringOptions,
} from 'framer-motion';

type SpotlightProps = {
  children?: React.ReactNode;
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

export function Spotlight({
  children,
  className = '',
  size = 200,
  springOptions,
}: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const xSpring = useSpring(mouseX, springOptions);
  const ySpring = useSpring(mouseY, springOptions);
  
  const background = useMotionTemplate`radial-gradient(${size}px circle at ${xSpring}px ${ySpring}px, ${className})`;
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };
  
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden rounded-lg"
      style={{ background }}
    >
      {children}
    </motion.div>
  );
}
