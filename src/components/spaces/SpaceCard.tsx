
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { Users, Mic } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SpaceCardProps {
  space: any;
  onJoin: (spaceId: string) => void;
  onLeave: (spaceId: string) => void;
  currentUserId?: string;
}

export const SpaceCard = ({
  space,
  onJoin,
  onLeave,
  currentUserId
}: SpaceCardProps) => {
  const isHost = space.host_id === currentUserId;
  const isParticipant = space.participants?.some((p: any) => p.user_id === currentUserId);
  const userCount = space.participants?.length || 0;
  
  // Get the hosts and speakers (usually displayed at the top)
  const hosts = space.participants?.filter((p: any) => p.role === 'host' || p.role === 'co_host') || [];
  const speakers = space.participants?.filter((p: any) => p.role === 'speaker') || [];
  
  return (
    <Card className="border rounded-lg overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg line-clamp-1">{space.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {space.description || "No description provided"}
            </p>
          </div>
          {space.is_recorded && (
            <Badge variant="outline" className="ml-2">Recorded</Badge>
          )}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Display host */}
          {space.host && (
            <div className="flex items-center">
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarImage src={space.host.avatar_url} />
                <AvatarFallback>
                  {space.host.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <p className="text-xs font-medium">{space.host.username}</p>
                <Badge variant="secondary" className="text-xs">Host</Badge>
              </div>
            </div>
          )}
          
          {/* Display up to 3 speakers */}
          <div className="flex ml-2">
            {speakers.slice(0, 3).map((speaker: any) => (
              <Avatar key={speaker.user_id} className="h-8 w-8 -ml-2 first:ml-0 border-2 border-background">
                <AvatarImage src={speaker.profile?.avatar_url} />
                <AvatarFallback>
                  {speaker.profile?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            ))}
            {speakers.length > 3 && (
              <div className="h-8 w-8 -ml-2 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                +{speakers.length - 3}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <Mic className="h-4 w-4 mr-1" />
            <span className="text-xs">Live</span>
            <Users className="h-4 w-4 ml-4 mr-1" />
            <span className="text-xs">{userCount} listening</span>
          </div>
          
          {space.scheduled_for && (
            <Badge variant="outline" className="text-xs">
              {format(new Date(space.scheduled_for), "MMM d, h:mm a")}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/10 p-3 flex justify-end gap-2">
        {isParticipant ? (
          <>
            <Button
              variant="secondary"
              onClick={() => onLeave(space.id)}
              className="text-xs h-8"
            >
              Leave
            </Button>
            <Button
              onClick={() => onJoin(space.id)}
              className="text-xs h-8"
            >
              Join
            </Button>
          </>
        ) : (
          <Button
            onClick={() => onJoin(space.id)}
            className="text-xs h-8"
          >
            Join
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
