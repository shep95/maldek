import { Bell } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  type: 'notifications' | 'loading';
}

export const EmptyState = ({ type }: EmptyStateProps) => {
  if (type === 'loading') {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card className="flex flex-col items-center justify-center p-8 mt-4 bg-card/50 border-dashed">
      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium text-muted-foreground">No notifications yet</p>
      <p className="text-sm text-muted-foreground/60">
        When someone interacts with your content, you'll see it here
      </p>
    </Card>
  );
};