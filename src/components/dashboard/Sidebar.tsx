import { Card } from "@/components/ui/card";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNav } from "./sidebar/SidebarNav";

interface SidebarProps {
  setIsCreatingPost: (value: boolean) => void;
}

export const Sidebar = ({ setIsCreatingPost }: SidebarProps) => {
  console.log('Sidebar rendered with setIsCreatingPost function:', !!setIsCreatingPost);
  
  return (
    <div className="hidden md:block fixed left-0 h-screen w-64 p-4">
      <Card className="h-full flex flex-col border-muted bg-[#0d0d0d] backdrop-blur-sm">
        <SidebarHeader />
        <div className="flex-1 overflow-hidden">
          <SidebarNav setIsCreatingPost={setIsCreatingPost} />
        </div>
      </Card>
    </div>
  );
};