
import { useRef, useState, useCallback } from 'react';
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
  const isConnectingRef = useRef(false);

  const connectToSignalingServer = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || websocketRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('Connection already in progress');
      return;
    }

    try {
      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      // Clear any existing connection
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }

      isConnectingRef.current = true;
      console.log('Connecting to signaling server...');
      
      // Get the Supabase URL and construct the WebSocket URL correctly
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL is not configured');
      }
      
      // Convert HTTP/HTTPS URL to WebSocket URL
      const wsUrl = supabaseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
      const fullWsUrl = `${wsUrl}/functions/v1/spaces-signaling?spaceId=${spaceId}&jwt=${session.access_token}`;
      
      console.log('Connecting to WebSocket URL:', fullWsUrl);
      websocketRef.current = new WebSocket(fullWsUrl);

      websocketRef.current.onopen = () => {
        console.log('Connected to signaling server');
        isConnectingRef.current = false;
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        reconnectAttempts.current = 0;
        toast.success('Connected to space');
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnectingRef.current = false;
        setState(prev => ({ ...prev, error: 'Connection error' }));
      };

      websocketRef.current.onclose = (event) => {
        console.log('Disconnected from signaling server, code:', event.code, 'reason:', event.reason);
        isConnectingRef.current = false;
        setState(prev => ({ ...prev, isConnected: false }));
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        
        // Only try to reconnect if it wasn't a clean close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          console.log(`Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          reconnectAttempts.current++;
          toast.info(`Reconnecting to space... Attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connectToSignalingServer();
          }, 2000 * reconnectAttempts.current); // Exponential backoff
        } else if (event.code !== 1000) {
          toast.error('Unable to connect to space. Please try rejoining.');
          setState(prev => ({ ...prev, error: 'Maximum reconnection attempts reached' }));
        }
      };

    } catch (err) {
      console.error('Error connecting to space:', err);
      isConnectingRef.current = false;
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(`Failed to connect: ${errorMessage}`);
    }
  }, [spaceId, session?.access_token]);

  const sendSignalingMessage = useCallback((message: any) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      console.log('Sending signaling message:', message.type);
      websocketRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected, current state:', websocketRef.current?.readyState);
      toast.error('Connection lost. Attempting to reconnect...');
      connectToSignalingServer();
    }
  }, [connectToSignalingServer]);

  const cleanup = useCallback(() => {
    console.log('Cleaning up signaling connection');
    isConnectingRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (websocketRef.current) {
      websocketRef.current.close(1000, 'Component unmounting'); // Clean close
      websocketRef.current = null;
    }
    
    setState({ isConnected: false, error: null });
  }, []);

  return {
    ...state,
    websocketRef,
    connectToSignalingServer,
    sendSignalingMessage,
    cleanup
  };
};
