import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface NotificationActionsProps {
  selectedCount: number;
  onSelectAll: () => void;
  allSelected: boolean;
  onAction: (action: 'read' | 'archive' | 'delete') => void;
  sortOrder: 'asc' | 'desc';
  onSortChange: (value: 'asc' | 'desc') => void;
}

export const NotificationActions = ({
  selectedCount,
  onSelectAll,
  allSelected,
  onAction,
  sortOrder,
  onSortChange
}: NotificationActionsProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onSelectAll}
        />
        <span className="text-sm text-muted-foreground">
          {selectedCount} selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('read')}
          disabled={selectedCount === 0}
        >
          Mark as Read
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('archive')}
          disabled={selectedCount === 0}
        >
          Archive
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('delete')}
          disabled={selectedCount === 0}
        >
          Delete
        </Button>
        <Select
          value={sortOrder}
          onValueChange={(value: 'asc' | 'desc') => onSortChange(value)}
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