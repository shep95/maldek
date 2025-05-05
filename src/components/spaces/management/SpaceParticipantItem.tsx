
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Mic, Hand } from "lucide-react";
import { SpaceParticipantControls } from "./SpaceParticipantControls";
import { useProfileNavigation } from "@/hooks/useProfileNavigation";

interface SpaceParticipantItemProps {
  participant: any;
  spaceId: string;
  currentUserId?: string;
  canManageParticipants: boolean;
  onParticipantUpdate: () => void;
  isSpeaking?: boolean;
  hasRaisedHand?: boolean;
}

export const SpaceParticipantItem = ({
  participant,
  spaceId,
  currentUserId,
  canManageParticipants,
  onParticipantUpdate,
  isSpeaking,
  hasRaisedHand
}: SpaceParticipantItemProps) => {
  const { navigateToProfile } = useProfileNavigation();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'co_host':
        return <Crown className="h-3 w-3 text-blue-500" />;
      case 'speaker':
        return <Mic className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (participant.profile?.username) {
      navigateToProfile(participant.profile.username, e);
    }
  };

  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-2">
        <div className="relative" onClick={handleProfileClick}>
          <Avatar className="h-8 w-8 cursor-pointer hover:border-accent transition-colors duration-200">
            <AvatarImage src={participant.profile?.avatar_url} />
            <AvatarFallback>
              {participant.profile?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isSpeaking && (
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
          )}
        </div>
        <div className="flex flex-col">
          <span 
            className="text-sm font-medium flex items-center gap-1 cursor-pointer hover:underline"
            onClick={handleProfileClick}
          >
            {participant.profile?.username}
            {getRoleIcon(participant.role)}
            {hasRaisedHand && <Hand className="h-3 w-3 text-accent animate-pulse" />}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {participant.role}
          </span>
        </div>
      </div>
      
      {canManageParticipants && participant.user_id !== currentUserId && (
        <SpaceParticipantControls
          spaceId={spaceId}
          participant={participant}
          currentUserId={currentUserId}
          onParticipantMuted={onParticipantUpdate}
        />
      )}
    </div>
  );
};
