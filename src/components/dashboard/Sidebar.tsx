
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
      isCollapsed ? "w-28" : "w-72" // Increased width for collapsed state
    )}>
      <Card className={cn(
        "h-full flex flex-col bg-background/20 border-border/50 backdrop-blur-md relative",
        "rounded-xl shadow-lg hover:shadow-xl transition-all",
        isCollapsed && "shadow-lg hover:shadow-xl hover:shadow-accent/5",
        "py-6"
      )}>
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute -right-3 top-6 z-50 bg-background border shadow-md"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        {!isCollapsed && <SidebarHeader collapsed={isCollapsed} />}
        <div className={cn("flex-1 overflow-hidden", isCollapsed && "mt-6")}>
          <SidebarNav setIsCreatingPost={setIsCreatingPost} collapsed={isCollapsed} />
        </div>
      </Card>
    </div>
  );
};
