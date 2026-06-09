# Issue #1 — Replace localStorage with Supabase + Realtime

**Status:** Open  
**Assigned to:** Dev (collaborator)  
**Opened by:** CTO (J)  
**Branch:** `feature/dashboard-supabase`  
**Priority:** 🔴 High — blocks all multi-device use and live demos  
**Supabase project:** `fziaxuhonvrhqjulhcyu` · `https://fziaxuhonvrhqjulhcyu.supabase.co`

---

## 1. Background & Problem

The dashboard (`friction-dashboard`) is a 5-page vanilla JS app. Every piece of data — tasks, clients, invoices, KPI entries, company info, members, keywords, templates, roles — lives in `localStorage`. This means:

- Data is **browser-local**: change a task on your phone, your laptop sees nothing
- **No real-time sync**: founders M, J, and B cannot collaborate live
- Data is **ephemeral**: cleared by the browser at any time
- **Not demoable**: cannot show a live, multi-device dashboard to a client or investor

The fix is contained and architectural groundwork is already done. `core.js` wraps every storage call behind a single `DB` object with three methods: `get`, `set`, `del`. We replace that object with Supabase calls and add one Realtime subscription. Everything else inherits the fix.

---

## 2. Architecture Decision

We use a **key-value store pattern** in Supabase — one table (`dashboard_store`) with `store_key` (matching the existing `SK.*` constants) and `store_value` (JSONB array/object). This is the minimal-change migration: zero data model changes to page logic, only the transport layer changes.

Proper relational tables (tasks as rows, clients as rows, etc.) are a future refactor. Do not propose or implement them in this PR.

---

## 3. Supabase Setup

### 3.1 Database Migration

Create file `supabase/migrations/001_dashboard_store.sql` with the following content. Also paste into the Supabase SQL Editor and run it.

```sql
-- =====================================================
-- Migration 001: dashboard_store
-- Key-value table mirroring localStorage SK.* keys
-- =====================================================

CREATE TABLE IF NOT EXISTS public.dashboard_store (
  id          BIGSERIAL PRIMARY KEY,
  store_key   TEXT        NOT NULL UNIQUE,
  store_value JSONB       NOT NULL DEFAULT 'null'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  TEXT        NOT NULL DEFAULT 'system'
);

ALTER TABLE public.dashboard_store ENABLE ROW LEVEL SECURITY;

CREATE POLICY "founders_read_write" ON public.dashboard_store
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_dashboard_store_key
  ON public.dashboard_store (store_key);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_dashboard_store_updated
  BEFORE UPDATE ON public.dashboard_store
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

**Verify after running:** `SELECT * FROM dashboard_store;` should return 0 rows and no error.

### 3.2 Key Mapping

These are the `SK.*` constants in `core.js` that will become `store_key` values:

| JS Constant | `store_key` value | Data type | Notes |
|---|---|---|---|
| `SK.tasks` | `sd_tasks_v1` | Array of task objects | 31 default items |
| `SK.kpi` | `sd_kpi_v1` | Array of KPI entry objects | |
| `SK.clients` | `sd_clients_v1` | Array of client objects | |
| `SK.clientTasks` | `sd_ctasks_v1` | Array of client task objects | |
| `SK.invoices` | `sd_invoices_v1` | Array of invoice objects | |
| `SK.members` | `sd_members_v1` | Array of member objects | |
| `SK.roles` | `sd_roles_v1` | Array of role objects | |
| `SK.keywords` | `sd_keywords_v1` | Array of keyword objects | |
| `SK.templates` | `sd_templates_v1` | Object keyed by client ID | |
| `SK.docTypes` | `sd_doctypes_v1` | Array of doc type objects | |
| `SK.backendTasks` | `sd_btasks_v1` | Array of backend task objects | |
| `SK.company` | `sd_company_v1` | Single object | |

---

## 4. File Changes

### 4.1 `index.html` — Add env config + module types

**Before** `<script src="core.js">`, insert:

```html
<!-- Supabase env — values injected by Vercel or set here for local dev -->
<script>
  window._env = {
    SUPABASE_URL:  'https://fziaxuhonvrhqjulhcyu.supabase.co',
    SUPABASE_ANON: 'REPLACE_WITH_ANON_KEY'
  };
</script>
```

**Change all script tags to `type="module"`:**

```html
<script type="module" src="core.js"></script>
<script type="module" src="page-taskboard.js"></script>
<script type="module" src="page-anal.js"></script>
<script type="module" src="page-clients.js"></script>
<script type="module" src="page-docs.js"></script>
<script type="module" src="page-backend.js"></script>
```

**Update the boot script** (the inline `<script>` at the bottom of body):

```js
// BEFORE (synchronous — breaks with async DB):
initDefaults();
updateNavDate();
setInterval(updateNavDate, 60000);
renderTaskboard();

// AFTER (async boot):
(async () => {
  await initDefaults();
  updateNavDate();
  setInterval(updateNavDate, 60000);
  await renderTaskboard();
})();
```

Also change this inline script to `type="module"`.

### 4.2 `core.js` — Full changes

#### a) Add Supabase import at the top

```js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const _supa = createClient(
  window._env?.SUPABASE_URL  || '',
  window._env?.SUPABASE_ANON || ''
);
```

> **ESM note:** Adding `import` makes `core.js` an ES module. All functions it exports must be explicitly `export`ed, and each `page-*.js` must `import` them. Attach shared globals (e.g. `SK`, `DB`, helpers) to `window` only as a last resort — explicit exports are cleaner.

#### b) Replace the `DB` object (lines ~27–30 in current core.js)

```js
// REMOVE:
const DB = {
  get(key){ try{ return JSON.parse(localStorage.getItem(key)); }catch(e){ return null; } },
  set(key,val){ try{ localStorage.setItem(key,JSON.stringify(val)); }catch(e){} },
  del(key){ try{ localStorage.removeItem(key); }catch(e){} },
};

// REPLACE WITH:
const DB = {
  async get(key) {
    try {
      const { data, error } = await _supa
        .from('dashboard_store')
        .select('store_value')
        .eq('store_key', key)
        .single();
      if (error || !data) return null;
      return data.store_value;
    } catch (e) {
      console.error('[DB.get] error:', e);
      return null;
    }
  },

  async set(key, val) {
    try {
      const { error } = await _supa
        .from('dashboard_store')
        .upsert(
          { store_key: key, store_value: val },
          { onConflict: 'store_key' }
        );
      if (error) console.error('[DB.set] error:', error);
    } catch (e) {
      console.error('[DB.set] error:', e);
    }
  },

  async del(key) {
    try {
      const { error } = await _supa
        .from('dashboard_store')
        .delete()
        .eq('store_key', key);
      if (error) console.error('[DB.del] error:', error);
    } catch (e) {
      console.error('[DB.del] error:', e);
    }
  },
};
```

#### c) Add Realtime subscription (immediately after the `DB` object)

```js
_supa
  .channel('dashboard-live')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'dashboard_store' },
    (payload) => {
      const key = payload.new?.store_key || payload.old?.store_key;
      if (key === SK.tasks       && typeof renderTaskboard === 'function') renderTaskboard();
      if (key === SK.clients     && typeof renderClients   === 'function') renderClients();
      if (key === SK.clientTasks && typeof renderClients   === 'function') renderClients();
      if (key === SK.invoices    && typeof renderDocs      === 'function') renderDocs();
      if (key === SK.backendTasks && typeof renderBackend  === 'function') renderBackend();
    }
  )
  .subscribe((status) => {
    if (status === 'SUBSCRIBED')   console.log('[Realtime] connected');
    if (status === 'CHANNEL_ERROR') console.error('[Realtime] channel error — check Supabase RLS');
  });
```

#### d) All functions in `core.js` that call `DB.*` — make async

| Function | Change |
|---|---|
| `initDefaults()` | `async` — `await` every `DB.get` and `DB.set` |
| `autoInvoiceNo()` | `async` — `await DB.get(SK.invoices)` |
| `refreshBackendTasks()` | `async` — `await` all `DB.get` / `DB.set` |
| `autoAssign()` | `async` — `await DB.get(SK.keywords)`, `await DB.get(SK.members)`, `await DB.get(SK.roles)` |
| `getTasks()` | `async` — `await DB.get(SK.tasks)` |
| `saveTask()` | `async` — `await getTasks()`, `await DB.set(...)` |
| `deleteTask()` | `async` — `await getTasks()`, `await DB.set(...)` |
| `toggleTaskDone()` | `async` — chain of `await` calls |
| `getClientTasks()` | `async` — `await DB.get(SK.clientTasks)` |
| `saveClientTask()` | `async` — `await DB.get`, `await DB.set` |
| `deleteClientTask()` | `async` — `await DB.get`, `await DB.set` |
| `getClients()` | `async` — `await DB.get(SK.clients)` |
| `saveClient()` | `async` — `await getClients()`, `await DB.set`, `await refreshBackendTasks()` |
| `deleteClient()` | `async` — `await getClients()`, `await DB.set` |
| `getInvoices()` | `async` — `await DB.get(SK.invoices)` |
| `saveInvoice()` | `async` — `await DB.get`, `await DB.set` |
| `getMember()` | `async` — `await DB.get(SK.members)` |
| `getActiveMembers()` | `async` — `await DB.get(SK.members)` |
| `memberTag()` | `async` — `await DB.get(SK.members)` |

> **`memberTag()` gotcha:** This is called inline inside template literal strings (e.g. `card.innerHTML = \`${memberTag(id)}\``). Once async it cannot be interpolated directly. Fix: pre-fetch members once at the top of each render function and pass as a parameter — `memberTag(id, members)` stays sync and receives pre-fetched data.

#### e) Pre-fetch pattern — use this in all render functions

```js
// Fetch all needed data at the TOP of each render function
async function renderTaskboard() {
  const tasks   = await getTasks();
  const members = await getActiveMembers();
  buildPipelineTB(tasks);
  buildStatsTB(tasks);
  buildBoardTB(tasks, members);  // pass data down; sub-functions stay sync
}
```

This prevents waterfall fetches and keeps template-building code free of async complexity.

### 4.3 `page-taskboard.js` — Changes

| Function | Change |
|---|---|
| `renderTaskboard()` | `async` — pre-fetch tasks + members at top |
| `buildPipelineTB()` | Receives tasks as parameter — stays sync |
| `buildStatsTB()` | Receives tasks as parameter — stays sync |
| `buildBoardTB()` | Receives tasks + members as parameters — stays sync |
| `buildTaskCardTB()` | Receives task + members as parameters — stays sync |
| `tbToggleDone()` | `async` — `await toggleTaskDone(id)` |
| `tbSaveNewTask()` | `async` — `await autoAssign()`, `await saveTask()`, `await renderTaskboard()` |
| `tbSaveEditTask()` | `async` — `await getTasks()`, `await saveTask()`, `await renderTaskboard()` |
| `tbDeleteTask()` | `async` — `await deleteTask()`, `await renderTaskboard()` |
| `tbSaveDelegate()` | `async` — `await getTasks()`, `await saveTask()`, `await renderTaskboard()` |
| `tbOpenAddTask()` | `async` — `await getActiveMembers()` before opening modal |
| `tbEditTask()` | `async` — `await getTasks()`, `await getActiveMembers()` |

### 4.4 `page-clients.js`, `page-docs.js`, `page-backend.js`

Apply the same pre-fetch pattern: make render functions `async`, pre-fetch at the top, `await` all CRUD calls. Identical pattern — no new logic.

**`page-anal.js`** — leave on `localStorage`. Out of scope.

### 4.5 New file: `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 4.6 New file: `package.json`

```json
{
  "name": "friction-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "npx serve .",
    "build": "echo 'static site — no build step'"
  }
}
```

### 4.7 New file: `.env.example`

```
SUPABASE_URL=https://fziaxuhonvrhqjulhcyu.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

Add `.env` to `.gitignore`. Commit `.env.example`.

---

## 5. Data Seeding — First Boot

`initDefaults()` checks if each key exists and seeds defaults if not. Pattern stays the same, now async:

```js
async function initDefaults() {
  if (!await DB.get(SK.members))      await DB.set(SK.members,      DEFAULT_MEMBERS);
  if (!await DB.get(SK.keywords))     await DB.set(SK.keywords,     DEFAULT_KEYWORDS);
  if (!await DB.get(SK.docTypes))     await DB.set(SK.docTypes,     DEFAULT_DOC_TYPES);
  if (!await DB.get(SK.company))      await DB.set(SK.company,      DEFAULT_COMPANY);
  if (!await DB.get(SK.tasks))        await DB.set(SK.tasks,        DEFAULT_TASKS);
  if (!await DB.get(SK.clients))      await DB.set(SK.clients,      DEFAULT_CLIENTS);
  if (!await DB.get(SK.clientTasks))  await DB.set(SK.clientTasks,  []);
  if (!await DB.get(SK.invoices))     await DB.set(SK.invoices,     []);
  if (!await DB.get(SK.kpi))          await DB.set(SK.kpi,          []);
  if (!await DB.get(SK.templates))    await DB.set(SK.templates,    {});
  if (!await DB.get(SK.roles))        await DB.set(SK.roles,        DEFAULT_ROLES);
  if (!await DB.get(SK.backendTasks)) await DB.set(SK.backendTasks, generateBackendTasks());
}
```

> **Must be `await`ed in the boot script** (§4.1). If not awaited, pages render before data seeds and show empty boards.

---

## 6. UI Redesign — Task Board Only

The CTO has built `taskboard-prototype.html` in this repo. Use it as your **exact visual reference**. Scope is limited to the task board view — all other pages keep their current design.

### Design Tokens — "Friction Warm"

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#F7F4F0` | Page background (warm parchment) |
| `--bg-surface` | `#FFFFFF` | Cards, panels |
| `--bg-sidebar` | `#EDE9E4` | Sidebar |
| `--accent` | `#C4522A` | Terracotta — buttons, active nav |
| `--text-1` | `#1C1816` | Primary text |
| `--text-2` | `#7A7168` | Muted |
| `--border` | `rgba(60,30,10,0.08)` | Warm borders |
| `--shadow-sm` | `0 1px 3px rgba(60,30,10,0.07)` | Card resting |
| `--shadow-md` | `0 4px 16px rgba(60,30,10,0.08)` | Card hover |
| Priority red | `#C92B2B` | Do Now |
| Priority amber | `#B45309` | Delegate |
| Priority blue | `#1D4ED8` | Schedule |
| Priority green | `#15803D` | Do Last |
| M colour | `#C92B2B` | CEO — deep red |
| J colour | `#C4522A` | CTO — terracotta |
| B colour | `#15803D` | CIO — forest green |

**Fonts:** `Inter` (body) + `JetBrains Mono` (data, numbers, dates)

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ TOPBAR (sticky blur): Logo | Tabs | Day badge | Avatars  │
├───────────────┬──────────────────────────────────────────┤
│ SIDEBAR       │ PAGE HEADER                              │
│ · All Tasks   │ PIPELINE (step dots + connectors)        │
│ · M / J / B   │ STATS ROW (6 mini cards)                 │
│ · Priority    │ TOOLBAR (member chips + priority + search│
│ · Stage       │ BOARD (collapsible phase groups)         │
│               │   ▸ Phase header (color bar, progress %) │
│               │     Task rows (checkbox + inline data)   │
│               │     + Add task row at bottom             │
└───────────────┴──────────────────────────────────────────┘
```

### Key Behaviours
- Phase groups collapsible — chevron rotates; collapse state in memory
- Task row actions (Edit / Delegate / Delete) hidden by default, visible on hover
- Pipeline uses CSS keyframe pulse ring on the active stage dot — no glow
- Topbar `position:sticky` with `backdrop-filter:blur(20px)`
- `+ Add Task` is solid terracotta, warm shadow on hover, no gradient
- Stat cards: `translateY(-1px)` + `shadow-md` on hover
- All shadows: `rgba(60,30,10,...)` warm tones — no cold blue

---

## 7. Out of Scope

- Relational schema (proper tables per entity) — Issue #2
- Authentication / login — Issue #3
- Any change to `page-anal.js` (KPI stays on localStorage)
- Any changes to the JV CRM bot project

---

## 8. Acceptance Criteria

- [ ] Add a task on laptop → appears on phone within 3 seconds (no refresh)
- [ ] Check off a task on phone → pipeline bar updates on laptop
- [ ] Add a client on one device → Clients page reflects it on the other device
- [ ] Hard-refresh → all data persists (not reset to defaults)
- [ ] Fresh Supabase project (empty `dashboard_store`) → opening dashboard seeds all defaults and renders correctly
- [ ] `grep -r "eyJ" .` returns no matches in committed files (no hardcoded anon key)
- [ ] `.env` is in `.gitignore` and not in the PR diff
- [ ] No console errors on load or during normal use
- [ ] Dashboard deployed to a public Vercel URL
- [ ] `page-anal.js` KPI recording still works (localStorage path untouched)
- [ ] Auto-assign, auto-priority, delegate, pipeline — all work identically to before
- [ ] Every commit message references this issue: `feat: description (#1)`

---

## 9. Testing Instructions

1. `npx serve .` locally
2. Open `http://localhost:3000` in Chrome and Firefox (or two separate browser profiles)
3. Add a task in Chrome → confirm it appears in Firefox within 3 seconds
4. Check off a task in Firefox → confirm pipeline bar changes in Chrome
5. Close both, reopen → confirm data persists
6. Deploy to Vercel, repeat on phone + laptop

---

## 10. Known Gotchas

**Async cascade:** Making `DB.get`/`DB.set` async cascades all the way up. Every function that calls them — and every function that calls those functions — must be `async`. Trace the full call chain. One missed `await` causes silent race conditions.

**`type="module"` required for ESM import:** Module scripts are deferred and scoped. Functions declared in `core.js` must be `export`ed and `import`ed in each page file. They will not be auto-global.

**`memberTag()` in template literals:** Once async, it can't be interpolated directly. Fix: pre-fetch members once at the top of the render function, pass as a parameter, keep `memberTag(id, members)` synchronous.

**`autoInvoiceNo()` is called in `page-docs.js`:** It calls `DB.get(SK.invoices)`. Make it async and await it at the call site (in the "New Invoice" modal open handler).

**Boot timing:** The async IIFE in §4.1 is mandatory. Without `await initDefaults()`, the board renders before data is seeded and will be empty on first load.

**Supabase upsert:** The `store_key` column has a UNIQUE constraint. Use `upsert` with `onConflict: 'store_key'`. Make sure you are on `supabase-js` v2 — v1 syntax differs.

---

## 11. Files Changed Summary

| File | Change |
|---|---|
| `core.js` | Replace `DB` with async Supabase version; add import + Realtime; make all CRUD async; export public functions |
| `page-taskboard.js` | Make all render/CRUD functions async; pre-fetch pattern; UI redesign per prototype |
| `page-clients.js` | Make all render/CRUD functions async; pre-fetch pattern |
| `page-docs.js` | Make all render/CRUD functions async; await `autoInvoiceNo()` |
| `page-backend.js` | Make all render/CRUD functions async; pre-fetch pattern |
| `page-anal.js` | **No change** — KPI stays on localStorage |
| `index.html` | Add `window._env` block; `type="module"` on all scripts; async boot IIFE |
| `style.css` | Add Friction Warm tokens; update task board styles per prototype |
| `supabase/migrations/001_dashboard_store.sql` | New file — DB migration |
| `vercel.json` | New file |
| `package.json` | New file (minimal) |
| `.env.example` | New file |
| `.gitignore` | Add `.env` if not present |

---

## 12. Notes from CTO

The `DB` abstraction was there by design — this migration is surgical. If you find yourself rewriting page logic rather than wrapping calls in `await`, stop and raise it in the Issue.

Use `supabase-js v2` from CDN — no build step needed for this project.

Use the pre-fetch pattern (§4.2e) for all render functions. Don't scatter `await` calls inside template-building code.

Don't optimise. Don't refactor. Don't normalise the schema. Ship working multi-device sync first, iterate after.

Questions go in this Issue — not DMs.
