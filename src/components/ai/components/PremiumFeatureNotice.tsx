import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PremiumFeatureNotice = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 text-center space-y-4">
      <Crown className="h-12 w-12 mx-auto text-accent" />
      <h3 className="text-xl font-semibold">Premium Feature</h3>
      <p className="text-muted-foreground">
        This feature is available exclusively to our premium subscribers.
      </p>
      <p className="text-sm text-muted-foreground">Starting at $17/month</p>
      <Button 
        onClick={() => navigate('/subscription')}
        className="bg-accent hover:bg-accent/90"
      >
        Upgrade to Premium
      </Button>
    </Card>
  );
};