
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Edit2, Crown } from "lucide-react";
import type { Author } from "@/utils/postUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PostHeaderProps {
  author: Author;
  timestamp: Date;
  onUsernameClick: (e: React.MouseEvent) => void;
  canEdit?: boolean;
  isEditing?: boolean;
  onEditClick?: () => void;
}

export const PostHeader = ({ 
  author, 
  timestamp, 
  onUsernameClick,
  canEdit,
  isEditing,
  onEditClick 
}: PostHeaderProps) => {
  // Fetch user's subscription status with proper joins
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', author.id],
    queryFn: async () => {
      console.log('Fetching subscription for user:', author.id);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_tiers (
            name,
            checkmark_color
          )
        `)
        .eq('user_id', author.id)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        console.error('Error fetching subscription:', error);
        return null;
      }

      console.log('Subscription data:', data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1, // Only retry once to avoid too many requests
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={author.avatar_url || undefined} />
          <AvatarFallback>{author.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1">
            <button
              onClick={onUsernameClick}
              className="font-semibold hover:underline"
            >
              @{author.username}
            </button>
            {subscription?.subscription_tiers && (
              <Crown 
                className="h-4 w-4" 
                style={{ 
                  color: subscription.subscription_tiers?.checkmark_color || '#FFD700'
                }} 
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
      {canEdit && !isEditing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEditClick?.();
          }}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
