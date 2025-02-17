import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CurrentSubscription } from "@/components/subscription/CurrentSubscription";
import { SubscriptionTierCard } from "@/components/subscription/SubscriptionTierCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Subscription = () => {
  const session = useSession();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [validPromoCode, setValidPromoCode] = useState<{
    code: string;
    discount_percentage: number;
  } | null>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const { data: subscription, refetch: refetchSubscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      try {
        console.log("Fetching user subscription data...");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found");
          return null;
        }

        const { data: subscription, error } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            tier:subscription_tiers(*)
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching subscription:", error);
          return null;
        }

        console.log("Subscription data:", subscription);
        return subscription;
      } catch (error) {
        console.error("Error in subscription query:", error);
        return null;
      }
    },
    enabled: !!session?.user?.id
  });

  const { data: tiers } = useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .neq('name', 'True Emperor Lifetime')
        .order('price', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: transactions } = useQuery({
    queryKey: ['subscription-transactions', subscription?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mercury_transactions')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const selectedTierData = tiers?.find(t => t.id === selectedTier);
  const originalPrice = selectedTierData?.price || 0;
  const discountAmount = validPromoCode ? (originalPrice * validPromoCode.discount_percentage / 100) : 0;
  const finalPrice = originalPrice - discountAmount;

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier || !session?.user?.id) return;

    setIsProcessing(true);
    toast.loading("Processing payment...", { id: "payment-toast" });

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          tier: selectedTier,
          userId: session.user.id,
          promoCode: validPromoCode?.code,
          paymentDetails: {
            cardNumber: cardDetails.number.replace(/\s/g, ''),
            expiry: cardDetails.expiry,
            cvc: cardDetails.cvc,
            name: cardDetails.name,
            email: session.user.email
          }
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      toast.dismiss("payment-toast");
      toast.success("Payment successful!");
      setShowPaymentDialog(false);
      refetchSubscription();
    } catch (error) {
      console.error('Payment error:', error);
      toast.dismiss("payment-toast");
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (!session?.user?.id) {
      toast.error("Please sign in to subscribe");
      return;
    }

    setSelectedTier(tier);
    setShowPaymentDialog(true);
  };

  const handleManageSubscription = async () => {
    try {
      if (!session?.user?.id || !subscription?.stripe_customer_id) {
        toast.error("No active subscription found");
        return;
      }

      toast.loading("Loading subscription portal...");

      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          customerId: subscription.stripe_customer_id,
        },
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error("No portal URL returned");
      }

      console.log("Redirecting to portal:", data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error("Failed to open subscription management");
    }
  };

  const handleCheckPromoCode = async () => {
    if (!promoCode) return;

    setIsCheckingPromo(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('code, discount_percentage, is_active, expires_at, max_uses, current_uses')
        .eq('code', promoCode.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (!data || !data.is_active) {
        toast.error("Invalid or inactive promo code");
        setValidPromoCode(null);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error("This promo code has expired");
        setValidPromoCode(null);
        return;
      }

      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error("This promo code has reached its usage limit");
        setValidPromoCode(null);
        return;
      }

      setValidPromoCode({
        code: data.code,
        discount_percentage: data.discount_percentage
      });
      toast.success(`Promo code applied! ${data.discount_percentage}% discount`);
    } catch (error) {
      console.error('Error checking promo code:', error);
      toast.error("Failed to validate promo code");
      setValidPromoCode(null);
    } finally {
      setIsCheckingPromo(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Premium Subscriptions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock premium features and enhance your experience with our subscription tiers
          </p>
        </div>

        {subscription && (
          <div className="mb-16">
            <CurrentSubscription 
              subscription={subscription}
              onManageSubscription={handleManageSubscription}
            />
          </div>
        )}

        {transactions && transactions.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="bg-card p-4 rounded-lg shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">${transaction.amount} - {transaction.payment_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {transaction.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-8 max-w-2xl mx-auto">
          {tiers?.map((tier) => (
            <SubscriptionTierCard
              key={tier.id}
              tier={tier}
              currentTierId={subscription?.tier_id}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>

        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Enter Payment Details</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitPayment} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => {
                    const formatted = e.target.value
                      .replace(/\s/g, '')
                      .replace(/(\d{4})/g, '$1 ')
                      .trim();
                    setCardDetails({ ...cardDetails, number: formatted });
                  }}
                  maxLength={19}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => {
                      const formatted = e.target.value
                        .replace(/\D/g, '')
                        .replace(/(\d{2})(\d)/, '$1/$2');
                      setCardDetails({ ...cardDetails, expiry: formatted });
                    }}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={cardDetails.cvc}
                    onChange={(e) => {
                      const formatted = e.target.value.replace(/\D/g, '');
                      setCardDetails({ ...cardDetails, cvc: formatted });
                    }}
                    maxLength={3}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoCode">Promo Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="promoCode"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleCheckPromoCode}
                    disabled={isCheckingPromo || !promoCode}
                  >
                    {isCheckingPromo ? "Checking..." : "Apply"}
                  </Button>
                </div>
                {validPromoCode && (
                  <p className="text-sm text-green-600">
                    {validPromoCode.discount_percentage}% discount applied!
                  </p>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subscription Price:</span>
                  <span>${originalPrice.toFixed(2)}/month</span>
                </div>
                {validPromoCode && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({validPromoCode.discount_percentage}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-border pt-2">
                  <span>Total:</span>
                  <span>${finalPrice.toFixed(2)}/month</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Pay $${finalPrice.toFixed(2)}`}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">All Premium Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Content Creation</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Extended character limits</li>
                <li>Schedule posts ahead</li>
                <li>Premium media uploads</li>
              </ul>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Analytics</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Advanced metrics</li>
                <li>Engagement insights</li>
                <li>Performance tracking</li>
              </ul>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Premium Access</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Emperor Chatroom</li>
                <li>Priority support</li>
                <li>Exclusive badges</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
