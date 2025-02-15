
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

    // First, get the tier name based on the input
    const tierName = tier === 'true emperor lifetime' ? 'True Emperor Lifetime' : 
                    tier === 'true emperor' ? 'True Emperor' : 
                    tier === 'creator' ? 'Creator' : 
                    tier === 'bosley' ? 'Bosley' : 'Business';

    // Get the subscription tier details
    const { data: tierData, error: tierError } = await supabaseClient
      .from('subscription_tiers')
      .select('*')
      .eq('name', tierName)
      .single()

    if (tierError || !tierData) {
      console.error('Error fetching tier:', tierError)
      throw new Error(`Subscription tier not found: ${tierName}`)
    }

    console.log('Found tier:', tierData)

    // Determine price ID and mode
    let priceId;
    let mode: 'subscription' | 'payment' = 'subscription';

    switch(tier.toLowerCase()) {
      case 'creator':
        priceId = 'price_1QsbJYRIC2EosLwjFLqmRXoX'; // Updated to $3.50/month
        break;
      case 'business':
        priceId = 'price_1QqL7NRIC2EosLwjd8FkAuzM';
        break;
      case 'true emperor':
        priceId = 'price_1QqL8IRIC2EosLwjBF1OtArf';
        break;
      case 'true emperor lifetime':
        priceId = 'price_1QsXsaRIC2EosLwjUQIZ9eiu';
        mode = 'payment';
        break;
      case 'bosley':
        priceId = 'price_1QsbJYRIC2EosLwjFLqmRXoX';
        break;
      default:
        throw new Error('Invalid subscription tier');
    }
    
    console.log('Creating checkout with:', {
      priceId,
      mode,
      tierId: tierData.id,
      tierName: tierData.name,
      monthlyMentions: tierData.monthly_mentions
    })

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
        tier: tierData.name,
        isLifetime: mode === 'payment' ? 'true' : 'false',
        monthlyMentions: tierData.monthly_mentions.toString()
      },
      subscription_data: mode === 'subscription' ? {
        metadata: {
          tierId: tierData.id,
          tier: tierData.name,
          monthlyMentions: tierData.monthly_mentions.toString()
        }
      } : undefined
    })

    console.log('Checkout session created:', {
      sessionId: session.id,
      metadata: session.metadata
    })

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
