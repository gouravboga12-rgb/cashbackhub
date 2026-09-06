import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://lvmqhzknekkjoadcmqyt.supabase.co';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXFoemtuZWtram9hZGNtcXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MDM1MjMsImV4cCI6MjEwNDE3OTUyM30.bUm5AokibI-Qa7tLDT20SuxxilMXIrPHmhNR0UUXVkg';
export const SUPABASE_PUBLISHABLE_KEY = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_m6nOP1y2m0ptWTDF5cC5KA_1u2yIy4b';

let supabaseClient = null;

try {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
  console.warn('Supabase client init warning:', error);
}

export const supabase = supabaseClient;
export default supabaseClient;
