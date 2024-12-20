import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NotificationActionsProps {
  selectedCount: number;
  onMarkRead: () => void;
  onArchive: () => void;
  onDelete: () => void;
  sortOrder: 'asc' | 'desc';
  onSortChange: (value: 'asc' | 'desc') => void;
  isProcessing: boolean;
}

export const NotificationActions = ({
  selectedCount,
  onMarkRead,
  onArchive,
  onDelete,
  sortOrder,
  onSortChange,
  isProcessing
}: NotificationActionsProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkRead}
          disabled={selectedCount === 0 || isProcessing}
          className="hover:bg-accent/10 min-w-[100px] cursor-pointer"
        >
          {isProcessing ? "Processing..." : "Mark as Read"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onArchive}
          disabled={selectedCount === 0 || isProcessing}
          className="hover:bg-accent/10 min-w-[80px] cursor-pointer"
        >
          {isProcessing ? "Processing..." : "Archive"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={selectedCount === 0 || isProcessing}
          className="hover:bg-accent/10 min-w-[80px] cursor-pointer"
        >
          {isProcessing ? "Processing..." : "Delete"}
        </Button>
        <Select
          value={sortOrder}
          onValueChange={(value: 'asc' | 'desc') => onSortChange(value)}
          disabled={isProcessing}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest first</SelectItem>
            <SelectItem value="asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};