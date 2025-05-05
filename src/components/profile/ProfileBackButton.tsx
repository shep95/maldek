
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const ProfileBackButton = () => {
  const navigate = useNavigate();
  
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(-1);
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
      className="absolute top-4 left-4 z-20 bg-background/50 backdrop-blur-sm border border-border/50 rounded-full"
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};
