import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SidebarProfile = () => {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      return profile;
    },
  });

  return (
    <Avatar className="h-8 w-8 ring-2 ring-accent/50 ring-offset-2 ring-offset-background">
      <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
      <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};