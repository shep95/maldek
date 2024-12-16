import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { RightSidebar } from "../RightSidebar";
import { MobileNav } from "../MobileNav";

export const DashboardLoading = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <Sidebar setIsCreatingPost={() => {}} />
      <div className={cn(
        "flex-1 transition-all duration-200",
        "md:ml-64",
        location.pathname === '/dashboard' && "lg:mr-80"
      )}>
        <main className="min-h-screen pb-20 md:pb-0 px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
                <p className="text-muted-foreground">Loading your profile...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
      {location.pathname === '/dashboard' && <RightSidebar />}
      <MobileNav />
    </div>
  );
};