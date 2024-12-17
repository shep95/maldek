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
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, created_at')
        .eq('id', session.user.id)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          // Attempt to create profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: session.user.id,
                username: session.user.email?.split('@')[0] || 'user_' + Math.random().toString(36).slice(2, 7),
                created_at: new Date().toISOString(),
                follower_count: 0,
                bio: ''
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            toast.error('Error creating profile');
            return null;
          }

          console.log('New profile created:', newProfile);
          return newProfile;
        }
        console.error('Error checking profile:', checkError);
        return null;
      }

      console.log('Profile exists:', existingProfile);
      return existingProfile;
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