import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAllUsers } from "@/utils/authUtils";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleInitialActions = async () => {
      console.log("Starting cleanup process...");
      await logoutAllUsers();
      console.log("Cleanup complete, redirecting to auth page...");
      navigate("/auth");
    };

    handleInitialActions();
  }, [navigate]);

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