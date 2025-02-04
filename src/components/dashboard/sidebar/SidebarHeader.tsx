export const SidebarHeader = () => {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-8 h-8 rounded-2xl bg-black flex items-center justify-center overflow-hidden">
        <img 
          src="/lovable-uploads/87caaad4-37ef-4a36-8610-fc3603fab7b0.png"
          alt="Bosley Logo"
          className="w-6 h-6 object-cover rounded-xl"
        />
      </div>
      <span className="text-2xl font-bold">Bosley</span>
    </div>
  );
};