
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles } from "lucide-react";

export const PremiumFeatureNotice = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-6 text-center space-y-4">
      <div className="h-12 w-12 mx-auto text-accent">
        <Sparkles className="h-12 w-12 text-accent" />
      </div>
      <h3 className="text-xl font-semibold">Premium Feature</h3>
      <p className="text-muted-foreground">
        This feature requires an active subscription plan.
      </p>
      <div className="flex flex-col md:flex-row gap-3 justify-center mt-4">
        <Button onClick={() => navigate('/subscription')} className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          View Subscription Plans
        </Button>
        <Button 
          onClick={() => navigate('/bosley-coin')} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Coins className="h-4 w-4" />
          Check Bosley Coin
        </Button>
      </div>
    </Card>
  );
};
