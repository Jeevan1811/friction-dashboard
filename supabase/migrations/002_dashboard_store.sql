-- ═══════════════════════════════════════════════════════
-- Migration 002: dashboard_store (replaces app_data)
-- Issue #1 — Dashboard: Replace localStorage with Supabase + Realtime
--
-- Renames table app_data → dashboard_store
-- Renames columns: key → store_key, value → store_value
-- Run this ONCE in the Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════

-- ── TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dashboard_store (
  store_key   TEXT        PRIMARY KEY,
  store_value JSONB       NOT NULL DEFAULT 'null'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ROW-LEVEL SECURITY ─────────────────────────────────
ALTER TABLE public.dashboard_store ENABLE ROW LEVEL SECURITY;

-- TODO(J): tighten to `authenticated` only once Supabase Auth
-- is wired up (Issue #3). Until then, anon access lets the
-- dashboard work before login is implemented.
DROP POLICY IF EXISTS "anon_rw" ON public.dashboard_store;
CREATE POLICY "anon_rw" ON public.dashboard_store
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- ── REALTIME ───────────────────────────────────────────
-- Enables postgres_changes events for supabase-db.js subscription
ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_store;
