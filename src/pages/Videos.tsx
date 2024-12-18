import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Videos = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth", { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className={cn("min-h-screen flex items-center justify-center")}>
      <h1 className="text-2xl font-bold">Videos Page</h1>
    </div>
  );
};

export default Videos;
