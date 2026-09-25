import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error(
    '❌ Missing VITE_SUPABASE_URL. Please set it in your .env file. See .env.example for reference.'
  );
}

if (!supabaseAnonKey) {
  console.error(
    '❌ Missing VITE_SUPABASE_ANON_KEY. Please set it in your .env file. See .env.example for reference.'
  );
}

// Create a single Supabase client instance
// This client uses the anon (public) key — safe for browser use
// RLS policies enforce data access on the server side
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
