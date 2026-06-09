-- ═══════════════════════════════════════════════════════
-- Migration 001: dashboard_store key-value store
-- Issue #1 — Dashboard: Replace localStorage with Supabase + Realtime
--
-- STATUS: Already applied to project fziaxuhonvrhqjulhcyu
-- DO NOT run this again — it will error (table already exists).
-- This file is kept for reference and for new Supabase projects only.
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.dashboard_store (
  id          BIGSERIAL   PRIMARY KEY,
  store_key   TEXT        NOT NULL UNIQUE,
  store_value JSONB       NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  TEXT        NOT NULL DEFAULT 'system'
);

COMMENT ON TABLE public.dashboard_store IS
  'Key-value store mirroring the dashboard localStorage API. '
  'Each SK.* key becomes one row. store_value is the full JSON array/object.';

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dashboard_store_set_updated_at ON public.dashboard_store;
CREATE TRIGGER dashboard_store_set_updated_at
  BEFORE UPDATE ON public.dashboard_store
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Row Level Security
ALTER TABLE public.dashboard_store ENABLE ROW LEVEL SECURITY;

-- Open policy for local dev (no auth yet)
-- TODO: Replace with auth-gated policies per Issue #5
DROP POLICY IF EXISTS "founders_all" ON public.dashboard_store;
CREATE POLICY "founders_all" ON public.dashboard_store
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_store;
