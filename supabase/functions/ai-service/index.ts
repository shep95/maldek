import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

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
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    }),
  });

  const data = await response.json();
  return new Response(
    JSON.stringify({ imageUrl: data.data[0].url }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleTranslation(content: string, targetLanguage: string) {
  const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'));
  const translation = await hf.translation({
    model: 'facebook/mbart-large-50-many-to-many-mmt',
    inputs: content,
    parameters: { target_language: targetLanguage },
  });

  return new Response(
    JSON.stringify({ translated: translation }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleContentModeration(content: string) {
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: content }),
  });

  const data = await response.json();
  return new Response(
    JSON.stringify({ 
      flagged: data.results[0].flagged,
      categories: data.results[0].categories,
      scores: data.results[0].category_scores
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSpeechSynthesis(text: string) {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY') || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    }),
  });

  const audioBuffer = await response.arrayBuffer();
  const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

  return new Response(
    JSON.stringify({ audioData: `data:audio/mpeg;base64,${base64Audio}` }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}