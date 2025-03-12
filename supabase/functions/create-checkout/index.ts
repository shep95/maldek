
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
console.log('Stripe key exists:', !!stripeKey);

const stripe = new Stripe(stripeKey || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define pricing plans
const PRICE_IDS = {
  creator: 'price_1QsbJYRIC2EosLwjFLqmRXoX', // $3.50/month
  "true emperor": 'price_1Qy0WORIC2EosLwjPd58zKZQ', // $8,000/year
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

    // Get user email
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId)

    if (userError || !user?.email) {
      console.error('Error fetching user:', userError)
      throw new Error('User not found')
    }

    // Get subscription tier details
    const { data: tierData, error: tierError } = await supabaseClient
      .from('subscription_tiers')
      .select('*')
      .eq('name', tier)
      .maybeSingle()

    if (tierError || !tierData) {
      console.error('Error fetching tier data:', tierError)
      throw new Error(`Subscription tier "${tier}" not found`)
    }

    // Get the correct price ID based on the tier
    const normalizedTier = tier.toLowerCase()
    const priceId = PRICE_IDS[normalizedTier]
    
    if (!priceId) {
      throw new Error(`No price ID configured for tier "${tier}"`)
    }

    console.log(`Using price ID ${priceId} for tier ${tier}`)

    // Create checkout session with the specific price ID
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/subscription`,
      metadata: {
        userId: userId,
        tierId: tierData.id,
        tierName: tierData.name
      },
    })

    console.log('Checkout session created:', session.id)

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
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
