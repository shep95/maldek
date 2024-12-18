import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface NotificationFiltersProps {
  onFilterChange: (filters: {
    type: string;
    dateRange: { from: Date | undefined; to: Date | undefined };
    search: string;
  }) => void;
}

export const NotificationFilters = ({ onFilterChange }: NotificationFiltersProps) => {
  const [type, setType] = useState<string>("all");
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [search, setSearch] = useState("");

  const handleTypeChange = (value: string) => {
    setType(value);
    onFilterChange({ type: value, dateRange: date, search });
  };

  const handleDateChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDate(range);
    onFilterChange({ type, dateRange: range, search });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ type, dateRange: date, search: value });
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="like">Likes</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
            <SelectItem value="follow">Follows</SelectItem>
            <SelectItem value="mention">Mentions</SelectItem>
            <SelectItem value="repost">Reposts</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};