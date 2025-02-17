
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

const openaiConfig = new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY')
})
const openai = new OpenAIApi(openaiConfig)

serve(async (req) => {
  try {
    const { mediaUrl, userId } = await req.json()
    
    if (!mediaUrl) {
      return new Response(
        JSON.stringify({ error: 'Media URL is required' }),
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if we already have moderation results for this URL
    const { data: existingModeration } = await supabaseClient
      .from('content_moderation')
      .select('is_safe')
      .eq('media_url', mediaUrl)
      .single()

    if (existingModeration) {
      return new Response(
        JSON.stringify({ is_safe: existingModeration.is_safe }),
        { status: 200 }
      )
    }

    // Perform moderation using OpenAI
    const response = await openai.createModeration({
      input: mediaUrl
    })

    const moderationResult = response.data.results[0]
    const isSafe = !moderationResult.flagged

    // Store moderation results
    await supabaseClient
      .from('content_moderation')
      .insert({
        media_url: mediaUrl,
        moderation_result: moderationResult,
        is_safe: isSafe,
        user_id: userId
      })

    if (!isSafe) {
      console.error('Inappropriate content detected:', {
        url: mediaUrl,
        userId,
        moderationResult
      })
    }

    return new Response(
      JSON.stringify({
        is_safe: isSafe,
        details: moderationResult
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Content moderation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to moderate content' }),
      { status: 500 }
    )
  }
})
