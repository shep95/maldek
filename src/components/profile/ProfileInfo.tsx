import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { FollowButton } from "./FollowButton";

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
  onSaveChanges,
}: ProfileInfoProps) => {
  const navigate = useNavigate();
  const session = useSession();
  const [isMessageSending, setIsMessageSending] = useState(false);

  const handleMessageClick = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to send messages");
      return;
    }

    if (isMessageSending) return;

    try {
      setIsMessageSending(true);

      // Get current user's follower count
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('profiles')
        .select('follower_count')
        .eq('id', session.user.id)
        .single();

      if (currentUserError) throw currentUserError;

      // Get target user's follower count
      const { data: targetUserData, error: targetUserError } = await supabase
        .from('profiles')
        .select('follower_count')
        .eq('id', userId)
        .single();

      if (targetUserError) throw targetUserError;

      // Determine message status based on follower counts
      const status = currentUserData.follower_count >= targetUserData.follower_count 
        ? 'accepted' 
        : 'pending';

      // Create the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: session.user.id,
          recipient_id: userId,
          content: `Hey ${username}! 👋`,
          status
        });

      if (messageError) throw messageError;

      toast.success(
        status === 'accepted' 
          ? "Message sent! Check your messages tab." 
          : "Message request sent!"
      );
      
      navigate('/messages');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsMessageSending(false);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{username}</h1>
        <div className="flex gap-2">
          {!isCurrentUser && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMessageClick}
                disabled={isMessageSending}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              <FollowButton userId={userId} />
            </>
          )}
          {isCurrentUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => !isEditing && onSaveChanges()}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {isEditing ? (
          <Textarea
            value={editBio}
            onChange={(e) => onEditBioChange(e.target.value)}
            placeholder="Write something about yourself..."
            className="min-h-[100px]"
          />
        ) : (
          <p className="text-muted-foreground">{bio || "No bio yet"}</p>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{followerCount} followers</span>
        <span>Joined {new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};