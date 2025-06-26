
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
    const { type, content, language } = await req.json();
    console.log('AI Service request:', { type, content, language });

    switch (type) {
      case 'enhance-text':
        return await handleTextEnhancement(content);
      case 'generate-image':
        return await handleImageGeneration(content);
      case 'translate':
        return await handleTranslation(content, language);
      case 'moderate':
        return await handleContentModeration(content);
      case 'synthesize-speech':
        return await handleSpeechSynthesis(content);
      default:
        throw new Error('Invalid service type');
    }
  } catch (error) {
    console.error('AI Service error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleTextEnhancement(content: string) {
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
          content: 'You are a helpful assistant that enhances and improves text content while maintaining the original meaning.'
        },
        { role: 'user', content }
      ],
    }),
  });

  const data = await response.json();
  return new Response(
    JSON.stringify({ enhanced: data.choices[0].message.content }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleImageGeneration(prompt: string) {
  // Use free Stability AI API as fallback
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('STABILITY_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      samples: 1,
      steps: 30,
    }),
  });

  const data = await response.json();
  const base64Image = data.artifacts[0].base64;
  
  return new Response(
    JSON.stringify({ imageUrl: `data:image/png;base64,${base64Image}` }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleTranslation(content: string, targetLanguage: string) {
  // Use Groq for translation as well
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
          content: `You are a translation assistant. Translate the following text to ${targetLanguage}. Only return the translated text, nothing else.`
        },
        { role: 'user', content }
      ],
    }),
  });

  const data = await response.json();
  return new Response(
    JSON.stringify({ translated: data.choices[0].message.content }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleContentModeration(content: string) {
  // Use Groq for content moderation
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
          content: 'You are a content moderator. Analyze the following text for inappropriate content including hate speech, violence, adult content, harassment, or harmful content. Respond with a JSON object containing: {"flagged": boolean, "categories": {"hate": boolean, "violence": boolean, "adult": boolean, "harassment": boolean}, "reason": "explanation if flagged"}'
        },
        { role: 'user', content }
      ],
    }),
  });

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return new Response(
    JSON.stringify({ 
      flagged: result.flagged,
      categories: result.categories,
      scores: {} // Groq doesn't provide scores like OpenAI
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSpeechSynthesis(text: string) {
  // Use Web Speech API fallback - return instructions for client-side implementation
  return new Response(
    JSON.stringify({ 
      audioData: null,
      useWebSpeech: true,
      text: text
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
