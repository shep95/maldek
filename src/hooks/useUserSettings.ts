import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

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
        .single();

      if (error) {
        console.error('Error fetching user settings:', error);
        throw error;
      }

      return data;
    },
    enabled: !!session?.user?.id,
  });
};