
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
    window.open('https://chatgpt.com/g/g-686c4ee18bc0819189f095327f118f49-maldek-zorak-corp', '_blank');
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient text-xl font-bold text-center">
            🜍 HADES 🜍
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center">
            <img 
              src="/lovable-uploads/d12fb3e9-d450-4243-8348-23a0def30642.png" 
              alt="HADES AI" 
              className="w-32 h-32 mx-auto rounded-lg object-cover mb-4"
            />
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              🜍 wealth from the unseen 🜍
            </p>
            
            <Button 
              onClick={handleRothLordClick}
              className="w-full glass-morphism hover:bg-accent/20 border-accent/30"
              variant="outline"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Access HADES AI
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
