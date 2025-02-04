export const SidebarHeader = () => {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center overflow-hidden">
        <svg 
          viewBox="0 0 32 32" 
          className="w-6 h-6"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#000000", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#1a1a1a", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Triangle */}
          <path 
            d="M16 4 L28 26 L4 26 Z"
            fill="#ffffff"
            stroke="none"
          />
        </svg>
      </div>
      <span className="text-2xl font-bold">Bosley</span>
    </div>
  );
};