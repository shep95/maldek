
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface RothLordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RothLordDialog = ({ open, onOpenChange }: RothLordDialogProps) => {
  const handleClick = () => {
    window.open('https://chatgpt.com/g/g-686c4ee18bc0819189f095327f118f49-rothlord', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient text-xl font-bold text-center">
            RothLord Financial AI
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center">
            <img 
              src="/lovable-uploads/bc911b69-87dc-40e6-8df5-56efb7a2e7ee.png" 
              alt="RothLord AI" 
              className="w-32 h-32 mx-auto rounded-full object-cover mb-4 cursor-pointer hover:scale-105 transition-transform"
              onClick={handleClick}
            />
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              Don't be greedy, but here to help you make money with the stock and crypto market
            </p>
            
            <Button 
              onClick={handleClick}
              className="w-full glass-morphism hover:bg-accent/20 border-accent/30"
              variant="outline"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Access RothLord AI
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
