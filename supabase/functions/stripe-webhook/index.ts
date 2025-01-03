import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) throw new Error('No Stripe signature found')

    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    console.log('Processing Stripe webhook event:', event.type)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        
        console.log('Checkout session completed:', session)
        
        // Update user_subscriptions table
        const { error } = await supabaseClient
          .from('user_subscriptions')
          .upsert({
            user_id: session.metadata?.userId,
            tier_id: session.metadata?.tierId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: session.customer as string,
            status: subscription.status,
            starts_at: new Date(subscription.current_period_start * 1000).toISOString(),
            ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            mentions_remaining: subscription.items.data[0].price.metadata.monthly_mentions || 0
          })

        if (error) throw error
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('Subscription updated:', subscription)
        
        const { error } = await supabaseClient
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) throw error
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('Subscription cancelled:', subscription)
        
        const { error } = await supabaseClient
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            ends_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) throw error
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})