import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Moderating content:', { fileName: file.name, type: file.type });

    // For profile pictures, we'll do a basic file type check
    if (file.type.startsWith('image/')) {
      // Profile pictures are considered safe by default
      // You can add additional checks here if needed
      return new Response(
        JSON.stringify({ safe: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For other content types, proceed with OpenAI moderation
    const bytes = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));

    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: `Check this ${file.type} file: data:${file.type};base64,${base64}`,
      }),
    });

    const moderationResult = await response.json();
    console.log('Moderation result:', moderationResult);

    const isFlagged = moderationResult.results?.[0]?.flagged;
    const categories = moderationResult.results?.[0]?.categories || {};

    if (isFlagged) {
      const flaggedCategories = Object.entries(categories)
        .filter(([_, isFlagged]) => isFlagged)
        .map(([category]) => category);

      console.log('Content flagged:', flaggedCategories);
      
      return new Response(
        JSON.stringify({
          error: 'Content violates community guidelines',
          categories: flaggedCategories,
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ safe: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Moderation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});