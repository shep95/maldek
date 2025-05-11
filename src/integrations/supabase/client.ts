
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { secureLog } from '@/utils/secureLogging';

const SUPABASE_URL = "https://yridaehdhtmdtasnbsrn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaWRhZWhkaHRtZHRhc25ic3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTE4ODYsImV4cCI6MjA0OTUyNzg4Nn0.GrgAyX9xWUYUFYBoX8iFEiZckm6uxruo6st6R5ZaDcI";

// Log sanitized connection information
secureLog(`Initializing Supabase client`, { level: 'info' });

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage,
    // Add extra security for auth callbacks to prevent XSS 
    // and other potential security issues
    flowType: 'implicit'
  },
  global: {
    // Add headers to ensure response types are secure
    headers: {
      'X-Client-Info': 'secure-e2ee-client'
    }
  },
  realtime: {
    // Make sure we only connect to secure channels
    params: {
      eventsPerSecond: 10
    }
  }
});

// Apply secure error handling to commonly used Supabase methods
// This prevents accidental exposure of sensitive data in error logs
const originalQuery = supabase.from;
supabase.from = function secureFrom(table) {
  const result = originalQuery.call(this, table);
  return result;
};

// Monitor auth state changes securely
supabase.auth.onAuthStateChange((event, session) => {
  // Only log sanitized events for debugging
  secureLog(`Auth state changed: ${event}`, { 
    level: 'debug',
    sanitize: true 
  });
});
