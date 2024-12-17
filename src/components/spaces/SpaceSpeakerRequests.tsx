import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SpaceSpeakerRequestsProps {
  isHost: boolean;
  speakerRequests: any[];
  onHandleRequest: (requestId: string, userId: string, accept: boolean) => void;
}

export const SpaceSpeakerRequests = ({ 
  isHost, 
  speakerRequests,
  onHandleRequest 
}: SpaceSpeakerRequestsProps) => {
  if (!isHost) {
    return (
      <p className="text-muted-foreground text-sm">
        Only hosts can view speaker requests
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Speaker Requests</h3>
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <div className="space-y-4">
          {speakerRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No pending requests
            </p>
          ) : (
            speakerRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={request.profile?.avatar_url} />
                    <AvatarFallback>
                      {request.profile?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {request.profile?.username}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onHandleRequest(request.id, request.user_id, false)}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onHandleRequest(request.id, request.user_id, true)}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};