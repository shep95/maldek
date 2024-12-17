import { useEffect } from "react";
import { logoutAllUsers } from "@/utils/authUtils";

const Index = () => {
  useEffect(() => {
    const handleInitialActions = async () => {
      console.log("Starting cleanup process...");
      await logoutAllUsers();
    };

    handleInitialActions();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
        <p className="text-muted-foreground">Cleaning up...</p>
      </div>
    </div>
  );
};

export default Index;