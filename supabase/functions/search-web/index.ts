
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentMessage, imageUrl, generateImage } = await req.json();
    console.log('Processing request:', { messageCount: messages?.length, currentMessage, hasImage: !!imageUrl, generateImage });

    let response = '';
    let generatedImageUrl = null;

    // Generate AI response using Groq
    const chatResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
            content: 'You are Daarp, a helpful AI assistant. Provide helpful, accurate, and engaging responses to user questions.'
          },
          ...messages.slice(-5).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: currentMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!chatResponse.ok) {
      throw new Error(`Groq API error: ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    response = chatData.choices[0].message.content;

    // Handle image generation if requested
    if (generateImage) {
      try {
        const imageResponse = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('STABILITY_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text_prompts: [{ text: currentMessage }],
            cfg_scale: 7,
            samples: 1,
            steps: 30,
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          generatedImageUrl = `data:image/png;base64,${imageData.artifacts[0].base64}`;
        }
      } catch (error) {
        console.error('Image generation failed:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        response,
        generatedImageUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-web function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate response',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
