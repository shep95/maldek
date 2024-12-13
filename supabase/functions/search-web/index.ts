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
    const { messages, currentMessage, imageUrl } = await req.json();
    console.log('Received chat request:', { 
      message: currentMessage,
      hasImage: !!imageUrl,
      historyLength: messages?.length || 0
    });

    if (!openAIApiKey) {
      console.error('OpenAI API key missing');
      throw new Error('OpenAI API key is not configured');
    }

    const systemMessage = {
      role: 'system',
      content: `You are Daarp, a highly capable AI assistant. Your responses should be:
      - Detailed and accurate
      - Friendly and conversational
      - Direct and to the point
      - Helpful with practical solutions
      You can handle topics like coding, general knowledge, analysis, and creative tasks.
      When users ask questions, provide thorough, well-thought-out responses.
      Always respond in a natural, conversational way while maintaining professionalism.`
    };

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

    console.log('Sending request to OpenAI API with model:', imageUrl ? 'gpt-4o' : 'gpt-4o-mini');
    
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imageUrl ? 'gpt-4o' : 'gpt-4o-mini',
        messages: [
          systemMessage,
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
    console.log('OpenAI response received:', {
      status: aiResponse.status,
      messageLength: aiData.choices[0].message.content.length,
      firstFewWords: aiData.choices[0].message.content.slice(0, 50)
    });

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