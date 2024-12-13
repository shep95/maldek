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
    const { messages, currentMessage } = await req.json();
    console.log('Processing new message:', currentMessage);
    console.log('With conversation history:', messages);

    // Convert previous messages to OpenAI format
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Use OpenAI to generate a response
    console.log('Sending request to OpenAI with conversation history');
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Using the correct model as specified in the guidelines
        messages: [
          {
            role: 'system',
            content: 'You are Daarp, a helpful and engaging AI assistant. You should be friendly, conversational, and direct in your responses. You can handle a wide range of topics including calculations, general knowledge, and personal advice. Always maintain a helpful and positive tone. When users repeat questions, acknowledge this and provide a different perspective or ask for clarification. Remember previous context in the conversation to provide more natural responses.'
          },
          ...conversationHistory,
          {
            role: 'user',
            content: currentMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const aiData = await aiResponse.json();
    console.log('OpenAI response received:', aiData);

    if (aiData.error) {
      console.error('OpenAI error:', aiData.error);
      throw new Error(aiData.error.message);
    }

    return new Response(JSON.stringify({ 
      response: aiData.choices[0].message.content
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in search-web function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});