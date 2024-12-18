import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid2X2, List } from "lucide-react";

interface VideoControlsProps {
  viewMode: 'grid' | 'list';
  sortBy: string;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSortChange: (value: string) => void;
}

export const VideoControls = ({ 
  viewMode, 
  sortBy, 
  onViewModeChange, 
  onSortChange 
}: VideoControlsProps) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="views">Most Viewed</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewModeChange('grid')}
        >
          <Grid2X2 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};