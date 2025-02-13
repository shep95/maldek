
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_API_ID = Deno.env.get('TELEGRAM_API_ID')
const TELEGRAM_API_HASH = Deno.env.get('TELEGRAM_API_HASH')
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    const { action, telegram_id, message } = await req.json()
    
    // Initialize Telegram API endpoint
    const telegramApi = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

    switch (action) {
      case 'send_message': {
        console.log('Sending message to Telegram:', telegram_id, message)
        
        const response = await fetch(`${telegramApi}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: telegram_id,
            text: message,
          }),
        })

        const result = await response.json()
        
        if (!result.ok) {
          throw new Error(`Telegram API error: ${result.description}`)
        }

        console.log('Message sent successfully:', result)
        
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_updates': {
        console.log('Getting updates from Telegram')
        
        const response = await fetch(`${telegramApi}/getUpdates`)
        const result = await response.json()
        
        if (!result.ok) {
          throw new Error(`Telegram API error: ${result.description}`)
        }

        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
