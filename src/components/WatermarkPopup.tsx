
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WatermarkPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WatermarkPopup = ({ open, onOpenChange }: WatermarkPopupProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">RO Corporation</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 p-4">
          <img 
            src="/lovable-uploads/56518f9a-8c42-4617-b2ab-23c193f39841.png" 
            alt="RO Logo" 
            className="w-20 h-20"
          />
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Proudly powered by RO Corporation
            </p>
            <p className="text-xs text-muted-foreground">
              Innovation • Technology • Future
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WatermarkPopup;
