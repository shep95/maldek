import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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

    // Determine the price ID based on the tier
    let priceId;
    switch(tier.toLowerCase()) {
      case 'creator':
        priceId = 'price_1QXZOIApZ2oDcxDyFw0DXoh0';  // $17/month tier
        break;
      case 'business':
        priceId = 'price_1QVPPeApZ2oDcxDyezvlMWup'; // $800/month tier
        break;
      case 'true emperor':
        priceId = 'price_1QZ1VtApZ2oDcxDyuXGZXj95'; // $50,000/month tier
        break;
      default:
        throw new Error('Invalid subscription tier');
    }
    
    console.log('Using price ID:', priceId, 'for tier:', tier)

    // Get the tier ID from the subscription_tiers table
    const { data: tierData, error: tierError } = await supabaseClient
      .from('subscription_tiers')
      .select('id')
      .eq('name', tier === 'true emperor' ? 'True Emperor' : tier === 'creator' ? 'Creator' : 'Business')
      .single()

    if (tierError || !tierData) {
      console.error('Error fetching tier:', tierError)
      throw new Error('Subscription tier not found')
    }

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