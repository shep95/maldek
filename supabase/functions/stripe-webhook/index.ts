
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Get the signature from the header
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No signature provided')
    }

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured')
    }
    
    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err.message)
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing webhook event: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('Checkout session completed:', session.id)
        
        // Get the subscription tier details from the metadata
        const userId = session.metadata?.userId
        const tierId = session.metadata?.tierId
        
        if (!userId || !tierId) {
          console.error('Missing user or tier information in metadata')
          break
        }
        
        // Get tier details to determine mention count
        const { data: tierData } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('id', tierId)
          .maybeSingle()
          
        if (!tierData) {
          console.error('Subscription tier not found:', tierId)
          break
        }
          
        // Create or update the user subscription
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            tier_id: tierId,
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            status: 'active',
            mentions_remaining: tierData.monthly_mentions,
            mentions_used: 0,
            starts_at: new Date().toISOString(),
            ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            is_lifetime: false
          })

        if (subscriptionError) {
          console.error('Error creating subscription:', subscriptionError)
          throw subscriptionError
        }

        // Record the payment in payment_history
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            user_id: userId,
            amount: session.amount_total / 100, // Convert from cents to dollars
            currency: session.currency,
            payment_date: new Date().toISOString(),
            stripe_payment_id: session.payment_intent,
            payment_method_type: session.payment_method_types?.[0],
            status: 'completed',
            metadata: {
              checkout_session_id: session.id,
              customer_email: session.customer_email,
            }
          })

        if (paymentError) {
          console.error('Error recording payment:', paymentError)
          throw paymentError
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        console.log('Invoice payment succeeded:', invoice.id)
        
        // If this is a subscription invoice, update the subscription
        if (invoice.subscription) {
          // Get the subscription to access its metadata
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
          const userId = subscription.metadata?.userId
          
          if (!userId) {
            console.error('No user ID found in subscription metadata')
            break
          }

          // Update the user's subscription end date
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
              status: 'active',
              ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // extend by 30 days
            })
            .eq('stripe_subscription_id', invoice.subscription)

          if (updateError) {
            console.error('Error updating subscription:', updateError)
            throw updateError
          }
          
          // Reset available mentions at the start of a new billing cycle
          const { data: tierData } = await supabase
            .from('subscription_tiers')
            .select('*')
            .eq('id', subscription.metadata?.tierId)
            .maybeSingle()
            
          if (tierData) {
            // Reset mentions for the new period
            const { error: mentionsError } = await supabase
              .from('user_subscriptions')
              .update({
                mentions_remaining: tierData.monthly_mentions,
                mentions_used: 0
              })
              .eq('stripe_subscription_id', invoice.subscription)
              
            if (mentionsError) {
              console.error('Error resetting mentions:', mentionsError)
            }
          }
        }

        // Record the payment in payment_history
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            user_id: invoice.customer,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            payment_date: new Date().toISOString(),
            stripe_payment_id: invoice.payment_intent,
            payment_method_type: invoice.payment_method_types?.[0],
            status: 'completed',
            metadata: {
              invoice_id: invoice.id,
              subscription_id: invoice.subscription,
            }
          })

        if (paymentError) {
          console.error('Error recording payment:', paymentError)
          throw paymentError
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const stripe_subscription_id = subscription.id
        const status = subscription.status

        const { error } = await supabase
          .from('user_subscriptions')
          .update({ status })
          .eq('stripe_subscription_id', stripe_subscription_id)

        if (error) {
          console.error('Error updating subscription status:', error)
          throw error
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const stripe_subscription_id = subscription.id

        const { error } = await supabase
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', stripe_subscription_id)

        if (error) {
          console.error('Error cancelling subscription:', error)
          throw error
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const stripe_customer_id = invoice.customer

        console.warn(`Invoice payment failed for customer: ${stripe_customer_id}`)
        
        // Update the subscription status
        if (invoice.subscription) {
          const { error } = await supabase
            .from('user_subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription)

          if (error) {
            console.error('Error updating subscription status:', error)
          }
        }
        
        break
      }

      default:
        console.warn(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
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
