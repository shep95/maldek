
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MERCURY_API_KEY = Deno.env.get('MERCURY_API_KEY')
const MERCURY_API_URL = 'https://api.mercury.com/v1'  // Updated API URL

async function getOrCreateProduct(tierData: any) {
  try {
    console.log('Attempting to create/get product for tier:', tierData.name);
    
    // Create the product directly (simplified approach)
    const createResponse = await fetch(`${MERCURY_API_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCURY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: tierData.name,
        price: Math.round(tierData.price * 100), // Convert to cents
        currency: 'USD',
        description: `${tierData.name} subscription tier`
      })
    });

    const responseText = await createResponse.text();
    console.log('Mercury API Response:', {
      status: createResponse.status,
      headers: Object.fromEntries(createResponse.headers.entries()),
      body: responseText
    });

    if (!createResponse.ok) {
      throw new Error(`Mercury API Error: ${responseText}`);
    }

    const product = JSON.parse(responseText);
    console.log('Successfully created product:', product);
    return product.id;
  } catch (error) {
    console.error('Detailed error creating Mercury product:', {
      error: error.message,
      stack: error.stack,
      tierData
    });
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, tier, paymentDetails } = await req.json();
    console.log('Processing payment request:', { userId, tier });

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
      console.error('Tier fetch error:', tierError);
      throw new Error('Subscription tier not found');
    }

    console.log('Found tier data:', tierData);

    // Create or get product
    const productId = await getOrCreateProduct(tierData);
    console.log('Product ID obtained:', productId);

    // Create payment session
    const checkoutResponse = await fetch(`${MERCURY_API_URL}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCURY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: productId,
        payment_method: {
          type: 'card',
          card: {
            number: paymentDetails.cardNumber,
            exp_month: parseInt(paymentDetails.expiry.split('/')[0]),
            exp_year: parseInt('20' + paymentDetails.expiry.split('/')[1]),
            cvc: paymentDetails.cvc,
            holder_name: paymentDetails.name
          }
        },
        metadata: {
          user_id: userId,
          tier: tier
        }
      })
    });

    const checkoutResponseText = await checkoutResponse.text();
    console.log('Checkout Response:', {
      status: checkoutResponse.status,
      body: checkoutResponseText
    });

    if (!checkoutResponse.ok) {
      throw new Error(`Checkout Error: ${checkoutResponseText}`);
    }

    const checkoutData = JSON.parse(checkoutResponseText);

    // Store transaction
    const { error: transactionError } = await supabaseClient
      .from('mercury_transactions')
      .insert({
        user_id: userId,
        amount: tierData.price,
        status: 'pending',
        mercury_transaction_id: checkoutData.id,
        payment_type: 'subscription',
        metadata: {
          tier: tier,
          tier_id: tierData.id
        }
      });

    if (transactionError) {
      console.error('Transaction storage error:', transactionError);
      throw new Error('Failed to store transaction data');
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: checkoutData.id
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Checkout process error:', error);
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
