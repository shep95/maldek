
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { conversation_id } = await req.json()
    
    if (!conversation_id) {
      return new Response(
        JSON.stringify({ error: 'Conversation ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get the user ID from the auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // First delete conversation participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversation_id)

    if (participantsError) {
      console.error('Error deleting conversation participants:', participantsError)
    }

    // Then delete the conversation itself
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversation_id)

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError)
      return new Response(
        JSON.stringify({ error: `Failed to delete conversation: ${deleteError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Conversation deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
