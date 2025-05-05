
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StoryRing } from "./StoryRing";
import { useSession } from '@supabase/auth-helpers-react';
import { EditProfileDialog } from "./EditProfileDialog";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  profile: any;
  isLoading: boolean;
}

export const ProfileHeader = ({ profile, isLoading }: ProfileHeaderProps) => {
  const session = useSession();
  const navigate = useNavigate();
  const isOwnProfile = session?.user?.id === profile?.id;
  const [hasStories, setHasStories] = useState(false);
  
  const handleProfileUpdate = () => {
    console.log("Profile updated");
    // Trigger any data refetch if needed
  };

  return (
    <div className="relative bg-gradient-to-b from-black/30 to-transparent">
      {/* Banner */}
      <div 
        className="h-48 md:h-64 w-full bg-cover bg-center relative"
        style={{ 
          backgroundImage: profile?.banner_url ? `url(${profile.banner_url})` : 'url(/bg-pattern.png)',
          backgroundColor: profile?.banner_url ? 'transparent' : 'rgba(44, 47, 63, 0.7)',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90"></div>
      </div>
      
      {/* Profile Info */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar with Story Ring */}
          <div className="relative">
            {hasStories ? (
              <StoryRing size="lg" viewed={false}>
                <Avatar className="h-32 w-32 border-4 border-background">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-3xl font-bold">
                    {profile?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </StoryRing>
            ) : (
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-3xl font-bold">
                  {profile?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          
          {/* Profile details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-3xl font-bold">@{profile?.username}</h1>
            </div>
            
            <p className="text-muted-foreground max-w-lg">
              {profile?.bio || 'No bio yet.'}
            </p>
            
            <div className="flex items-center gap-2">
              <p className="text-sm"><span className="font-semibold">{profile?.follower_count || 0}</span> Followers</p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4 md:mt-0 self-start md:self-auto">
            {isOwnProfile ? (
              <EditProfileDialog 
                profile={profile} 
                onProfileUpdate={handleProfileUpdate}
              />
            ) : (
              <Button variant="default" className="bg-accent hover:bg-accent/90">
                Follow
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
