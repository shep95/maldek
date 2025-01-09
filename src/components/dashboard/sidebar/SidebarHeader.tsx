export const SidebarHeader = () => {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-6 h-6">
        <svg 
          viewBox="0 0 32 32" 
          className="w-full h-full"
          aria-hidden="true"
        >
          <path 
            d="M16 8 L24 22 L8 22 Z" 
            className="fill-white"
          />
        </svg>
      </div>
      <span className="text-2xl font-bold">Maldek</span>
    </div>
  );
};