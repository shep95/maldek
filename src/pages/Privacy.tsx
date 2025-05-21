
import { useEffect } from "react";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy - Bosley";
  }, []);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="flex justify-center">
        <main className="w-full max-w-3xl px-4 py-6 md:py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Privacy</h1>
          
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Private Content Access</h2>
            <p className="text-muted-foreground">
              Premium subscribers have access to exclusive private content from creators they follow.
            </p>
            
            <h3 className="text-xl font-medium mt-6">Your Privacy</h3>
            <p className="text-muted-foreground">
              Your browsing activity within private content areas is not tracked or shared with third parties.
              We respect your privacy and ensure that your data remains secure.
            </p>
            
            <h3 className="text-xl font-medium mt-6">Content Guidelines</h3>
            <p className="text-muted-foreground">
              All private content still adheres to our community guidelines.
              Inappropriate content can be reported through the standard reporting channels.
            </p>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Privacy;
