-- ═══════════════════════════════════════════════════════
-- Migration 001: app_data key-value store
-- Issue #1 — Dashboard: Replace localStorage with Supabase + Realtime
--
-- Run this ONCE in the Supabase SQL Editor before deploying.
-- Path: Database → SQL Editor → New query → paste → Run
-- ═══════════════════════════════════════════════════════

-- ── TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_data (
  key        TEXT        PRIMARY KEY,
  value      JSONB       NOT NULL DEFAULT 'null'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.app_data IS
  'Key-value store mirroring the dashboard localStorage API. '
  'Each SK.* key becomes one row. Value is the full JSON array/object.';

-- ── AUTO-UPDATE updated_at ─────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS app_data_set_updated_at ON public.app_data;
CREATE TRIGGER app_data_set_updated_at
  BEFORE UPDATE ON public.app_data
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── ROW-LEVEL SECURITY ─────────────────────────────────
ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;

-- TODO(J): tighten to `authenticated` only once Supabase Auth
-- is wired up in the next Issue. Until then, anon access lets
-- the dashboard work before login is implemented.
DROP POLICY IF EXISTS "anon_rw" ON public.app_data;
CREATE POLICY "anon_rw" ON public.app_data
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ── REALTIME ───────────────────────────────────────────
-- Enables postgres_changes events for supabase-db.js subscription
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_data;
