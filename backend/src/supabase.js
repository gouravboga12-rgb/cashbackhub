const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';

let supabase = null;

// Only initialize Supabase if valid credentials are provided and not dead dummy domain
if (
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('lvmqhzknekkjoadcmqyt') &&
  SUPABASE_URL.startsWith('http')
) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('✅ Supabase Client initialized at:', SUPABASE_URL);
  } catch (error) {
    console.warn('⚠️ Supabase Client initialization skipped:', error.message);
  }
} else {
  console.log('ℹ️ Running in fast in-memory & disk state engine.');
}

module.exports = {
  supabase,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_PUBLISHABLE_KEY
};
