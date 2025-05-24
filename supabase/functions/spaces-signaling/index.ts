
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebSocketClient {
  socket: WebSocket
  spaceId: string
  userId: string
  role: string
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
    console.log('Authentication failed:', error?.message)
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
    console.log('User is not a participant in space:', spaceId)
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
    userId: user.id,
    role: participant.role
  }

  clients.set(user.id, client)

  // Handle WebSocket events
  socket.onopen = () => {
    console.log(`Client connected: ${user.id} to space: ${spaceId} with role: ${participant.role}`)
    
    // Notify all users that someone joined
    broadcastToSpace(spaceId, {
      type: 'user-joined',
      userId: user.id,
      role: participant.role
    })

    // If a speaker/host joins, send offers to all listeners for audio streaming
    if (participant.role === 'speaker' || participant.role === 'host' || participant.role === 'co_host') {
      const listeners = Array.from(clients.values()).filter(
        client => client.spaceId === spaceId && 
        client.role === 'listener' && 
        client.userId !== user.id
      )
      
      listeners.forEach(listener => {
        listener.socket.send(JSON.stringify({
          type: 'speaker-joined',
          speakerId: user.id,
          message: 'A speaker has joined and will start streaming audio'
        }))
      })
    }
  }

  socket.onmessage = async (e) => {
    try {
      const message = JSON.parse(e.data)
      message.from = user.id
      message.role = participant.role
      
      console.log('Received message:', message.type, 'from:', user.id)
      
      // Handle WebRTC signaling messages (offer, answer, ice-candidate)
      if (['offer', 'answer', 'ice-candidate'].includes(message.type)) {
        const targetClient = clients.get(message.to)
        if (targetClient && targetClient.spaceId === spaceId) {
          console.log(`Relaying ${message.type} from ${user.id} to ${message.to}`)
          targetClient.socket.send(JSON.stringify(message))
        } else {
          console.log(`Target client ${message.to} not found or not in same space`)
        }
        return
      }
      
      // Special handling for audio control messages
      if (message.type === 'mute-user') {
        if (participant.role === 'host' || participant.role === 'co_host') {
          const targetClient = clients.get(message.targetUserId)
          if (targetClient) {
            targetClient.socket.send(JSON.stringify({
              type: 'forced-mute',
              from: user.id
            }))
          }
        } else {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Not authorized to mute other users'
          }))
          return
        }
      }
      
      // Special handling for role change messages
      if (message.type === 'change-role') {
        if (participant.role === 'host') {
          const { error } = await supabase
            .from('space_participants')
            .update({ role: message.newRole })
            .eq('space_id', spaceId)
            .eq('user_id', message.targetUserId)
            
          if (error) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Failed to update role in database'
            }))
            return
          }
          
          const targetClient = clients.get(message.targetUserId)
          if (targetClient) {
            targetClient.role = message.newRole
            
            targetClient.socket.send(JSON.stringify({
              type: 'role-changed',
              newRole: message.newRole,
              by: user.id
            }))
            
            broadcastToSpace(spaceId, {
              type: 'user-role-changed',
              userId: message.targetUserId,
              newRole: message.newRole
            })
          }
        } else {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Only the host can change user roles'
          }))
          return
        }
      }
      
      // Broadcast other message types to all participants
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

  socket.onerror = (error) => {
    console.error(`WebSocket error for user ${user.id}:`, error)
  }

  return response
})

function broadcastToSpace(spaceId: string, message: any, excludeUserId?: string) {
  const spaceClients = Array.from(clients.values()).filter(
    client => client.spaceId === spaceId && client.userId !== excludeUserId
  )
  
  console.log(`Broadcasting message type ${message.type} to ${spaceClients.length} clients in space ${spaceId}`)
  
  spaceClients.forEach(client => {
    try {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(JSON.stringify(message))
      }
    } catch (err) {
      console.error(`Error sending to client ${client.userId}:`, err)
      clients.delete(client.userId)
    }
  })
}
