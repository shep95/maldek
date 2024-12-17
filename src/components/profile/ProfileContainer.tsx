import { Card } from "@/components/ui/card";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileInfo } from "./ProfileInfo";
import { ProfileTabs } from "./ProfileTabs";

interface ProfileContainerProps {
  profile: any;
  isCurrentUser: boolean;
  isEditing: boolean;
  editBio: string;
  userId: string;
  onEditClick: () => void;
  onEditBioChange: (bio: string) => void;
  onSaveChanges: () => void;
  onImageUpdate: (type: 'avatar' | 'banner', url: string) => void;
}

export const ProfileContainer = ({
  profile,
  isCurrentUser,
  isEditing,
  editBio,
  userId,
  onEditClick,
  onEditBioChange,
  onSaveChanges,
  onImageUpdate
}: ProfileContainerProps) => {
  return (
    <div className="animate-fade-in w-full">
      <Card className="border-none bg-transparent shadow-none overflow-hidden">
        <ProfileHeader
          username={profile.username}
          avatarUrl={profile.avatar_url}
          bannerUrl={profile.banner_url}
          isCurrentUser={isCurrentUser}
          onEditClick={onEditClick}
          isEditing={isEditing}
          userId={userId}
          onImageUpdate={onImageUpdate}
        />
        <ProfileInfo
          username={profile.username}
          bio={profile.bio || ""}
          followerCount={profile.follower_count}
          createdAt={profile.created_at}
          userId={userId}
          isCurrentUser={isCurrentUser}
          isEditing={isEditing}
          editBio={editBio}
          onEditBioChange={onEditBioChange}
          onSaveChanges={onSaveChanges}
        />
        <div className="mt-4">
          <ProfileTabs />
        </div>
      </Card>
    </div>
  );
};