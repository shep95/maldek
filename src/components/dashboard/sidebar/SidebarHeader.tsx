import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  collapsed?: boolean;
}

export const SidebarHeader = ({ collapsed }: SidebarHeaderProps) => {
  return (
    <div className={cn(
      "flex items-center p-4",
      collapsed ? "justify-center" : "justify-start"
    )}>
      <div className="relative w-8 h-8">
        <img 
          src="/lovable-uploads/640dbd2e-465f-448f-b7a2-713a44fd9a28.png"
          alt="Bosley Logo"
          className="w-full h-full object-contain rounded-full bg-black"
        />
      </div>
      {!collapsed && (
        <span className="ml-2 text-xl font-bold text-white">Bosley</span>
      )}
    </div>
  );
};