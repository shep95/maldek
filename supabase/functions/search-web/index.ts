import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const serpApiKey = Deno.env.get('SERP_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('Processing query:', query);

    // First, search the web using SerpAPI
    const searchResponse = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}`);
    const searchData = await searchResponse.json();
    
    // Extract relevant information from search results
    const searchResults = searchData.organic_results?.slice(0, 3).map((result: any) => ({
      title: result.title,
      snippet: result.snippet,
      link: result.link,
    })) || [];

    console.log('Search results:', searchResults);

    // Format search results for OpenAI
    const searchContext = searchResults.map((result: any) => 
      `Title: ${result.title}\nSnippet: ${result.snippet}\nSource: ${result.link}`
    ).join('\n\n');

    // Use OpenAI to generate a response based on search results
    console.log('Sending request to OpenAI');
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are Daarp, a helpful AI assistant. Use the provided search results to give accurate, up-to-date information. Always cite your sources and be engaging and conversational in your responses.'
          },
          {
            role: 'user',
            content: `Search results for "${query}":\n\n${searchContext}\n\nPlease provide a helpful response based on these results.`
          }
        ],
      }),
    });

    const aiData = await aiResponse.json();
    console.log('OpenAI response received');

    return new Response(JSON.stringify({ 
      response: aiData.choices[0].message.content,
      sources: searchResults
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