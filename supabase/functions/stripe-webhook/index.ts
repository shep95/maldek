import Stripe from 'stripe';
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  {
    auth: {
      persistSession: false,
    },
  }
);

serve(async (req) => {
  if (req.method === 'POST') {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      );
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          
          // Get subscription details from metadata
          const tierName = session.metadata?.tier;
          const userId = session.metadata?.userId;

          if (!tierName || !userId) {
            throw new Error('Missing tier or user information');
          }

          // Get tier details from database
          const { data: tier, error: tierError } = await supabaseAdmin
            .from('subscription_tiers')
            .select('*')
            .eq('name', tierName)
            .single();

          if (tierError) throw tierError;

          // Create subscription record
          const { error: subsError } = await supabaseAdmin
            .from('user_subscriptions')
            .insert({
              user_id: userId,
              tier_id: tier.id,
              stripe_subscription_id: session.subscription,
              stripe_customer_id: session.customer,
              status: 'active',
              starts_at: new Date(),
              ends_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days
              is_lifetime: tierName === 'True Emperor'
            });

          if (subsError) throw subsError;

          // Send receipt email
          const { data: userData, error: userError } = await supabaseAdmin
            .auth.admin.getUserById(userId);

          if (userError) throw userError;

          await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-subscription-receipt`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              },
              body: JSON.stringify({
                customerEmail: userData.user.email,
                tierName: tier.name,
                price: tier.price,
                purchaseDate: new Date().toISOString(),
                orderId: session.id
              }),
            }
          );

          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const stripe_subscription_id = subscription.id;
          const status = subscription.status;

          const { error } = await supabaseAdmin
            .from('user_subscriptions')
            .update({ status })
            .eq('stripe_subscription_id', stripe_subscription_id);

          if (error) {
            console.error('Error updating subscription status:', error);
            throw error;
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const stripe_subscription_id = subscription.id;

          const { error } = await supabaseAdmin
            .from('user_subscriptions')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', stripe_subscription_id);

          if (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          const stripe_customer_id = invoice.customer;

          console.warn(`Invoice payment failed for customer: ${stripe_customer_id}`);
          break;
        }
        default:
          console.warn(`Unhandled event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error('Error processing webhook:', err);
      return new Response(
        JSON.stringify({ error: 'Webhook handler failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } else {
    return new Response('Method not allowed', { status: 405 });
  }
});
