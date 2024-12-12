import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

const DashboardLayout = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar setIsCreatingPost={setIsCreatingPost} />
      <div className="md:pl-64">
        <main className="min-h-screen pb-20 md:pb-0 px-4">
          <div className="max-w-3xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;