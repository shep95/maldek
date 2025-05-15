
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const PremiumFeatureNotice = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-6 text-center space-y-4">
      <div className="h-12 w-12 mx-auto text-accent">
        <span className="text-3xl">✨</span>
      </div>
      <h3 className="text-xl font-semibold">Premium Feature</h3>
      <p className="text-muted-foreground">
        This feature requires an active subscription plan.
      </p>
      <Button onClick={() => navigate('/subscription')} className="mt-2">
        View Subscription Plans
      </Button>
    </Card>
  );
};
