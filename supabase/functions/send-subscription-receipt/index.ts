
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReceiptRequest {
  customerEmail: string;
  tierName: string;
  price: number;
  purchaseDate: string;
  orderId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, tierName, price, purchaseDate, orderId }: ReceiptRequest = await req.json();

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);

    const formattedDate = new Date(purchaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailResponse = await resend.emails.send({
      from: "Lovable <onboarding@resend.dev>",
      to: [customerEmail],
      subject: "Your Subscription Receipt",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Thank You for Your Subscription!</h1>
          
          <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #444; margin-bottom: 20px;">Receipt Details</h2>
            
            <div style="margin-bottom: 15px;">
              <strong>Order ID:</strong> ${orderId}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong>Date:</strong> ${formattedDate}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong>Subscription Plan:</strong> ${tierName}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong>Amount:</strong> ${formattedPrice}
            </div>
          </div>
          
          <p style="color: #666; text-align: center;">
            If you have any questions about your subscription, please don't hesitate to contact our support team.
          </p>
        </div>
      `,
    });

    console.log("Receipt email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error sending receipt:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
