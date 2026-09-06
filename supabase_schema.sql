-- Perkfy CashBack Hub: Supabase PostgreSQL Schema with IST (Asia/Kolkata) Timezone
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)

-- 1. Configure Supabase PostgreSQL timezone to Indian Standard Time (IST, UTC+5:30)
ALTER DATABASE postgres SET timezone TO 'Asia/Kolkata';

-- 2. State Synchronization Table
CREATE TABLE IF NOT EXISTS public.perkfy_app_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Relational Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  name text,
  email text UNIQUE NOT NULL,
  mobile text,
  password_hash text,
  role text DEFAULT 'user',
  avatar text,
  status text DEFAULT 'active',
  auth_provider text DEFAULT 'email',
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Relational Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
  id text PRIMARY KEY,
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  available_points bigint DEFAULT 0,
  total_earned bigint DEFAULT 0,
  total_redeemed bigint DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Relational Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id text PRIMARY KEY,
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  user_name text,
  type text,
  points integer DEFAULT 0,
  balance_before bigint DEFAULT 0,
  balance_after bigint DEFAULT 0,
  reference_id text,
  description text,
  status text DEFAULT 'Completed',
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Relational Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id text PRIMARY KEY,
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  user_name text,
  user_email text,
  check_in_date text,
  reward_points integer DEFAULT 10,
  streak_days integer DEFAULT 1,
  ad_watched_reward boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Relational Spin History Table
CREATE TABLE IF NOT EXISTS public.spin_history (
  id text PRIMARY KEY,
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  prize_points integer DEFAULT 0,
  cost_points integer DEFAULT 10,
  status text DEFAULT 'Completed',
  created_at timestamp with time zone DEFAULT now()
);

-- 8. Relational Ad History Table
CREATE TABLE IF NOT EXISTS public.ad_history (
  id text PRIMARY KEY,
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  ad_id text,
  completion_date text,
  verification_status text DEFAULT 'verified',
  reward_points integer DEFAULT 10,
  created_at timestamp with time zone DEFAULT now()
);

-- 9. Relational Withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id text PRIMARY KEY,
  user_id text REFERENCES public.users(id) ON DELETE CASCADE,
  user_name text,
  user_email text,
  voucher_id text,
  voucher_name text,
  points integer DEFAULT 0,
  rupee_value numeric DEFAULT 0,
  reference_id text UNIQUE,
  status text DEFAULT 'Pending',
  user_notes text,
  admin_notes text,
  rejection_reason text,
  fulfillment jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 10. Relational Platform Settings Table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id text PRIMARY KEY,
  daily_spin_limit integer DEFAULT 10,
  cost_per_spin integer DEFAULT 10,
  daily_ad_limit integer DEFAULT 10,
  ad_reward_points integer DEFAULT 10,
  attendance_reward_points integer DEFAULT 10,
  points_to_rupee_ratio integer DEFAULT 10,
  min_withdrawal_points integer DEFAULT 100,
  currency text DEFAULT 'INR',
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables and grant backend access
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow backend access" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Allow backend access" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;
