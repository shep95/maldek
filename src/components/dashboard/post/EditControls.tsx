import { Button } from "@/components/ui/button";

interface EditControlsProps {
  onCancel: () => void;
  onSave: () => void;
}

export const EditControls = ({ onCancel, onSave }: EditControlsProps) => {
  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        size="sm"
        onClick={onSave}
      >
        Save
      </Button>
    </div>
  );
};