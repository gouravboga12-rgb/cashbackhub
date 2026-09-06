-- Perkfy CashBack Hub: Cloud State Synchronization Table
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

CREATE TABLE IF NOT EXISTS public.perkfy_app_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.perkfy_app_state ENABLE ROW LEVEL SECURITY;

-- Allow read & write access for backend APIs with anon key
DROP POLICY IF EXISTS "Allow full access for backend" ON public.perkfy_app_state;
CREATE POLICY "Allow full access for backend" ON public.perkfy_app_state
  FOR ALL
  USING (true)
  WITH CHECK (true);
