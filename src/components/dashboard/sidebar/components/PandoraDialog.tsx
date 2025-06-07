
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bot } from "lucide-react";

interface PandoraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PandoraDialog = ({ open, onOpenChange }: PandoraDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-accent" />
            PANDORA
          </DialogTitle>
          <DialogDescription className="text-center py-4">
            Pandora is built by <span className="font-semibold text-accent">ZORAK</span> and will be running as soon as possible.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
