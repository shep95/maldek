import { Card } from "@/components/ui/card";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNav } from "./sidebar/SidebarNav";

export const Sidebar = ({ setIsCreatingPost }: { setIsCreatingPost: (value: boolean) => void }) => {
  return (
    <div className="hidden md:block fixed left-0 h-screen p-4">
      <Card className="h-[90vh] w-64 flex flex-col justify-between border-muted bg-[#0d0d0d] backdrop-blur-sm">
        <div>
          <SidebarHeader />
          <SidebarNav setIsCreatingPost={setIsCreatingPost} />
        </div>
      </Card>
    </div>
  );
};