
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MicOff, User, UserCog } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface SpaceParticipantsListProps {
  participants: any[];
  spaceId: string;
  isHost: boolean;
  onParticipantUpdate: () => void;
  onMuteParticipant?: (userId: string) => void;
  onChangeRole?: (userId: string, newRole: string) => void;
}

export const SpaceParticipantsList = ({
  participants,
  spaceId,
  isHost,
  onParticipantUpdate,
  onMuteParticipant,
  onChangeRole
}: SpaceParticipantsListProps) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'host':
        return <Badge variant="default" className="ml-2">Host</Badge>;
      case 'co_host':
        return <Badge variant="secondary" className="ml-2">Co-Host</Badge>;
      case 'speaker':
        return <Badge variant="outline" className="ml-2">Speaker</Badge>;
      default:
        return null;
    }
  };

  const roleOptions = [
    { value: 'listener', label: 'Listener' },
    { value: 'speaker', label: 'Speaker' },
    { value: 'co_host', label: 'Co-host' }
  ];

  return (
    <div className="space-y-4 mt-4">
      <ScrollArea className="h-[250px]">
        <div className="space-y-2">
          {participants.map((participant) => (
            <div 
              key={participant.user_id} 
              className="flex items-center justify-between p-2 bg-secondary/20 rounded-md"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={participant.profile?.avatar_url} />
                  <AvatarFallback>
                    {participant.profile?.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">{participant.profile?.username || 'Unknown user'}</span>
                    {getRoleBadge(participant.role)}
                  </div>
                </div>
              </div>
              
              {isHost && participant.role !== 'host' && (
                <div className="flex gap-2">
                  {participant.role === 'speaker' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onMuteParticipant?.(participant.user_id)}
                      title="Mute participant"
                    >
                      <MicOff className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {roleOptions.filter(option => option.value !== participant.role).map(option => (
                        <DropdownMenuItem 
                          key={option.value}
                          onClick={() => onChangeRole?.(participant.user_id, option.value)}
                        >
                          Make {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
