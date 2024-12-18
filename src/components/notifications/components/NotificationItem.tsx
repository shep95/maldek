import { Notification } from "@/hooks/useNotifications";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { getNotificationIcon, getNotificationText } from "../utils/notificationUtils";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

export const NotificationItem = ({
  notification,
  isSelected,
  onSelect,
}: NotificationItemProps) => {
  const IconComponent = Icons[getNotificationIcon(notification.type) as keyof typeof Icons] as LucideIcon;

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200 hover:bg-accent/5 cursor-pointer",
        !notification.read && "bg-accent/5",
        isSelected && "border-accent"
      )}
    >
      <div className="flex items-start gap-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(!!checked)}
          onClick={(e) => e.stopPropagation()}
        />
        <Avatar className="h-10 w-10 border-2 border-background">
          <AvatarImage src={notification.actor.avatar_url || undefined} />
          <AvatarFallback className="bg-accent text-accent-foreground">
            {notification.actor.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4 text-accent" />
            <p className="text-sm font-medium">
              {getNotificationText(notification.type, notification.actor.username)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </Card>
  );
};