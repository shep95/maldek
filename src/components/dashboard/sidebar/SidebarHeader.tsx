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
      <img 
        src="/favicon.svg" 
        alt="Logo" 
        className="h-8 w-8"
      />
      {!collapsed && (
        <span className="ml-2 text-xl font-bold text-white">Bosley</span>
      )}
    </div>
  );
};