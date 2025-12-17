
import { Card } from "@/components/ui/card";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNav } from "./sidebar/SidebarNav";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  setIsCreatingPost: (value: boolean) => void;
}

export const Sidebar = ({ setIsCreatingPost }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  console.log('Sidebar rendered with setIsCreatingPost function:', !!setIsCreatingPost);
  
  return (
    <div className={cn(
      "hidden md:block fixed left-0 h-[calc(100dvh-2rem)] transition-all duration-300 px-4 py-6",
      isCollapsed ? "w-24" : "w-72"
    )}>
      <Card className={cn(
        "h-full flex flex-col border-border/30 backdrop-blur-xl relative",
        "rounded-2xl transition-all duration-300",
        "bg-card/50 shadow-[0_8px_32px_-8px_hsl(0_0%_0%/0.3)]",
        "hover:bg-card/60 hover:shadow-[0_12px_48px_-12px_hsl(0_0%_0%/0.4)]",
        isCollapsed && "hover:shadow-[0_12px_48px_-12px_hsl(var(--accent)/0.15)]",
        "py-6"
      )}>
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute -right-3 top-6 z-50 bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-card hover:shadow-xl transition-all"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        <SidebarHeader collapsed={isCollapsed} />
        <div className="flex-1 overflow-hidden">
          <SidebarNav setIsCreatingPost={setIsCreatingPost} collapsed={isCollapsed} />
        </div>
      </Card>
    </div>
  );
};
