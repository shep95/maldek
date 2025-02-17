
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MERCURY_API_KEY = Deno.env.get('MERCURY_API_KEY')
const MERCURY_API_URL = 'https://backend.mercury.com/api/v1'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, tier } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get subscription tier details
    const { data: tierData, error: tierError } = await supabaseClient
      .from('subscription_tiers')
      .select('*')
      .eq('name', tier)
      .single()

    if (tierError || !tierData) {
      throw new Error('Subscription tier not found')
    }

    // Generate unique idempotency key
    const idempotencyKey = crypto.randomUUID()

    // Initialize Mercury payment
    const mercuryResponse = await fetch(`${MERCURY_API_URL}/payment-intents`, {
      method: 'POST',
      headers: {
        'Authorization': MERCURY_API_KEY,
        'Content-Type': 'application/json',
        'Mercury-API-Version': '2023-09-15',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        amount: Math.round(tierData.price * 100), // Convert to cents
        currency: 'USD',
        payment_method_types: ['ach_debit'],
        metadata: {
          user_id: userId,
          tier: tier,
          tier_id: tierData.id
        }
      })
    })

    if (!mercuryResponse.ok) {
      console.error('Mercury API error:', await mercuryResponse.text())
      throw new Error('Failed to create Mercury payment intent')
    }

    const mercuryData = await mercuryResponse.json()

    // Store Mercury transaction data
    const { error: transactionError } = await supabaseClient
      .from('mercury_transactions')
      .insert({
        user_id: userId,
        amount: tierData.price,
        status: 'pending',
        mercury_transaction_id: mercuryData.id,
        payment_type: 'subscription',
        metadata: {
          tier: tier,
          tier_id: tierData.id,
          payment_intent: mercuryData.id
        }
      })

    if (transactionError) {
      console.error('Error storing transaction:', transactionError)
      throw new Error('Failed to store transaction data')
    }

    return new Response(
      JSON.stringify({
        url: mercuryData.hosted_url,
        clientSecret: mercuryData.client_secret
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Mercury checkout error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
