# Issue #1 — Dashboard: Redesign Task Board + Replace localStorage with Supabase + Realtime

**Status:** Open  
**Assigned to:** Dev (collaborator)  
**Opened by:** CTO  
**Branch:** `feature/dashboard-supabase`  
**Priority:** 🔴 High — blocks all demo and multi-device use  

---

## Context

The Friction SDN BHD internal dashboard (`friction-dashboard`) is a 5-page vanilla JS app that currently stores all data in browser `localStorage`. This means:

- Data is device-specific — changes on phone don't appear on laptop
- No real-time sync between team members
- Data is lost if the user clears their browser
- Cannot be shared or accessed by multiple founders (M, J, B)

The fix is to replace `localStorage` with Supabase (we already have a Supabase project) and add Supabase Realtime so all connected devices update live when someone changes a task.

The good news: `core.js` already has the data layer abstracted behind a `DB` object. You are replacing exactly two functions:

```js
// CURRENT (core.js lines 27–30)
const DB = {
  get(key){ try{ return JSON.parse(localStorage.getItem(key)); }catch(e){ return null; } },
  set(key,val){ try{ localStorage.setItem(key,JSON.stringify(val)); }catch(e){} },
  del(key){ try{ localStorage.removeItem(key); }catch(e){} },
};
```

---

## Goal

Replace `localStorage` with Supabase so the dashboard:
1. Works on phone AND laptop simultaneously with the same data
2. Updates live (no page refresh needed) when any device changes a task
3. Is hosted on Vercel at `dashboard.friction.com.my` (or similar)

---

## Supabase Project

**Project ID:** `fziaxuhonvrhqjulhcyu`  
**Region:** ap-southeast-2 (Singapore)  
**URL:** `https://fziaxuhonvrhqjulhcyu.supabase.co`  
**Anon key:** Get from Jeevan — do NOT hardcode, use `.env`

---

## Database Schema to Create

Run these migrations in Supabase SQL Editor (or add to `supabase/migrations/`):

```sql
-- Dashboard data store
-- Simple key-value store mirroring the current localStorage structure
-- This lets us do a minimal migration without rewriting all page logic

CREATE TABLE IF NOT EXISTS dashboard_store (
  id          BIGSERIAL PRIMARY KEY,
  store_key   TEXT NOT NULL UNIQUE,   -- maps to SK.tasks, SK.clients, etc.
  store_value JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_by  TEXT DEFAULT 'system'
);

-- RLS: all founders can read and write
ALTER TABLE dashboard_store ENABLE ROW LEVEL SECURITY;

CREATE POLICY "founders_all" ON dashboard_store
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast key lookups
CREATE INDEX idx_dashboard_store_key ON dashboard_store(store_key);

-- Trigger to update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dashboard_store_updated
  BEFORE UPDATE ON dashboard_store
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

> **Note:** We use a simple key-value store (`dashboard_store`) to mirror the existing `localStorage` keys. This is the minimal-change approach. Future refactor (proper normalized tables) is a separate issue.

---

## Files to Change

### 1. `core.js` — Replace `DB` object

Replace the existing `DB` const with an async Supabase-backed version:

```js
// NEW core.js — top of file
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL  = window._env?.SUPABASE_URL  || '<injected at build>';
const SUPABASE_KEY  = window._env?.SUPABASE_ANON || '<injected at build>';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Async DB — replaces the synchronous localStorage version
const DB = {
  async get(key) {
    const { data, error } = await supabase
      .from('dashboard_store')
      .select('store_value')
      .eq('store_key', key)
      .single();
    if (error || !data) return null;
    return data.store_value;
  },

  async set(key, val) {
    await supabase
      .from('dashboard_store')
      .upsert({ store_key: key, store_value: val }, { onConflict: 'store_key' });
  },

  async del(key) {
    await supabase
      .from('dashboard_store')
      .delete()
      .eq('store_key', key);
  },
};
```

> **Important:** `DB.get()` and `DB.set()` become async. Every call site in `core.js`, `page-taskboard.js`, `page-clients.js`, `page-docs.js`, `page-backend.js`, `page-anal.js` that calls `DB.get()` or `DB.set()` must be updated to `await DB.get()` / `await DB.set()` — the calling functions must become `async` as well.

### 2. `core.js` — Add Realtime subscription

Add after the `DB` object definition:

```js
// Realtime — re-render task board when any device changes tasks
supabase
  .channel('dashboard-tasks')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'dashboard_store', filter: `store_key=eq.${SK.tasks}` },
    () => {
      if (typeof renderTaskboard === 'function') renderTaskboard();
    }
  )
  .subscribe();
```

### 3. `index.html` — Add env config script

Before the `<script src="core.js">` tag, add:

```html
<script>
  // Injected by Vercel environment or manually for local dev
  window._env = {
    SUPABASE_URL:  '<NEXT_PUBLIC_SUPABASE_URL>',
    SUPABASE_ANON: '<NEXT_PUBLIC_SUPABASE_ANON_KEY>'
  };
</script>
```

For Vercel, use environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — set in Vercel project settings.

### 4. New file: `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 5. New file: `package.json` (minimal, for Vercel)

```json
{
  "name": "friction-dashboard",
  "version": "1.0.0",
  "scripts": {
    "dev": "npx serve .",
    "build": "echo 'static site, no build step'"
  }
}
```

---

## Migration: Seed Existing Default Data

On first load, if `dashboard_store` is empty, seed the defaults from `core.js` (the `DEFAULT_TASKS`, `DEFAULT_CLIENTS`, etc.) into Supabase. Modify `initDefaults()`:

```js
async function initDefaults() {
  const existing = await DB.get(SK.tasks);
  if (!existing) await DB.set(SK.tasks, DEFAULT_TASKS);

  const members = await DB.get(SK.members);
  if (!members) await DB.set(SK.members, DEFAULT_MEMBERS);

  // ... repeat for all SK keys
}
```

---

## Acceptance Criteria

- [ ] Open dashboard on laptop → add a task → see it appear on phone within 3 seconds (no refresh)
- [ ] Open dashboard on phone → check off a task → pipeline progress bar updates on laptop
- [ ] Refresh the page → all data persists (not reset to defaults)
- [ ] Three team members (M, J, B) can all view and edit tasks simultaneously
- [ ] Dashboard deployed to Vercel and accessible at a public URL
- [ ] No API keys hardcoded in any file
- [ ] No `.env` file committed to git
- [ ] PR passes CI (lint check + no console errors in browser)

---

## UI Redesign Spec — Task Board Only

The CTO has built a full HTML prototype: `taskboard-prototype.html` in this repo. Use it as your exact visual reference. Below are the design decisions that must be preserved in the final implementation.

### Design Language — "Friction Warm"

> **Philosophy:** Friction = contact, heat, texture. Light parchment base, deep terracotta accent. Soft 3D depth through warm shadows — not glows or gradients. Feels like it came from a branding studio, not a dark-mode template.

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#F7F4F0` | Page background (warm parchment) |
| `--bg-surface` | `#FFFFFF` | Cards, panels (white with warm shadow) |
| `--bg-sidebar` | `#EDE9E4` | Sidebar background (warm taupe) |
| `--bg-hover` | `#F0EBE5` | Hover states |
| `--accent` | `#C4522A` | Deep terracotta — primary buttons, active states |
| `--accent-soft` | `#E07C56` | Copper — secondary text accents |
| `--accent-mute` | `rgba(196,82,42,0.08)` | Tinted backgrounds |
| `--text-1` | `#1C1816` | Primary text (warm near-black) |
| `--text-2` | `#7A7168` | Secondary / muted |
| `--text-3` | `#B0A89F` | Placeholders, labels |
| `--border` | `rgba(60,30,10,0.08)` | Subtle warm borders |
| `--shadow-sm` | `0 1px 3px rgba(60,30,10,0.07)` | Card elevation |
| `--shadow-md` | `0 4px 16px rgba(60,30,10,0.08)` | Hover elevation |
| Priority red | `#C92B2B` | Do Now (strong red, light-bg readable) |
| Priority amber | `#B45309` | Delegate (warm amber/brown) |
| Priority blue | `#1D4ED8` | Schedule (strong blue) |
| Priority green | `#15803D` | Do Last (forest green) |
| M accent | `#C92B2B` (red) | CEO member colour |
| J accent | `#C4522A` (terracotta) | CTO member colour |
| B accent | `#15803D` (forest green) | CIO member colour |

**Font stack:** `Inter` (body), `JetBrains Mono` (data, numbers, dates, badges)

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  TOPBAR: Logo | Nav tabs | Day badge | Avatars | +Add │
├──────────────┬──────────────────────────────────────┤
│  SIDEBAR     │  PAGE HEADER (title + collapse/expand) │
│  ─ All       │  ────────────────────────────────────  │
│  ─ M/J/B     │  PIPELINE TRACK (step dots + arrows)   │
│  ─ Priority  │  ────────────────────────────────────  │
│  ─ Stage     │  STATS ROW (6 mini stat cards)         │
│              │  ────────────────────────────────────  │
│              │  TOOLBAR (member chips | priority chips │
│              │           | search box | view toggle)   │
│              │  ────────────────────────────────────  │
│              │  BOARD (collapsible phase groups)       │
│              │    ▸ Phase header (color bar, progress) │
│              │      Col headers (Task/Priority/Assign  │
│              │                  /Due/Stage/Actions)    │
│              │      Task rows (checkbox + inline data) │
│              │      + Add task row                     │
└──────────────┴──────────────────────────────────────┘
```

### Key UI Behaviours
- **Phase groups** are collapsible — click header to toggle; chevron rotates on open
- **Task rows** show action buttons (Edit / Delegate / Delete) only on hover — hidden by default
- **Pipeline** uses animated pulse dot on active stage (CSS keyframe ring pulse, not glow)
- **Topbar** is `position:sticky` with `backdrop-filter:blur(20px)` — floats over content on scroll
- **+ Add Task button** is solid terracotta with warm box-shadow on hover; no gradient
- **Status chips** are pill-shaped with coloured background + matching border
- **Auto-assign preview** appears in modal as user types the task title
- **Stat cards** lift on hover (`transform: translateY(-1px)` + `shadow-md`) — soft 3D feel
- **Member avatar** colours: M=deep red, J=terracotta (accent), B=forest green (consistent throughout)
- **Shadows** use warm tones `rgba(60,30,10,...)` — NOT cold blue shadows

### What Stays the Same (do NOT change)
- All JavaScript logic (auto-assign, auto-priority, CRUD)
- Page navigation (tabs)
- All other pages (Analytics, Clients, Docs, Backend) — Task Board redesign ONLY in this PR
- Data structures and task schema

---

## Out of Scope (Do NOT do in this PR)

- Normalizing the DB schema (proper relational tables per entity) — future issue
- Authentication / login system — future issue
- Changing any logic, only the Task Board visual layer and localStorage→Supabase migration
- Migrating the `page-anal.js` KPI charts — can stay on localStorage for now (KPI data is personal, not shared)

---

## Testing Instructions

1. Deploy to Vercel (or use `npx serve .` locally with two browser tabs/windows)
2. Open the dashboard in Chrome on your laptop
3. Open the same URL in Chrome on your phone (or second browser tab)
4. Add a task on one — confirm it appears on the other within 3 seconds
5. Check off a task on one — confirm the pipeline bar updates on the other
6. Hard-refresh both — confirm all data is still there

---

## Files Changed Summary

| File | Change |
|---|---|
| `core.js` | Replace `DB` object; make all CRUD functions async; add Realtime subscription |
| `page-taskboard.js` | `await` all `DB.get/set` calls; make functions async |
| `page-clients.js` | `await` all `DB.get/set` calls; make functions async |
| `page-docs.js` | `await` all `DB.get/set` calls; make functions async |
| `page-backend.js` | `await` all `DB.get/set` calls; make functions async |
| `page-anal.js` | Leave on localStorage for now (KPI is personal data) |
| `index.html` | Add `window._env` config block before scripts |
| `vercel.json` | New file — routing config |
| `package.json` | New file — minimal for Vercel |
| `supabase/migrations/001_dashboard_store.sql` | New file — DB migration |

---

## Notes from CTO

- The `DB` abstraction was already there — whoever built this knew it would need to migrate. Good code.
- Don't over-engineer the schema. Key-value store for now. Clean relational schema is Issue #2.
- If you hit async/await cascading issues in a complex render function, wrap with `.then()` as a fallback rather than blocking the whole render chain.
- Supabase Realtime free tier handles 200 concurrent connections — more than enough.
- Use `supabase-js v2` (not v1) — import from CDN for now, no build step needed.

Questions? Comment on this Issue. Do not DM — keep all technical discussion here so it's documented.
