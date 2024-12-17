import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

export const useProfileData = () => {
  const session = useSession();

  return useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log('No session user ID available');
        return null;
      }

      console.log('Fetching profile for user:', session.user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error loading profile');
        throw error;
      }

      console.log('Profile data:', profile);
      return profile;
    },
    enabled: !!session?.user?.id,
    retry: 3,
    retryDelay: 1000,
  });
};