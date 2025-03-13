
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface RecordingPurchaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  space: any;
  onPurchase: () => void;
}

export const RecordingPurchaseDialog = ({
  isOpen,
  onOpenChange,
  space,
  onPurchase,
}: RecordingPurchaseDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase Recording</DialogTitle>
          <DialogDescription>
            Get access to the recording of this space
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">{space.title}</h3>
            <p className="text-sm text-muted-foreground">
              Hosted by {space.host?.username}
            </p>
            <p className="text-sm text-muted-foreground">
              Ended {formatDistanceToNow(new Date(space.ended_at), { addSuffix: true })}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Price</span>
              <span className="font-semibold">${space.recording_price?.toFixed(2) || "2.00"}</span>
            </div>
          </div>

          <Button onClick={onPurchase} className="w-full">
            Purchase Recording
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
