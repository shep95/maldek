
import { cn } from "@/lib/utils";
import { useSession } from "@supabase/auth-helpers-react";
import { StoryRing } from "@/components/profile/StoryRing";
import { Hexagon } from "lucide-react";

interface SidebarHeaderProps {
  collapsed?: boolean;
}

export const SidebarHeader = ({ collapsed }: SidebarHeaderProps) => {
  const session = useSession();

  return (
    <div className={cn(
      "flex items-center p-4",
      collapsed ? "justify-center" : "justify-start"
    )}>
      {session?.user?.id ? (
        <StoryRing userId={session.user.id}>
          <div className="relative w-8 h-8">
            <Hexagon className="w-full h-full text-accent" />
          </div>
        </StoryRing>
      ) : (
        <div className="relative w-8 h-8">
          <Hexagon className="w-full h-full text-accent" />
        </div>
      )}
      {!collapsed && (
        <span className="ml-2 text-xl font-bold text-white">Bosley</span>
      )}
    </div>
  );
};

