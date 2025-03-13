
import { useEffect } from 'react';
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CancelAllSubscriptions = () => {
  const session = useSession();
  const queryClient = useQueryClient();

  // This will completely delete all subscriptions and make all features free
  const grantFreeAccess = useMutation({
    mutationFn: async () => {
      console.log("Removing all subscriptions and making all features free");
      
      // First set all subscriptions to cancelled
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          ends_at: new Date().toISOString()
        });
      
      if (updateError) {
        console.error('Error updating subscriptions:', updateError);
        throw updateError;
      }
      
      // Make all features free by giving everyone premium
      const { data: creatorTier } = await supabase
        .from('subscription_tiers')
        .select('id')
        .eq('name', 'Creator')
        .maybeSingle();
        
      if (!creatorTier) {
        console.error('Could not find Creator tier');
        return;
      }
      
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id');
        
      if (allUsers && allUsers.length > 0) {
        console.log(`Making premium features free for ${allUsers.length} users`);
        
        // Process in batches
        const batchSize = 50;
        for (let i = 0; i < allUsers.length; i += batchSize) {
          const batch = allUsers.slice(i, i + batchSize);
          
          for (const user of batch) {
            await supabase
              .from('user_subscriptions')
              .upsert({
                user_id: user.id,
                tier_id: creatorTier.id,
                status: 'active',
                mentions_remaining: 999999,
                mentions_used: 0,
                starts_at: new Date().toISOString(),
                ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                is_lifetime: true
              });
          }
        }
      }
      
      return "All features now available for free to all users";
    },
    onSuccess: () => {
      console.log("Successfully granted free access to all users");
      // Invalidate ALL related queries to force UI refresh
      queryClient.invalidateQueries();
      
      // Force reload to ensure UI is completely refreshed
      window.location.reload();
    },
    onError: (error) => {
      console.error('Error handling subscriptions:', error);
      toast.error("Failed to process subscriptions");
    }
  });

  // Execute on component mount
  useEffect(() => {
    if (session?.user?.id) {
      grantFreeAccess.mutate();
    }
  }, [session?.user?.id]);

  // This is a hidden component, no need to render anything
  return null;
};
