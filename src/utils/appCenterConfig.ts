
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppVersion = Database['public']['Tables']['app_versions']['Row'];

export const initializeAppCenter = async () => {
  // No longer needed, but keeping the function for backward compatibility
  console.log('Version tracking initialized');
};

export const checkForUpdate = async (): Promise<AppVersion | null> => {
  try {
    const platform = /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' : 
                    /Android/.test(navigator.userAgent) ? 'android' : 'web';

    const { data, error } = await supabase
      .from('app_versions')
      .select('*')
      .eq('platform', platform)
      .eq('is_latest', true)
      .single();

    if (error) {
      console.error('Error checking for updates:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to check for update:', error);
    return null;
  }
};
