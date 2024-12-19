import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Price IDs for subscription tiers
const CREATOR_PRICE_ID = 'price_1QVPOZApZ2oDcxDyNrRMc7rZ'  // $17/month tier
const BUSINESS_PRICE_ID = 'price_1QVPPeApZ2oDcxDyezvlMWup' // $800/month tier

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { tier, userId } = await req.json()
    console.log('Creating checkout session for:', { tier, userId })

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's email
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId)

    if (userError || !user?.email) {
      console.error('Error fetching user:', userError)
      throw new Error('User not found')
    }

    // Determine the price ID based on the tier
    const priceId = tier === 'creator' ? CREATOR_PRICE_ID : BUSINESS_PRICE_ID
    console.log('Using price ID:', priceId, 'for tier:', tier)

    // Get the tier ID from the subscription_tiers table
    const { data: tierData, error: tierError } = await supabaseClient
      .from('subscription_tiers')
      .select('id')
      .eq('name', tier === 'creator' ? 'Creator' : 'Business')
      .single()

    if (tierError || !tierData) {
      console.error('Error fetching tier:', tierError)
      throw new Error('Subscription tier not found')
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
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
        tier: tier,
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