
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
    <div className="bg-black rounded-md px-4 py-2 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" fill="#ffffff">
        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.6 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
      </svg>
      <span className="sr-only">Google Play Store</span>
    </div>
  </a>
);
