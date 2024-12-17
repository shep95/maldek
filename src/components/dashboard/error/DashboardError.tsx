import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { RightSidebar } from "../RightSidebar";
import { MobileNav } from "../MobileNav";

export const DashboardError = () => {
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
                <p className="text-muted-foreground">Error loading profile. Please try refreshing the page.</p>
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