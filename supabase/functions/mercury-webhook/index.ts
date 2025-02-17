
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const WEBHOOK_SECRET = Deno.env.get('MERCURY_WEBHOOK_SECRET')
    const signature = req.headers.get('Mercury-Signature')

    if (!signature || !WEBHOOK_SECRET) {
      throw new Error('Missing signature or webhook secret')
    }

    const body = await req.json()
    console.log('Received webhook:', body)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const paymentIntent = body.data
    const { metadata } = paymentIntent

    if (!metadata?.user_id || !metadata?.tier_id) {
      throw new Error('Missing required metadata')
    }

    // Update transaction status
    await supabaseClient
      .from('mercury_transactions')
      .update({ status: paymentIntent.status })
      .eq('mercury_transaction_id', paymentIntent.id)

    if (paymentIntent.status === 'succeeded') {
      // Get subscription tier details
      const { data: tierData } = await supabaseClient
        .from('subscription_tiers')
        .select('*')
        .eq('id', metadata.tier_id)
        .single()

      if (!tierData) {
        throw new Error('Subscription tier not found')
      }

      // Create or update subscription
      const subscriptionData = {
        user_id: metadata.user_id,
        tier_id: metadata.tier_id,
        status: 'active',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        mentions_remaining: tierData.monthly_mentions || 0,
        mentions_used: 0,
        is_lifetime: false
      }

      const { error: subscriptionError } = await supabaseClient
        .from('user_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })

      if (subscriptionError) {
        console.error('Error updating subscription:', subscriptionError)
        throw subscriptionError
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
