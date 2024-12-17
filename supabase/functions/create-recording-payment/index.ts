import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.6.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { spaceId } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Get space details
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', spaceId)
      .single()

    if (spaceError || !space) {
      throw new Error('Space not found')
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Recording: ${space.title}`,
              description: 'Space recording access',
            },
            unit_amount: 200, // $2.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/spaces?success=true`,
      cancel_url: `${req.headers.get('origin')}/spaces?canceled=true`,
      metadata: {
        spaceId,
        userId: user.id,
      },
    })

    // Create purchase record
    const { error: purchaseError } = await supabase
      .from('space_recording_purchases')
      .insert({
        space_id: spaceId,
        user_id: user.id,
        amount: 2.00,
        stripe_session_id: session.id,
      })

    if (purchaseError) {
      throw purchaseError
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})