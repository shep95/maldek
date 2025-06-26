
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mediaUrl, content, userId } = await req.json()
    
    if (!mediaUrl && !content) {
      return new Response(
        JSON.stringify({ error: 'Either media URL or content is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('Moderating content:', { mediaUrl, content, userId });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let moderationResult = null;
    let isSafe = true;

    // If we have text content, moderate it directly
    if (content) {
      console.log('Moderating text content...');
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: content
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      moderationResult = data.results[0];
      isSafe = !moderationResult.flagged;

      console.log('Text moderation result:', { flagged: moderationResult.flagged, categories: moderationResult.categories });
    }

    // If we have a media URL, we can't directly moderate it with OpenAI's text moderation
    // For now, we'll check if the URL appears suspicious or contains inappropriate terms
    if (mediaUrl) {
      console.log('Checking media URL for suspicious patterns...');
      
      // Check if we already have moderation results for this URL
      const { data: existingModeration, error: checkError } = await supabaseClient
        .from('content_moderation')
        .select('is_safe, moderation_result')
        .eq('media_url', mediaUrl)
        .single()

      if (existingModeration && !checkError) {
        console.log('Found existing moderation result:', existingModeration);
        return new Response(
          JSON.stringify({ 
            is_safe: existingModeration.is_safe,
            details: existingModeration.moderation_result 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      // For media files, we'll do basic URL pattern checking
      // This is a placeholder - in production you'd want to use image moderation services
      const suspiciousPatterns = [
        /adult/i, /porn/i, /explicit/i, /nsfw/i, /xxx/i,
        /violence/i, /gore/i, /disturbing/i, /hate/i
      ];
      
      const urlContainsSuspiciousContent = suspiciousPatterns.some(pattern => 
        pattern.test(mediaUrl)
      );

      if (urlContainsSuspiciousContent) {
        isSafe = false;
        moderationResult = {
          flagged: true,
          categories: { "adult": true },
          category_scores: { "adult": 0.9 }
        };
      } else {
        // If no suspicious patterns found, consider it safe
        moderationResult = {
          flagged: false,
          categories: {},
          category_scores: {}
        };
      }
    }

    // Store moderation results in database
    if (mediaUrl || content) {
      const { error: insertError } = await supabaseClient
        .from('content_moderation')
        .insert({
          media_url: mediaUrl || null,
          content: content || null,
          moderation_result: moderationResult,
          is_safe: isSafe,
          user_id: userId
        })

      if (insertError) {
        console.error('Error storing moderation results:', insertError);
        // Don't throw error here - still return the moderation result
      }
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
