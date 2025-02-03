import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users } from "lucide-react";

interface CommunityCardProps {
  community: any; // We'll properly type this once types are generated
}

export const CommunityCard = ({ community }: CommunityCardProps) => {
  const { data: isMember, refetch } = useQuery({
    queryKey: ['community-membership', community.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('community_members')
        .select()
        .eq('community_id', community.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking membership:', error);
        return false;
      }

      return !!data;
    }
  });

  const handleJoinLeave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to join communities');
        return;
      }

      if (isMember) {
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('community_id', community.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Left community');
      } else {
        const { error } = await supabase
          .from('community_members')
          .insert({
            community_id: community.id,
            user_id: user.id
          });

        if (error) throw error;
        toast.success('Joined community');
      }

      refetch();
    } catch (error) {
      console.error('Error joining/leaving community:', error);
      toast.error('Failed to join/leave community');
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        {community.banner_url ? (
          <img
            src={community.banner_url}
            alt={community.name}
            className="w-full h-24 object-cover"
          />
        ) : (
          <div className="w-full h-24 bg-gradient-to-r from-orange-500 to-orange-600" />
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 border-2 border-background -mt-8">
            <AvatarImage src={community.avatar_url} />
            <AvatarFallback>
              <Users className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{community.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {community.description || "No description"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {community.members?.[0]?.count || 0} members
            </p>
          </div>
        </div>
        <Button
          className="w-full mt-4"
          variant={isMember ? "outline" : "default"}
          onClick={handleJoinLeave}
        >
          {isMember ? "Leave" : "Join"}
        </Button>
      </CardContent>
    </Card>
  );
};