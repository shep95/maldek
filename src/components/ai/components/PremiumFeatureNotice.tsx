
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const PremiumFeatureNotice = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 text-center space-y-4">
      <div className="h-12 w-12 mx-auto text-accent">
        <span className="text-3xl">✨</span>
      </div>
      <h3 className="text-xl font-semibold">All Features Unlocked</h3>
      <p className="text-muted-foreground">
        All premium features are now available to all users for free!
      </p>
      <Button 
        onClick={() => navigate('/features')}
        className="bg-accent hover:bg-accent/90"
      >
        Explore Features
      </Button>
    </Card>
  );
};
