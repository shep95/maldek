import { useSession } from '@supabase/auth-helpers-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfileData = () => {
  const session = useSession();

  // First, ensure profile exists
  const { data: profileExists, isLoading: isCheckingProfile } = useQuery({
    queryKey: ['profile-exists', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log('No session user ID found');
        return null;
      }

      console.log('Checking if profile exists for user:', session.user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, created_at')
        .eq('id', session.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Profile not found, might still be creating...');
          return null;
        }
        console.error('Error checking profile:', error);
        return null;
      }

      console.log('Profile exists check result:', data);
      return data;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000),
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  // Then fetch full profile data
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', session?.user?.id, profileExists?.created_at],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log('No session user ID found');
        return null;
      }

      console.log('Fetching full profile for user:', session.user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error loading profile');
        return null;
      }

      console.log('Full profile fetched:', data);
      return data;
    },
    enabled: !!session?.user?.id && !!profileExists,
    retry: 2,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  return {
    profile,
    isLoading: isCheckingProfile || isLoadingProfile,
    error: !profile && !isLoadingProfile && !!profileExists
  };
};