
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing webhook: Making features free for all users`)

    // Automatically grant premium features to all users
    const { data: allUsers, error: userError } = await supabase
      .from('profiles')
      .select('id')
      
    if (userError) {
      console.error('Error fetching users:', userError)
    } else if (allUsers && allUsers.length > 0) {
      // Get the Creator tier ID
      const { data: creatorTier } = await supabase
        .from('subscription_tiers')
        .select('id')
        .eq('name', 'Creator')
        .maybeSingle()
        
      if (creatorTier) {
        console.log(`Granting free premium access to ${allUsers.length} users`)
        
        // Process users in batches to avoid timeouts
        const batchSize = 50
        for (let i = 0; i < allUsers.length; i += batchSize) {
          const batch = allUsers.slice(i, i + batchSize)
          
          for (const user of batch) {
            // Grant premium subscription to each user
            const { error: subscriptionError } = await supabase
              .from('user_subscriptions')
              .upsert({
                user_id: user.id,
                tier_id: creatorTier.id,
                status: 'active',
                mentions_remaining: 999999, // Unlimited mentions
                mentions_used: 0,
                starts_at: new Date().toISOString(),
                ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
                is_lifetime: true
              })
              
            if (subscriptionError) {
              console.error('Error granting premium to user', user.id, ':', subscriptionError)
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ message: "All features now free for all users" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process webhook' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
