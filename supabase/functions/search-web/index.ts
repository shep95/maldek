import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    console.log('Received chat request:', { 
      message: currentMessage,
      hasImage: !!imageUrl,
      generateImage,
      historyLength: messages?.length || 0
    });

    if (!openAIApiKey) {
      console.error('OpenAI API key missing');
      throw new Error('OpenAI API key is not configured');
    }

    if (generateImage) {
      console.log('Generating image for prompt:', currentMessage);
      
      // Call DALL-E API for image generation
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: currentMessage,
          n: 1,
          size: "1024x1024",
        }),
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        console.error('DALL-E API error:', errorData);
        throw new Error(`Image generation failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const imageData = await imageResponse.json();
      console.log('Image generated successfully');
      
      return new Response(JSON.stringify({ 
        response: "I've generated an image based on your request. Here it is! Let me know if you'd like any adjustments.",
        generatedImageUrl: imageData.data[0].url
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userMessage = imageUrl
      ? {
          role: 'user',
          content: [
            { type: 'text', text: currentMessage },
            { type: 'image_url', image_url: imageUrl }
          ]
        }
      : {
          role: 'user',
          content: currentMessage
        };

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imageUrl ? 'gpt-4o' : 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "You are Bosley AI, a helpful and friendly AI assistant. You can help users with various tasks, including generating images and answering questions. When users want to generate images, they can say 'Generate an image of...' or similar phrases."
          },
          ...messages.slice(-5).map((msg: any) => ({
            role: msg.role,
            content: msg.content
          })),
          userMessage
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiData = await aiResponse.json();

    return new Response(JSON.stringify({ 
      response: aiData.choices[0].message.content
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in search-web function:', error);
    return new Response(JSON.stringify({ 
      error: `Error: ${error.message}. Please try again.`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});