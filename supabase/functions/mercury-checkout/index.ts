
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MERCURY_API_KEY = Deno.env.get('MERCURY_API_KEY')
const MERCURY_API_URL = 'https://api.mercury.com/api/v1'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, amount, tier } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate user exists
    const { data: user, error: userError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    // Initialize Mercury payment
    const mercuryResponse = await fetch(`${MERCURY_API_URL}/payment-intents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCURY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        currency: 'USD',
        payment_method_types: ['ach_debit'],
        metadata: {
          user_id: userId,
          tier: tier
        }
      })
    })

    if (!mercuryResponse.ok) {
      throw new Error('Failed to create Mercury payment intent')
    }

    const mercuryData = await mercuryResponse.json()

    // Store Mercury transaction data
    const { error: transactionError } = await supabaseClient
      .from('mercury_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        status: 'pending',
        mercury_transaction_id: mercuryData.id,
        payment_type: 'subscription',
        metadata: {
          tier: tier,
          payment_intent: mercuryData.id
        }
      })

    if (transactionError) {
      console.error('Error storing transaction:', transactionError)
      throw new Error('Failed to store transaction data')
    }

    return new Response(
      JSON.stringify({
        paymentIntent: mercuryData,
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
