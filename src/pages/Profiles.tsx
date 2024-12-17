import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profiles = () => {
  const navigate = useNavigate();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      console.log('Fetching profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching profiles:', error);
        toast.error('Failed to load profiles');
        throw error;
      }

      console.log('Profiles fetched:', data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Profiles</h1>
      <div className="grid gap-4">
        {profiles?.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">@{profile.username}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {profile.bio || 'No bio yet'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/@${profile.username}`)}
              className="ml-4"
            >
              View Profile
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profiles;