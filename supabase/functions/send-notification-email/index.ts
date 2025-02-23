
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notification_id } = await req.json();

    // Fetch notification details with related data
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey(username, avatar_url),
        recipient:profiles!notifications_recipient_id_fkey(email)
      `)
      .eq("id", notification_id)
      .single();

    if (notificationError || !notification) {
      throw new Error("Notification not found");
    }

    // Get email template based on notification type
    const getEmailContent = (type: string) => {
      switch (type) {
        case "new_follow":
          return {
            subject: "New Follower!",
            content: `${notification.actor.username} is now following you!`
          };
        case "new_post":
          return {
            subject: "New Post from Someone You Follow",
            content: `${notification.actor.username} just made a new post!`
          };
        case "like":
          return {
            subject: "Someone Liked Your Post",
            content: `${notification.actor.username} liked your post`
          };
        case "comment":
          return {
            subject: "New Comment on Your Post",
            content: `${notification.actor.username} commented on your post: "${notification.content}"`
          };
        default:
          return {
            subject: "New Notification",
            content: "You have a new notification!"
          };
      }
    };

    const emailTemplate = getEmailContent(notification.type);

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "notifications@yourdomain.com",
      to: notification.recipient.email,
      subject: emailTemplate.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${emailTemplate.subject}</h2>
          <p style="font-size: 16px; color: #666;">${emailTemplate.content}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 14px; color: #999;">
            To manage your email preferences, visit your notification settings.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
