
import React from "react";

// Google Play badge SVG for brand compliance
const GooglePlaySVG = () => (
  <svg width="160" height="48" viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="48" rx="12" fill="#222" />
    <g>
      <image x="12" y="10" width="28" height="28" href="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" />
      <text x="46" y="27" fill="#fff" fontFamily="Inter, Arial, sans-serif" fontWeight="bold" fontSize="18">
        Get it on
      </text>
      <text x="46" y="43" fill="#fff" fontFamily="Inter, Arial, sans-serif" fontWeight="bold" fontSize="22">
        Google Play
      </text>
    </g>
  </svg>
);

export const GooglePlayBadge: React.FC = () => (
  <a
    href="https://play.google.com/store/apps/details?id=com.tGBvxWwSLUzd.natively"
    target="_blank"
    rel="noopener noreferrer"
    className="flex w-fit mx-auto mt-6 transition-transform hover:scale-105 active:scale-95"
    aria-label="Get it on Google Play"
  >
    <GooglePlaySVG />
  </a>
);

