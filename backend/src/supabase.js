// Supabase has been completely decommissioned and migrated to AWS EC2 PostgreSQL.
const supabase = null;

console.log('ℹ️ Running exclusively on AWS EC2 & PostgreSQL database engine (Supabase disconnected).');

module.exports = {
  supabase: null,
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  SUPABASE_PUBLISHABLE_KEY: ''
};

