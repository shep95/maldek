
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let moderationResult = null;
    let isSafe = true;

    if (content) {
      console.log('Moderating text content with Groq...');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a content moderator. Analyze the following text for inappropriate content including hate speech, violence, adult content, harassment, or harmful content. Respond with ONLY a JSON object containing: {"flagged": boolean, "categories": {"hate": boolean, "violence": boolean, "adult": boolean, "harassment": boolean}, "reason": "explanation if flagged"}'
            },
            { role: 'user', content }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      try {
        moderationResult = JSON.parse(data.choices[0].message.content);
        isSafe = !moderationResult.flagged;
      } catch (parseError) {
        console.error('Failed to parse moderation result:', parseError);
        // Fallback to keyword-based moderation
        const suspiciousKeywords = [
          'hate', 'kill', 'violence', 'terrorist', 'bomb', 'weapon',
          'suicide', 'self-harm', 'abuse', 'threat', 'harassment'
        ];
        
        const containsSuspiciousContent = suspiciousKeywords.some(keyword => 
          content.toLowerCase().includes(keyword)
        );
        
        moderationResult = {
          flagged: containsSuspiciousContent,
          categories: { "hate": containsSuspiciousContent },
          reason: containsSuspiciousContent ? "Contains potentially harmful keywords" : "Content appears safe"
        };
        isSafe = !containsSuspiciousContent;
      }

      console.log('Text moderation result:', { flagged: moderationResult.flagged, categories: moderationResult.categories });
    }

    if (mediaUrl) {
      console.log('Checking media URL for suspicious patterns...');
      
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
        moderationResult = {
          flagged: false,
          categories: {},
          category_scores: {}
        };
      }
    }

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
