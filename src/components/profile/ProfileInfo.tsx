import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Edit2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { FollowButton } from "./FollowButton";
import { MessageDialog } from "./MessageDialog";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";

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
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    },
  });

  const renderBioContent = (text: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    
    return text.split(' ').map((word, index) => {
      if (urlPattern.test(word)) {
        return (
          <span key={index}>
            <a
              href={word}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {word}
            </a>
            {' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{username}</h1>
          {subscription?.tier?.name === 'Creator' && (
            <div className="group relative">
              <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                <Check className="h-4 w-4 text-orange-500" />
              </div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/90 backdrop-blur-sm text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-border">
                Creator
              </div>
            </div>
          )}
          {subscription?.tier?.name === 'Business' && (
            <div className="group relative">
              <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                <Check className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/90 backdrop-blur-sm text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-border">
                Business
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!isCurrentUser && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMessageDialogOpen(true)}
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
              onClick={() => isEditing ? onSaveChanges() : onSaveChanges()}
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
            placeholder="Write something about yourself... (URLs will be clickable)"
            className="min-h-[100px]"
          />
        ) : (
          <p className="text-muted-foreground whitespace-pre-wrap">
            {bio ? renderBioContent(bio) : "No bio yet"}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{followerCount} followers</span>
        <span>Joined {new Date(createdAt).toLocaleDateString()}</span>
      </div>

      <MessageDialog
        isOpen={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        recipientId={userId}
        recipientName={username}
        recipientFollowerCount={followerCount}
      />
    </div>
  );
};
