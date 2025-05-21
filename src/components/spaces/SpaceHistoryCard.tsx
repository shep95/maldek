
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { PlayCircle, Download, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SpaceHistoryCardProps {
  space: any;
  onPurchaseRecording: (spaceId: string) => void;
  currentUserId?: string;
}

export const SpaceHistoryCard = ({
  space,
  onPurchaseRecording,
  currentUserId
}: SpaceHistoryCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const isHost = space.host_id === currentUserId;
  const hasRecording = space.is_recorded;
  const userPurchasedRecording = space.recording_purchases?.some(
    (purchase: any) => purchase.user_id === currentUserId
  );
  const canAccessRecording = isHost || userPurchasedRecording;
  
  // Calculate duration
  const duration = space.ended_at && space.started_at 
    ? new Date(space.ended_at).getTime() - new Date(space.started_at).getTime() 
    : 0;
  
  // Convert to minutes and seconds
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  const durationFormatted = `${minutes}m ${seconds}s`;
  
  const handlePlayRecording = () => {
    // Logic for playing recording would go here
    console.log("Play recording:", space.id);
  };
  
  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      await onPurchaseRecording(space.id);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="border rounded-lg overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg line-clamp-1">{space.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {space.description || "No description provided"}
            </p>
          </div>
          {hasRecording && (
            <Badge variant="outline" className="ml-2">Recorded</Badge>
          )}
        </div>
        
        <div className="mt-4">
          {space.host && (
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
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
        </div>
        
        <div className="mt-4 flex items-center justify-between text-muted-foreground text-xs">
          <div>
            {space.started_at && (
              <span>
                {format(new Date(space.started_at), "MMM d, yyyy")} • {durationFormatted}
              </span>
            )}
          </div>
          
          <div>
            {space.participants_count || 0} participants
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/10 p-3 flex justify-end gap-2">
        {hasRecording ? (
          canAccessRecording ? (
            <>
              <Button
                variant="outline" 
                size="sm"
                onClick={handlePlayRecording}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Play
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </>
          ) : (
            <Button
              onClick={handlePurchase}
              disabled={isLoading}
            >
              <Lock className="h-4 w-4 mr-2" />
              Purchase Recording
            </Button>
          )
        ) : (
          <Badge variant="outline">No Recording</Badge>
        )}
      </CardFooter>
    </Card>
  );
};
