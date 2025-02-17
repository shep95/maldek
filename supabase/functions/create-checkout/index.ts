
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import Stripe from 'https://esm.sh/stripe@13.11.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

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
      console.error('Tier error:', tierError);
      throw new Error('Subscription tier not found');
    }

    console.log('Found tier:', tierData);

    // Create a Customer
    const customer = await stripe.customers.create({
      email: paymentDetails.email,
      source: {
        object: 'card',
        number: paymentDetails.cardNumber,
        exp_month: parseInt(paymentDetails.expiry.split('/')[0]),
        exp_year: parseInt('20' + paymentDetails.expiry.split('/')[1]),
        cvc: paymentDetails.cvc,
        name: paymentDetails.name
      },
      metadata: {
        user_id: userId
      }
    });

    console.log('Created Stripe customer:', customer.id);

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: tierData.name,
            metadata: {
              tier_id: tierData.id
            }
          },
          unit_amount: Math.round(tierData.price * 100),
          recurring: {
            interval: 'month'
          }
        }
      }],
      metadata: {
        user_id: userId,
        tier: tier,
        tier_id: tierData.id
      }
    });

    console.log('Created Stripe subscription:', subscription.id);

    // Store subscription data
    const { error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        tier_id: tierData.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000),
        cancel_at_period_end: subscription.cancel_at_period_end,
        mentions_remaining: tierData.monthly_mentions,
        mentions_used: 0,
        ends_at: new Date(subscription.current_period_end * 1000)
      });

    if (subscriptionError) {
      console.error('Error storing subscription:', subscriptionError);
      throw new Error('Failed to store subscription data');
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: subscription.id
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Stripe checkout error:', error);
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
