import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

interface ProfileHeaderProps {
  profile: any;
  isLoading: boolean;
}

export const ProfileHeader = ({ profile, isLoading }: ProfileHeaderProps) => {
  const session = useSession();
  const userId = session?.user?.id;
  const {
    blockedUserIds,
    blockUser,
    unblockUser,
    isBlocking,
    isUnblocking,
  } = useBlockedUsers();

  const isOwnProfile = userId === profile.id;
  const isBlocked = blockedUserIds?.includes(profile.id);

  return (
    <div className="flex items-center gap-4 pb-8 border-b border-muted">
      <Avatar className="h-20 w-20">
        <AvatarImage src={profile.avatar_url || undefined} />
        <AvatarFallback>{profile.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl font-semibold">@{profile.username}</h1>
        {!isOwnProfile && (
          <div className="mt-2 flex gap-2">
            {!isBlocked ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => blockUser(profile.id)}
                disabled={isBlocking}
              >
                Block
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => unblockUser(profile.id)}
                disabled={isUnblocking}
              >
                Unblock
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
