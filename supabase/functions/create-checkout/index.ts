
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
console.log('Stripe key exists:', !!stripeKey);
// Don't log the actual key for security reasons

const stripe = new Stripe(stripeKey || '', {
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
    const { tier, userId } = await req.json()
    console.log('Creating checkout session for:', { tier, userId })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId)

    if (userError || !user?.email) {
      console.error('Error fetching user:', userError)
      throw new Error('User not found')
    }

    // Get the subscription tier ID first
    const { data: tierData, error: tierError } = await supabaseClient
      .from('subscription_tiers')
      .select('id, name, price')
      .eq('name', tier === 'true emperor lifetime' ? 'True Emperor Lifetime' : 
           tier === 'true emperor' ? 'True Emperor' : 
           tier === 'creator' ? 'Creator' : 
           tier === 'bosley' ? 'Bosley' : 'Business')
      .single()

    if (tierError || !tierData) {
      console.error('Error fetching tier:', tierError)
      throw new Error('Subscription tier not found')
    }

    console.log('Found tier:', tierData)

    // Use the provided price IDs based on the tier
    let priceId;
    let mode: 'subscription' | 'payment' = 'subscription';

    switch(tier.toLowerCase()) {
      case 'creator':
        priceId = 'price_1QqL77RIC2EosLwjbynMh9TU'; // $17/month
        break;
      case 'business':
        priceId = 'price_1QqL7NRIC2EosLwjd8FkAuzM'; // $800/month
        break;
      case 'true emperor':
        priceId = 'price_1QqL8IRIC2EosLwjBF1OtArf'; // $17,000/month
        break;
      case 'true emperor lifetime':
        priceId = 'price_1QsXsaRIC2EosLwjUQIZ9eiu'; // $80,000 one-time
        mode = 'payment';
        break;
      case 'bosley':
        priceId = 'price_1QsbJYRIC2EosLwjFLqmRXoX'; // $3.50/month
        break;
      default:
        throw new Error('Invalid subscription tier');
    }
    
    console.log('Using price ID:', priceId, 'for tier:', tier, 'with mode:', mode)

    try {
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: mode,
        success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/subscription`,
        metadata: {
          userId: userId,
          tierId: tierData.id,
          tier: tier,
          isLifetime: mode === 'payment' ? 'true' : 'false'
        },
        subscription_data: mode === 'subscription' ? {
          metadata: {
            tierId: tierData.id,
            tier: tier
          }
        } : undefined
      })

      console.log('Checkout session created:', session.id)

      return new Response(
        JSON.stringify({ url: session.url }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } catch (stripeError) {
      console.error('Stripe error:', {
        error: stripeError,
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code
      });
      throw stripeError;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
