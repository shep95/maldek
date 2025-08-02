import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bot } from "lucide-react";

interface LibraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LibraDialog = ({ open, onOpenChange }: LibraDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient text-xl font-bold text-center flex items-center justify-center gap-2">
            <Bot className="h-6 w-6" />
            LIBRA
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground text-lg">
              Libra Is The Next Gen Of AI Being Built
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};