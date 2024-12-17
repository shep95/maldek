import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebSocketClient {
  socket: WebSocket
  spaceId: string
  userId: string
}

const clients = new Map<string, WebSocketClient>()

Deno.serve(async (req) => {
  const upgrade = req.headers.get('upgrade') || ''
  if (upgrade.toLowerCase() != 'websocket') {
    return new Response('Expected websocket upgrade', { 
      status: 400,
      headers: corsHeaders 
    })
  }

  // Get spaceId and JWT from URL params
  const url = new URL(req.url)
  const spaceId = url.searchParams.get('spaceId')
  const jwt = url.searchParams.get('jwt')

  if (!spaceId || !jwt) {
    return new Response('Missing spaceId or auth token', { 
      status: 400,
      headers: corsHeaders 
    })
  }

  // Verify user authentication
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  const { data: { user }, error } = await supabase.auth.getUser(jwt)
  if (error || !user) {
    return new Response('Unauthorized', { 
      status: 401,
      headers: corsHeaders 
    })
  }

  // Verify user is a participant in the space
  const { data: participant } = await supabase
    .from('space_participants')
    .select('role')
    .eq('space_id', spaceId)
    .eq('user_id', user.id)
    .single()

  if (!participant) {
    return new Response('Not a space participant', { 
      status: 403,
      headers: corsHeaders 
    })
  }

  // Set up WebSocket
  const { socket, response } = Deno.upgradeWebSocket(req)

  const client: WebSocketClient = {
    socket,
    spaceId,
    userId: user.id
  }

  clients.set(user.id, client)

  // Handle WebSocket events
  socket.onopen = () => {
    console.log(`Client connected: ${user.id} to space: ${spaceId}`)
    broadcastToSpace(spaceId, {
      type: 'user-joined',
      userId: user.id,
      role: participant.role
    })
  }

  socket.onmessage = (e) => {
    try {
      const message = JSON.parse(e.data)
      message.from = user.id
      
      // Relay messages to other participants in the same space
      broadcastToSpace(spaceId, message, user.id)
    } catch (err) {
      console.error('Error handling message:', err)
    }
  }

  socket.onclose = () => {
    console.log(`Client disconnected: ${user.id}`)
    clients.delete(user.id)
    broadcastToSpace(spaceId, {
      type: 'user-left',
      userId: user.id
    })
  }

  return response
})

function broadcastToSpace(spaceId: string, message: any, excludeUserId?: string) {
  for (const client of clients.values()) {
    if (client.spaceId === spaceId && client.userId !== excludeUserId) {
      try {
        client.socket.send(JSON.stringify(message))
      } catch (err) {
        console.error(`Error sending to client ${client.userId}:`, err)
      }
    }
  }
}