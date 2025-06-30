
import { useSession } from '@supabase/auth-helpers-react';

export const useAuth = () => {
  const session = useSession();
  
  return {
    user: session?.user || null,
    loading: false, // useSession handles loading internally
    session
  };
};
