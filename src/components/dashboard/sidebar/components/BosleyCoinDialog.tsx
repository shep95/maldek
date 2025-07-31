import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Coins, Copy, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface BosleyCoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BosleyCoinDialog = ({ open, onOpenChange }: BosleyCoinDialogProps) => {
  const [timeElapsed, setTimeElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const contractAddress = "4P2B244yZ4Q6D76A8XzKHXxfua7xtYVpUE9X6qvomoon";
  
  // Launch date: May 19th 2025 at 5:33PM EST
  const launchDate = new Date('2025-05-19T17:33:00-05:00');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const timeDiff = now.getTime() - launchDate.getTime();
      
      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        setTimeElapsed({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const copyContractAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      toast.success("Contract address copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy contract address");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient text-xl font-bold text-center flex items-center justify-center gap-2">
            <Coins className="h-6 w-6" />
            BOSLEY COIN
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">
              The official cryptocurrency of our app! Soon we'll integrate it for trading and purchases.
            </p>
            
            <div className="bg-black/20 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-muted-foreground mb-2">Contract Address:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-black/30 px-2 py-1 rounded flex-1 text-center">
                  {contractAddress}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyContractAddress}
                  className="p-2 h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Timer className="h-4 w-4" />
                <span className="text-sm font-semibold">Time Since Launch</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-accent">{timeElapsed.days}</div>
                  <div className="text-xs text-muted-foreground">Days</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-accent">{timeElapsed.hours}</div>
                  <div className="text-xs text-muted-foreground">Hours</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-accent">{timeElapsed.minutes}</div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-accent">{timeElapsed.seconds}</div>
                  <div className="text-xs text-muted-foreground">Seconds</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Launched: May 19th, 2025 at 5:33PM EST
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Buy BOSLEY COIN on your favorite meme coin broker app!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};