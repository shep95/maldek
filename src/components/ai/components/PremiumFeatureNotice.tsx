import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const PremiumFeatureNotice = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] p-4">
      <Card className="p-6 max-w-md w-full text-center space-y-4 bg-card/50 backdrop-blur-sm">
        <MessageCircle className="w-12 h-12 mx-auto text-accent animate-pulse" />
        <h2 className="text-xl font-semibold">Premium Feature</h2>
        <p className="text-muted-foreground">
          Upgrade to our premium plan to access Daarp AI and unlock powerful AI features.
        </p>
        <Button
          variant="default"
          className="w-full bg-accent hover:bg-accent/90"
          onClick={() => window.location.href = '/subscription'}
        >
          Upgrade Now
        </Button>
      </Card>
    </div>
  );
};