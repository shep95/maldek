
import { useQuery, useQueryClient, QueryKey } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CacheConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number | false;
  refetchOnWindowFocus?: boolean;
}

export const useCachedQuery = <T>(
  key: QueryKey,
  queryFn: () => Promise<T>,
  config?: CacheConfig
) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: key,
    queryFn,
    staleTime: config?.staleTime || 1000 * 60, // Default 1 minute
    gcTime: config?.cacheTime || 1000 * 60 * 5, // Default 5 minutes
    refetchInterval: config?.refetchInterval || false,
    refetchOnWindowFocus: config?.refetchOnWindowFocus || false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Utility function to prefetch and cache data
export const prefetchQuery = async (
  key: QueryKey,
  queryFn: () => Promise<any>,
  queryClient: any,
  config?: CacheConfig
) => {
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn,
    staleTime: config?.staleTime || 1000 * 60,
    gcTime: config?.cacheTime || 1000 * 60 * 5,
  });
};
