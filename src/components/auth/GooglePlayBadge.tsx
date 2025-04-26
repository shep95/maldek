
import React from "react";

// Google Play logo with improved cross-browser compatibility
export const GooglePlayBadge: React.FC = () => (
  <a
    href="https://play.google.com/store/apps/details?id=com.tGBvxWwSLUzd.natively"
    target="_blank"
    rel="noopener noreferrer"
    className="flex w-fit mx-auto mt-6 transition-transform hover:scale-105 active:scale-95"
    aria-label="Get it on Google Play"
  >
    <img
      src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
      alt="Get it on Google Play"
      className="h-10 w-auto"
      style={{ display: "block" }}
      draggable={false}
      decoding="async"
      loading="lazy"
      fetchPriority="high"
      crossOrigin="anonymous"
    />
  </a>
);
