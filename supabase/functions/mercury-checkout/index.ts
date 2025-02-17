
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MERCURY_API_KEY = Deno.env.get('MERCURY_API_KEY')
const MERCURY_API_URL = 'https://api.mercury.com'

// Cache for product IDs
let productCache: Record<string, string> = {};

async function getOrCreateProduct(tierData: any) {
  // Check cache first
  if (productCache[tierData.name]) {
    return productCache[tierData.name];
  }

  try {
    // First, try to fetch existing products
    const productsResponse = await fetch(`${MERCURY_API_URL}/api/v1/products`, {
      headers: {
        'Authorization': `Bearer ${MERCURY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (productsResponse.ok) {
      const products = await productsResponse.json();
      const existingProduct = products.find((p: any) => p.name === tierData.name);
      
      if (existingProduct) {
        productCache[tierData.name] = existingProduct.id;
        return existingProduct.id;
      }
    }

    // If product doesn't exist, create it
    const createResponse = await fetch(`${MERCURY_API_URL}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCURY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: tierData.name,
        description: `${tierData.name} subscription tier`,
        default_price_data: {
          currency: 'USD',
          unit_amount: Math.round(tierData.price * 100)
        }
      })
    });

    if (!createResponse.ok) {
      throw new Error('Failed to create product in Mercury');
    }

    const newProduct = await createResponse.json();
    productCache[tierData.name] = newProduct.id;
    return newProduct.id;
  } catch (error) {
    console.error('Error managing Mercury product:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, tier, paymentDetails } = await req.json();
    console.log('Creating payment for:', { userId, tier });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get subscription tier details
    const { data: tierData, error: tierError } = await supabaseClient
      .from('subscription_tiers')
      .select('*')
      .eq('name', tier)
      .single();

    if (tierError || !tierData) {
      console.error('Tier error:', tierError);
      throw new Error('Subscription tier not found');
    }

    console.log('Found tier:', tierData);

    // Get or create the Mercury product
    const productId = await getOrCreateProduct(tierData);
    console.log('Using Mercury product ID:', productId);

    // Generate unique idempotency key
    const idempotencyKey = crypto.randomUUID();

    // Create Mercury payment with product ID
    const mercuryResponse = await fetch(`${MERCURY_API_URL}/api/v1/checkout-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCURY_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        product: productId,
        payment_method_types: ['card'],
        card: {
          number: paymentDetails.cardNumber,
          exp_month: parseInt(paymentDetails.expiry.split('/')[0]),
          exp_year: parseInt('20' + paymentDetails.expiry.split('/')[1]),
          cvc: paymentDetails.cvc,
          name: paymentDetails.name
        },
        metadata: {
          user_id: userId,
          tier: tier,
          tier_id: tierData.id
        }
      })
    });

    if (!mercuryResponse.ok) {
      const errorText = await mercuryResponse.text();
      console.error('Mercury API error:', errorText);
      throw new Error('Failed to create Mercury payment session');
    }

    const mercuryData = await mercuryResponse.json();
    console.log('Mercury session created:', mercuryData);

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
      });

    if (transactionError) {
      console.error('Error storing transaction:', transactionError);
      throw new Error('Failed to store transaction data');
    }

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: mercuryData.id
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Mercury checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
