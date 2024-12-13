import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface ProfileInfoProps {
  username: string;
  bio: string;
  followerCount: number;
  createdAt: string;
  userId: string;
  isCurrentUser: boolean;
  isEditing: boolean;
  editBio: string;
  onEditBioChange: (value: string) => void;
  onSaveChanges: () => void;
}

export const ProfileInfo = ({
  username,
  bio,
  followerCount,
  createdAt,
  userId,
  isCurrentUser,
  isEditing,
  editBio,
  onEditBioChange,
  onSaveChanges
}: ProfileInfoProps) => {
  const session = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);

  // Check if current user is following this profile
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!session?.user?.id || isCurrentUser) return;

      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', session.user.id)
        .eq('following_id', userId)
        .single();

      if (error) {
        console.error('Error checking follow status:', error);
        return;
      }

      setIsFollowing(!!data);
    };

    checkFollowStatus();
  }, [session?.user?.id, userId, isCurrentUser]);

  // Get following count
  useEffect(() => {
    const getFollowingCount = async () => {
      const { count, error } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (error) {
        console.error('Error getting following count:', error);
        return;
      }

      setFollowingCount(count || 0);
    };

    getFollowingCount();
  }, [userId]);

  const handleFollow = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to follow users');
      return;
    }

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);

        if (error) throw error;
        toast.success('Unfollowed successfully');
      } else {
        const { error } = await supabase
          .from('followers')
          .insert({
            follower_id: session.user.id,
            following_id: userId
          });

        if (error) {
          if (error.code === '23505') {
            toast.error('You are already following this user');
            return;
          }
          throw error;
        }
        toast.success('Followed successfully');
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Failed to update follow status');
    }
  };

  return (
    <div className="px-6 pt-20 pb-4">
      <div className="flex items-start justify-between">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              @{username}
            </h1>
          </div>
        </div>
        {!isCurrentUser && session?.user?.id && (
          <Button 
            variant={isFollowing ? "outline" : "default"}
            className={`${isFollowing ? 'bg-background hover:bg-background/90' : 'bg-accent hover:bg-accent/90'} transition-all duration-300 animate-fade-in`}
            onClick={handleFollow}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
        {isCurrentUser && (
          <Button 
            variant="outline" 
            className="bg-accent text-white hover:bg-accent/90 transition-all duration-300 animate-fade-in"
          >
            Get verified
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-4 animate-fade-in">
          <Textarea
            value={editBio}
            onChange={(e) => onEditBioChange(e.target.value)}
            placeholder="Tell us about yourself..."
            className="min-h-[100px] bg-background/50 backdrop-blur border-accent/20 focus:border-accent/50 transition-all duration-300"
          />
          <Button 
            onClick={onSaveChanges}
            className="mt-2 bg-accent hover:bg-accent/90 transition-all duration-300"
          >
            Save Changes
          </Button>
        </div>
      ) : (
        <p className="mt-4 text-lg text-gray-300 animate-fade-in">{bio || "No bio yet"}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-4 text-muted-foreground animate-fade-in">
        <div className="flex items-center group">
          <Calendar className="mr-1 h-4 w-4 group-hover:text-accent transition-colors duration-300" />
          <span className="group-hover:text-accent transition-colors duration-300">
            Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-6 animate-fade-in">
        <button className="group hover:scale-105 transition-transform duration-300">
          <span className="font-bold text-foreground group-hover:text-accent transition-colors duration-300">
            {followingCount}
          </span>{" "}
          <span className="text-muted-foreground group-hover:text-accent/70 transition-colors duration-300">
            Following
          </span>
        </button>
        <button className="group hover:scale-105 transition-transform duration-300">
          <span className="font-bold text-foreground group-hover:text-accent transition-colors duration-300">
            {followerCount}
          </span>{" "}
          <span className="text-muted-foreground group-hover:text-accent/70 transition-colors duration-300">
            Followers
          </span>
        </button>
      </div>
    </div>
  );
};