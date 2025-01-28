import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EditControlsProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export const EditControls = ({ onCancel, onSave, isSaving }: EditControlsProps) => {
  return (
    <div className="flex gap-2 justify-end mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancel
      </Button>
      <Button
        size="sm"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save'
        )}
      </Button>
    </div>
  );
};