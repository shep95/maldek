
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yridaehdhtmdtasnbsrn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaWRhZWhkaHRtZHRhc25ic3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTE4ODYsImV4cCI6MjA0OTUyNzg4Nn0.GrgAyX9xWUYUFYBoX8iFEiZckm6uxruo6st6R5ZaDcI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage
  }
});
