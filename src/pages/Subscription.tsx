
import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CancelAllSubscriptions } from "@/components/subscription/CancelAllSubscriptions";
import { useEffect } from "react";
import { initFastSpring, openFastSpringStore, PRODUCT_IDS } from "@/integrations/fastspring/client";
import { supabase } from "@/integrations/supabase/client";

const Subscription = () => {
  const session = useSession();
  const navigate = useNavigate();

  // Initialize FastSpring when component mounts
  useEffect(() => {
    initFastSpring();
  }, []);

  const handleSubscribe = async (productId: string) => {
    if (!session) {
      navigate('/auth');
      return;
    }

    // Get user email for FastSpring
    const { data: { user } } = await supabase.auth.getUser();
    
    // Open FastSpring store
    openFastSpringStore(productId, {
      email: user?.email,
      userId: user?.id || '',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden component that ensures all users have premium features */}
      <CancelAllSubscriptions />
      
      <div className="container mx-auto py-12 px-4">
        <div className="mb-12 space-y-3">
          <h2 className="text-center text-3xl font-semibold leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
            Invest in Our Platform
          </h2>
          <p className="text-center text-base text-muted-foreground md:text-lg">
            Investment opportunities coming soon
          </p>
        </div>
        
        <div className="max-w-xl mx-auto">
          <Card className="overflow-hidden border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6 text-center">
                <div>
                  <p className="text-lg mb-4">
                    Investment opportunities will be available soon. All premium features are currently free for everyone.
                  </p>
                  
                  <div className="flex flex-col gap-2 items-center">
                    <Badge className="mb-4">All Features Unlocked</Badge>
                    
                    <Button 
                      onClick={() => navigate('/features')}
                      className="bg-accent hover:bg-accent/90 w-full max-w-xs"
                    >
                      Explore Features
                    </Button>
                    
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      variant="outline"
                      className="w-full max-w-xs"
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
