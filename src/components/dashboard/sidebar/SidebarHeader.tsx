export const SidebarHeader = () => {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-6 h-6">
        <svg 
          viewBox="0 0 32 32" 
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Background with gradient */}
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#000000", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#1a1a1a", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Triangle with rounded corners */}
          <path 
            d="M16 4 L28 26 L4 26 Z"
            fill="url(#grad)"
            stroke="none"
            rx="2"
            style={{ filter: "url(#round-corners)" }}
          />
          
          {/* Filter for rounded corners */}
          <defs>
            <filter id="round-corners">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 22 -15"
              />
            </filter>
          </defs>
        </svg>
      </div>
      <span className="text-2xl font-bold">Bosley</span>
    </div>
  );
};