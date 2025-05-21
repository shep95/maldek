
import { useRef, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';

interface SignalingState {
  isConnected: boolean;
  error: string | null;
}

export const useSpaceSignaling = (spaceId: string) => {
  const session = useSession();
  const [state, setState] = useState<SignalingState>({
    isConnected: false,
    error: null
  });
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connectToSignalingServer = async () => {
    try {
      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      // Clear any existing connection
      if (websocketRef.current) {
        websocketRef.current.close();
      }

      console.log('Connecting to signaling server...');
      const wsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spaces-signaling?spaceId=${spaceId}&jwt=${session.access_token}`;
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        console.log('Connected to signaling server');
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        reconnectAttempts.current = 0;
        toast.success('Connected to space');
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ ...prev, error: 'Connection error' }));
        toast.error('Connection error occurred');
      };

      websocketRef.current.onclose = () => {
        console.log('Disconnected from signaling server');
        setState(prev => ({ ...prev, isConnected: false }));
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
        }
        
        // Attempt to reconnect if not at max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          console.log(`Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          reconnectAttempts.current++;
          toast.info(`Reconnecting to space... Attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          reconnectTimeoutRef.current = window.setTimeout(connectToSignalingServer, 2000);
        } else {
          toast.error('Unable to connect to space. Please try rejoining.');
          setState(prev => ({ ...prev, error: 'Maximum reconnection attempts reached' }));
        }
      };

    } catch (err) {
      console.error('Error connecting to space:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(`Failed to connect: ${errorMessage}`);
    }
  };

  const sendSignalingMessage = (message: any) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      console.log('Sending signaling message:', message);
      websocketRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
      toast.error('Connection lost. Attempting to reconnect...');
      connectToSignalingServer();
    }
  };

  const cleanup = () => {
    console.log('Cleaning up signaling connection');
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
    }
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  return {
    ...state,
    websocketRef,
    connectToSignalingServer,
    sendSignalingMessage,
    cleanup
  };
};
