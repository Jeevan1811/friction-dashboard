# Friction Startup OS — Project Status
> Migration-ready snapshot. Any AI tool or developer can pick this up from here.
> Last updated: 2026-06-11

---

## Project Goal

Internal SaaS dashboard for Jeevan + Barat, 2-person founding team at Friction (Malaysian tech startup).
Combines task management (Kanban), KPI tracking, CRM, invoicing, and workspace settings in one app.
Think Monday.com × Productive.io, custom-built on Supabase.

---

## What's Built ✅

| Feature | Status | Notes |
|---|---|---|
| Vite 5 + React 18 scaffold | ✅ Done | JSX only, no TypeScript |
| react-router-dom v6 routing | ✅ Done | 5 routes wired |
| Supabase integration | ✅ Done | Real-time subscriptions active |
| Dark UI redesign (v5) | ✅ Done | Matches CEO's taskboard-demo.html reference |
| Sidebar (dark glassmorphism) | ✅ Done | NavLink active states, team section |
| TaskBoard (Kanban) | ✅ Done | @dnd-kit drag-drop, 4 columns, real-time |
| Task cards | ✅ Done | Priority pills, colored top-border, member rings |
| Task modal | ✅ Done | Create + edit, phase selector, date |
| Analytics page | ✅ Done | chart.js SHS charts, dark topbar |
| Clients page | ✅ Done | CRM table + dark topbar |
| Docs/Invoices page | ✅ Done | Invoice builder + dark topbar |
| Backend/Settings page | ✅ Done | 5 tabs, dark topbar |
| Pipeline strip | ✅ Done | 7-stage startup pipeline in Board.jsx |

## What's Pending 🔴

| Feature | Priority | Owner | Section in BARAT.md |
|---|---|---|---|
| Supabase Auth (magic link) | P1 | Barat | 6A |
| List/Table view toggle | P1 | Barat | 6B |
| Recursive subtasks | P2 | Barat | 6C |
| Auto-assign engine | P2 | Barat | 6D |
| Auto-priority engine | P2 | Barat | 6E |
| Delegate modal | P2 | Barat | 6F |
| Task comments | P2 | Barat | 6G |
| File attachments | P2 | Barat | 6H |
| CI/CD (GitHub Actions → Vercel) | P3 | Both | 6 Infra |
| Error tracking (Sentry) | P3 | Barat | 6 Infra |
| Phase-grouped view | P4 | Barat | 6 Advanced |
| Gantt chart | P4 | Barat | 6 Advanced |
| Mobile / PWA | P4 | Barat | 6 Advanced |
| Client portal | P4 | Both | 6 Advanced |

---

## Tech Stack

```
Frontend:     Vite 5.x + React 18.x (JSX, no TypeScript)
Router:       react-router-dom 6.x  (createBrowserRouter)
Drag-Drop:    @dnd-kit/core + @dnd-kit/sortable
Charts:       chart.js 4.x + react-chartjs-2 5.x
Database:     Supabase (PostgreSQL 15 + real-time)
Auth:         Supabase (magic-link — PENDING)
Fonts:        Space Grotesk (headings) · Inter (body) · JetBrains Mono (mono)
Package mgr:  npm
Node version: 18+
```

---

## Repository

```
URL:     https://github.com/Jeevan1811/friction-dashboard
Branch:  feature/dashboard-supabase   ← active dev branch
main:    stable / production (merge when features are solid)
```

---

## Supabase Project

```
Project ID:   fziaxuhonvrhqjulhcyu
Region:       ap-southeast-1 (Singapore)
URL:          https://fziaxuhonvrhqjulhcyu.supabase.co
Anon key:     stored in config.js (NOT committed — ask Jeevan)
Service key:  NEVER use client-side
```

Tables:
- `friction_tasks` — Kanban tasks
- `friction_kpi` — SHS / KPI data points
- `friction_clients` — Client CRM
- `friction_invoices` — Invoice records
- `friction_task_comments` — 🔴 TO CREATE (see BARAT.md 6G)

RLS: **enabled on all tables**. Policies use `FOR ALL TO anon USING (true)` for now; tighten after auth is added (user-based policies).

---

## Local Setup

```bash
git clone https://github.com/Jeevan1811/friction-dashboard.git
cd friction-dashboard
git checkout feature/dashboard-supabase
cd taskboard-app
npm install
cp src/config.example.js src/config.js
# Edit config.js with real SUPABASE_URL and SUPABASE_ANON_KEY
npm run dev
# → http://localhost:5173
```

config.js format:
```js
export const SUPABASE_URL = 'https://fziaxuhonvrhqjulhcyu.supabase.co'
export const SUPABASE_ANON_KEY = '<ask Jeevan>'
```

---

## Push Workflow (Windows)

```bash
cd C:\Users\Asus\Documents\friction-sdn-bhd\friction-dashboard-dev
DO_PUSH.bat
# Check push_log.txt for "Exit code: 0"
```

---

## Design System Quick Reference

```css
/* index.css tokens — v5 Dark Edition */
--bg: #0a0c12;          /* page background */
--sf-1: #12151f;        /* cards */
--sf-2: #1a1e2c;        /* modals / dropdowns */
--sf-3: #0e111a;        /* input backgrounds */
--t1: #f2f4f8;          /* primary text */
--t2: #c8cdd8;          /* secondary text */
--t3: #8b93a7;          /* muted text */
--accent: #6366f1;      /* indigo */
--accent2: #a855f7;     /* purple */
--red: #f43f5e;         /* critical / Do Now */
--yellow: #f59e0b;      /* high / Delegate */
--blue: #38bdf8;        /* medium / Schedule */
--green: #34d399;       /* low / Do Last */
--font-head: 'Space Grotesk', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

---

## Key Files

| File | Purpose |
|---|---|
| `taskboard-app/src/lib/supabase.js` | Supabase client initialisation |
| `taskboard-app/src/lib/db.js` | All database helper functions |
| `taskboard-app/src/data.js` | MEMBERS, PHASES, initial task data |
| `taskboard-app/src/index.css` | All CSS — design tokens + component classes |
| `taskboard-app/src/components/Board.jsx` | Kanban + PipelineStrip + stats |
| `taskboard-app/src/components/Card.jsx` | Draggable task card |
| `taskboard-app/src/components/Modal.jsx` | Task create/edit dialog |
| `taskboard-app/src/components/Sidebar.jsx` | Left navigation |
| `BARAT.md` | Full developer handover doc |
| `DO_PUSH.bat` | Git push script (Windows) |
| `config.js` | 🔴 GITIGNORED — local only, never commit |

---

## Security Constraints

- ❌ Never commit `config.js`
- ❌ Never use Supabase service role key client-side
- ❌ Never disable RLS on any table
- ❌ No string-concatenated SQL
- ✅ Parameterised queries only (Supabase JS client handles this)
- ✅ All new tables must have RLS + policy

---

## Contacts

| Person | Role | Responsibility |
|---|---|---|
| Jeevan (J) | Co-founder / Tech Lead | Architecture, infra, Supabase, final approval |
| Barat (B) | Co-founder / Frontend Dev | Feature implementation, UI, daily pushes |
