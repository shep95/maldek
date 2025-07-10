
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
  const handleRothLordClick = () => {
    window.open('https://chatgpt.com/g/g-686c4ee18bc0819189f095327f118f49-rothlord-zorak-corp', '_blank');
  };

  const handleAlgroClick = () => {
    window.open('https://chatgpt.com/g/g-6869a17e31ec819181609db91b61e1e8-algro-zorak-corp', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient text-xl font-bold text-center">
            Maldek Financial AI
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center">
            <img 
              src="/lovable-uploads/bc911b69-87dc-40e6-8df5-56efb7a2e7ee.png" 
              alt="Maldek AI" 
              className="w-32 h-32 mx-auto rounded-lg object-cover mb-4"
            />
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              Trade with pattern recognition without numerology or astrology on stocks, futures, & crypto
            </p>
            
            <Button 
              onClick={handleRothLordClick}
              className="w-full glass-morphism hover:bg-accent/20 border-accent/30"
              variant="outline"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Access Maldek AI
            </Button>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">
                Trade with numerology and astrology
              </p>
              
              <Button 
                onClick={handleAlgroClick}
                className="w-full glass-morphism hover:bg-accent/20 border-accent/30"
                variant="outline"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Access Algro
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
