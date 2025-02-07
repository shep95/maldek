
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdvertisementDialog } from "@/components/advertisements/AdvertisementDialog";
import { DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

const Advertisement = () => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="container max-w-6xl p-6 mx-auto">
      <Card className="p-8 bg-gradient-to-br from-black/90 to-black/70 border-accent/20">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
            Premium Advertisement Opportunities
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our exclusive network of premium advertisers and reach an engaged audience of professionals and decision-makers.
          </p>
          <Button
            onClick={() => setShowDialog(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white px-8"
          >
            <DollarSign className="mr-2 h-5 w-5" />
            See If You Qualify
          </Button>
        </div>
      </Card>

      <AdvertisementDialog
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </div>
  );
};

export default Advertisement;
