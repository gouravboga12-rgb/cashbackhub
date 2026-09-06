const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lvmqhzknekkjoadcmqyt.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXFoemtuZWtram9hZGNtcXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MDM1MjMsImV4cCI6MjEwNDE3OTUyM30.bUm5AokibI-Qa7tLDT20SuxxilMXIrPHmhNR0UUXVkg';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_m6nOP1y2m0ptWTDF5cC5KA_1u2yIy4b';

let supabase = null;

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  console.log('✅ Supabase Client initialized successfully at:', SUPABASE_URL);
} catch (error) {
  console.warn('⚠️ Supabase Client initialization warning:', error.message);
}

module.exports = {
  supabase,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_PUBLISHABLE_KEY
};
