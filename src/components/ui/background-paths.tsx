
import React from 'react';

export const BackgroundPaths = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
          </linearGradient>
        </defs>
        
        {/* Animated background paths */}
        <g opacity="0.6">
          <path
            d="M0,200 Q250,50 500,200 T1000,200 L1000,0 L0,0 Z"
            fill="url(#gradient1)"
            className="animate-pulse"
            style={{ animationDelay: '0s', animationDuration: '4s' }}
          />
          <path
            d="M0,800 Q250,650 500,800 T1000,800 L1000,1000 L0,1000 Z"
            fill="url(#gradient2)"
            className="animate-pulse"
            style={{ animationDelay: '2s', animationDuration: '4s' }}
          />
        </g>
        
        {/* Subtle grid pattern */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(255,255,255,0.02)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Floating particles */}
        <g opacity="0.3">
          <circle
            cx="100"
            cy="150"
            r="2"
            fill="rgba(255,255,255,0.3)"
            className="animate-pulse"
            style={{ animationDelay: '1s', animationDuration: '3s' }}
          />
          <circle
            cx="300"
            cy="80"
            r="1.5"
            fill="rgba(255,255,255,0.4)"
            className="animate-pulse"
            style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}
          />
          <circle
            cx="600"
            cy="120"
            r="1"
            fill="rgba(255,255,255,0.2)"
            className="animate-pulse"
            style={{ animationDelay: '2.5s', animationDuration: '3.5s' }}
          />
          <circle
            cx="800"
            cy="200"
            r="2.5"
            fill="rgba(255,255,255,0.3)"
            className="animate-pulse"
            style={{ animationDelay: '1.5s', animationDuration: '4s' }}
          />
        </g>
      </svg>
    </div>
  );
};
