
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
    if (!signature) {
      console.error('No Stripe signature in request headers')
      throw new Error('No Stripe signature found')
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      throw new Error('Webhook secret is not configured')
    }

    const body = await req.text()
    console.log('Raw webhook body:', body) // Log raw webhook data for debugging

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    console.log('Received webhook event:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString(),
      data: event.data.object
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Log detailed session information
        console.log('Processing checkout session:', {
          id: session.id,
          customerId: session.customer,
          paymentStatus: session.payment_status,
          status: session.status,
          mode: session.mode,
          metadata: session.metadata,
          subscription: session.subscription
        })

        // Validate required metadata
        if (!session.metadata?.userId || !session.metadata?.tierId) {
          console.error('Missing required metadata:', session.metadata)
          throw new Error(`Missing required metadata. Found: ${JSON.stringify(session.metadata)}`)
        }

        // For subscription mode, fetch the subscription details
        let subscription = null
        if (session.mode === 'subscription' && session.subscription) {
          subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          console.log('Subscription details:', {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            metadata: subscription.metadata
          })
        }

        // Get the tier details from the database
        const { data: tier, error: tierError } = await supabaseClient
          .from('subscription_tiers')
          .select('*')
          .eq('id', session.metadata.tierId)
          .single()

        if (tierError || !tier) {
          console.error('Failed to fetch tier:', {
            error: tierError,
            tierId: session.metadata.tierId
          })
          throw new Error('Invalid tier ID')
        }

        // Create or update the user subscription
        const subscriptionData = {
          user_id: session.metadata.userId,
          tier_id: session.metadata.tierId,
          stripe_subscription_id: subscription?.id,
          stripe_customer_id: session.customer as string,
          status: subscription ? subscription.status : 'active',
          starts_at: new Date().toISOString(),
          ends_at: subscription 
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 100 years for lifetime
          mentions_remaining: parseInt(session.metadata.monthlyMentions || tier.monthly_mentions.toString()),
          is_lifetime: tier.is_lifetime
        }

        const { error: upsertError } = await supabaseClient
          .from('user_subscriptions')
          .upsert(subscriptionData)

        if (upsertError) {
          console.error('Failed to create subscription:', {
            error: upsertError,
            data: subscriptionData
          })
          throw upsertError
        }

        console.log('Successfully created subscription:', {
          userId: session.metadata.userId,
          tierId: session.metadata.tierId,
          subscriptionId: subscription?.id,
          isLifetime: tier.is_lifetime
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Updating subscription:', {
          id: subscription.id,
          status: subscription.status,
          metadata: subscription.metadata
        })

        if (!subscription.metadata?.tierId) {
          console.error('Missing tierId in metadata:', subscription)
          throw new Error('Missing tierId in subscription metadata')
        }

        // Get the tier details for monthly mentions
        const { data: tier, error: tierError } = await supabaseClient
          .from('subscription_tiers')
          .select('*')
          .eq('id', subscription.metadata.tierId)
          .single()

        if (tierError || !tier) {
          console.error('Failed to fetch tier:', {
            error: tierError,
            tierId: subscription.metadata.tierId
          })
          throw new Error('Invalid tier ID')
        }

        const { error } = await supabaseClient
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            mentions_remaining: tier.monthly_mentions
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Failed to update subscription:', {
            error,
            subscriptionId: subscription.id
          })
          throw error
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Cancelling subscription:', {
          id: subscription.id,
          status: subscription.status,
          metadata: subscription.metadata
        })

        const { error } = await supabaseClient
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            ends_at: new Date().toISOString(),
            mentions_remaining: 0
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Failed to cancel subscription:', {
            error,
            subscriptionId: subscription.id
          })
          throw error
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Webhook processing failed:', {
      error: error.message,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
