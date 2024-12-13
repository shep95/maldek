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
    console.log('Processing request with:', { currentMessage, hasImage: !!imageUrl });

    // Convert previous messages to OpenAI format
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const systemMessage = {
      role: 'system',
      content: 'You are Daarp, a helpful and engaging AI assistant. You should be friendly, conversational, and direct in your responses. You can handle a wide range of topics including calculations, general knowledge, and personal advice. Always maintain a helpful and positive tone.'
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

    console.log('Sending request to OpenAI');
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
          ...conversationHistory,
          userMessage
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiData = await aiResponse.json();
    console.log('Received response from OpenAI');

    return new Response(JSON.stringify({ 
      response: aiData.choices[0].message.content
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in search-web function:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred while processing your request. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});