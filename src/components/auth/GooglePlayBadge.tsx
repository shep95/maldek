
import React from "react";

// Google Play logo only (brand-compliant)
export const GooglePlayBadge: React.FC = () => (
  <a
    href="https://play.google.com/store/apps/details?id=com.tGBvxWwSLUzd.natively"
    target="_blank"
    rel="noopener noreferrer"
    className="flex w-fit mx-auto mt-6 transition-transform hover:scale-105 active:scale-95"
    aria-label="Get it on Google Play"
  >
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
      alt="Google Play Store logo"
      className="h-10 w-auto"
      style={{ display: "block" }}
      draggable={false}
      decoding="async"
      loading="lazy"
    />
  </a>
);

