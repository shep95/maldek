
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables for production security
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://yridaehdhtmdtasnbsrn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaWRhZWhkaHRtZHRhc25ic3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTE4ODYsImV4cCI6MjA0OTUyNzg4Nn0.GrgAyX9xWUYUFYBoX8iFEiZckm6uxruo6st6R5ZaDcI";

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

// Enhanced security configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage,
    // Enhanced security headers
    flowType: 'pkce',
    debug: false
  },
  global: {
    headers: {
      'X-Client-Info': 'bosley-app/1.0.0',
      'X-Requested-With': 'XMLHttpRequest'
    }
  },
  // Rate limiting and security
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add security event listeners
supabase.auth.onAuthStateChange((event, session) => {
  // Log security events (implement proper logging in production)
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    console.log(`Security Event: ${event} at ${new Date().toISOString()}`);
  }
  
  // Clear sensitive data on sign out
  if (event === 'SIGNED_OUT') {
    localStorage.removeItem('bosley_encrypted_master_key');
    localStorage.removeItem('bosley_key_salt');
    sessionStorage.clear();
  }
});
