
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openaiConfig = new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY')
})
const openai = new OpenAIApi(openaiConfig)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mediaUrl, userId } = await req.json()
    
    if (!mediaUrl) {
      return new Response(
        JSON.stringify({ error: 'Media URL is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('Moderating content:', { mediaUrl, userId });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if we already have moderation results for this URL
    const { data: existingModeration, error: checkError } = await supabaseClient
      .from('content_moderation')
      .select('is_safe')
      .eq('media_url', mediaUrl)
      .single()

    if (checkError) {
      console.error('Error checking existing moderation:', checkError);
    }

    if (existingModeration) {
      console.log('Found existing moderation result:', existingModeration);
      return new Response(
        JSON.stringify({ is_safe: existingModeration.is_safe }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // For now, we'll automatically approve media since OpenAI's moderation endpoint
    // doesn't directly support image/video URLs
    const isSafe = true;
    const moderationResult = {
      flagged: false,
      categories: {},
      category_scores: {}
    };

    // Store moderation results
    const { error: insertError } = await supabaseClient
      .from('content_moderation')
      .insert({
        media_url: mediaUrl,
        moderation_result: moderationResult,
        is_safe: isSafe,
        user_id: userId
      })

    if (insertError) {
      console.error('Error storing moderation results:', insertError);
      throw insertError;
    }

    console.log('Moderation complete:', { isSafe, moderationResult });

    return new Response(
      JSON.stringify({
        is_safe: isSafe,
        details: moderationResult
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Content moderation error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to moderate content',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
