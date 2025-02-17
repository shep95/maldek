
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

interface UserSettings {
  user_id: string;
  preferred_language: string;
  theme?: 'light' | 'dark' | 'dim';
  created_at: string;
  updated_at: string;
}

export const useUserSettings = () => {
  const session = useSession();

  return useQuery({
    queryKey: ['user-settings', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user settings:', error);
        throw error;
      }

      return data as UserSettings;
    },
    enabled: !!session?.user?.id,
  });
};
