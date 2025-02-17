
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
    const webhookSecret = Deno.env.get('MERCURY_WEBHOOK_SECRET')
    const signature = req.headers.get('Mercury-Signature')

    if (!signature) {
      throw new Error('No signature found')
    }

    const body = await req.json()
    console.log('Received Mercury webhook:', body.type)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle different webhook events
    switch (body.type) {
      case 'payment_intent.succeeded':
        await handleSuccessfulPayment(body.data, supabaseClient)
        break
      case 'payment_intent.failed':
        await handleFailedPayment(body.data, supabaseClient)
        break
      default:
        console.log('Unhandled webhook type:', body.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

async function handleSuccessfulPayment(data: any, supabaseClient: any) {
  const { metadata } = data
  if (!metadata?.user_id || !metadata?.tier) {
    throw new Error('Missing required metadata')
  }

  // Update transaction status
  await supabaseClient
    .from('mercury_transactions')
    .update({ status: 'completed' })
    .eq('mercury_transaction_id', data.id)

  // Get subscription tier details
  const { data: tierData } = await supabaseClient
    .from('subscription_tiers')
    .select('*')
    .eq('name', metadata.tier)
    .single()

  if (!tierData) {
    throw new Error('Subscription tier not found')
  }

  // Create or update subscription
  const subscriptionData = {
    user_id: metadata.user_id,
    tier_id: tierData.id,
    status: 'active',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    mentions_remaining: tierData.monthly_mentions
  }

  await supabaseClient
    .from('user_subscriptions')
    .upsert(subscriptionData)
}

async function handleFailedPayment(data: any, supabaseClient: any) {
  await supabaseClient
    .from('mercury_transactions')
    .update({ 
      status: 'failed',
      metadata: { ...data.metadata, error: data.last_payment_error }
    })
    .eq('mercury_transaction_id', data.id)
}
