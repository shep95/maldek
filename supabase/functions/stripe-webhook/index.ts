import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@12.3.0?target=deno'

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
      // This is an official recommended way to use Stripe with Deno
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
    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret!
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

        // Record the payment in payment_history
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            user_id: session.client_reference_id,
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

        // Update user subscription
        if (session.mode === 'subscription') {
          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .update({
              stripe_subscription_id: session.subscription,
              stripe_customer_id: session.customer,
              status: 'active',
            })
            .eq('user_id', session.client_reference_id)

          if (subscriptionError) {
            console.error('Error updating subscription:', subscriptionError)
            throw subscriptionError
          }
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        console.log('Invoice payment succeeded:', invoice.id)

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
