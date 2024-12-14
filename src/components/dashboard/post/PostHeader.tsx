import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Author } from "@/utils/postUtils";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PostHeaderProps {
  author: Author;
  timestamp: Date;
}

export const PostHeader = ({ author, timestamp }: PostHeaderProps) => {
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', author.id],
    queryFn: async () => {
      console.log('Fetching subscription for user:', author.id);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .eq('user_id', author.id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      console.log('Subscription data:', data);
      return data;
    },
  });

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}M`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo`;
    return `${Math.floor(diffInDays / 365)}y`;
  };

  const timeAgo = getTimeAgo(new Date(timestamp));

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={author.avatar_url || ''} alt={author.name} />
        <AvatarFallback>{author.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold">{author.name}</h3>
            {subscription?.tier?.name === 'Creator' && (
              <div className="group relative">
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.6)] border-2 border-orange-500">
                  <Check className="h-4 w-4 text-orange-500 stroke-[3]" />
                </div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/90 backdrop-blur-sm text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-border">
                  Creator
                </div>
              </div>
            )}
            {subscription?.tier?.name === 'Business' && (
              <div className="group relative">
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.6)] border-2 border-yellow-500">
                  <Check className="h-4 w-4 text-yellow-500 stroke-[3]" />
                </div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/90 backdrop-blur-sm text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-border">
                  Business
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{author.username}</p>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">{timeAgo}</span>
    </div>
  );
};