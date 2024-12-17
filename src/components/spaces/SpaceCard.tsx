import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface SpaceCardProps {
  space: any;
  onJoin: (spaceId: string) => void;
}

export const SpaceCard = ({ space, onJoin }: SpaceCardProps) => {
  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h3 className="font-semibold">{space.title}</h3>
          {space.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {space.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={space.host?.avatar_url} />
              <AvatarFallback>
                {space.host?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Hosted by {space.host?.username}
            </span>
            <div className="flex items-center gap-1 ml-auto">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {space.participants_count}
              </span>
            </div>
          </div>
        </div>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => onJoin(space.id)}
        >
          Join
        </Button>
      </div>
    </div>
  );
};