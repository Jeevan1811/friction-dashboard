# Friction Startup OS — Barat's Dev Guide

Hey B — everything you need to get the app running and pick up your tasks.

---

## Quick Start (5 minutes)

**Prerequisites:** Node 18+, Git

```bash
# 1. Clone the repo (if you haven't already)
git clone https://github.com/Jeevan1811/friction-dashboard.git
cd friction-dashboard

# 2. Checkout the working branch
git checkout feature/dashboard-supabase

# 3. Install dependencies
cd taskboard-app
npm install

# 4. Create the local config file (NEVER commit this)
cp src/config.example.js src/config.js
# Open src/config.js and fill in:
#   SUPABASE_URL = 'https://fziaxuhonvrhqjulhcyu.supabase.co'
#   SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aWF4dWhvbnZyaHFqdWxoY3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NjQ2MzYsImV4cCI6MjA5NTM0MDYzNn0.QIYeXomnXXGKvkP-dkjwqe3mnDYTdN9zgcvlYlhM2Xk'

# 5. Run the dev server
npm run dev
# App opens at http://localhost:5173
```

---

## Project Structure

```
taskboard-app/
├── src/
│   ├── pages/
│   │   ├── TaskBoard.jsx    ← Kanban board (Supabase real-time)
│   │   ├── Analytics.jsx    ← SHS/KPI charts
│   │   ├── Clients.jsx      ← Client CRM
│   │   ├── Docs.jsx         ← Invoice builder
│   │   └── Backend.jsx      ← Settings
│   ├── components/
│   │   ├── Sidebar.jsx      ← Left nav
│   │   ├── Board.jsx        ← Board layout + stat cards + filters
│   │   ├── Card.jsx         ← Task card (draggable)
│   │   ├── Modal.jsx        ← Task create/edit dialog
│   │   └── CommandPalette.jsx ← Cmd+K search
│   ├── lib/
│   │   ├── supabase.js      ← Supabase client
│   │   └── db.js            ← All data layer functions
│   ├── data.js              ← MEMBERS, PHASES, INITIAL_TASKS
│   └── index.css            ← Design tokens + keyframes
```

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `friction_tasks` | Task board data — real-time synced |
| `friction_kpi` | Analytics KPI entries |
| `friction_clients` | Client list |
| `friction_invoices` | Invoice documents |

RLS is enabled on all tables with open anon policies (anyone with the anon key can read/write).

---

## Your Tasks (Barat)

### Priority 1 — Immediate
- [ ] **Supabase Auth — Magic Link** (`src/pages/Login.jsx`, `src/App.jsx`)
  - Add `supabase.auth.signInWithOtp({ email })` flow
  - Protect all routes — redirect to `/login` if no session
  - Show Jeevan's avatar (J) and yours (B) separately based on logged-in user
  - Ask J for the Supabase project password if you need to update auth settings

- [ ] **List View on TaskBoard** (`src/components/Board.jsx`)
  - Add a view-switcher toggle: Kanban | List | Table
  - List view: rows with task title, assignee chip, priority badge, due date, status dropdown
  - Table view: compact `<table>` with sortable columns

### Priority 2 — This sprint
- [ ] **Comments on Tasks** (`src/lib/db.js`, `src/components/Modal.jsx`)
  - New Supabase table: `friction_task_comments` (id, task_id, author, text, created_at)
  - Add a comments thread below the modal body — small avatar + text, timestamps
  - Real-time subscription: new comments appear instantly for both users

- [ ] **File Attachments** (`src/lib/db.js`)
  - Use Supabase Storage bucket `friction-attachments`
  - Drag-drop files onto task modal → upload → show file list with download link
  - Store file metadata in `friction_tasks.attachments` JSONB column

### Priority 3 — Next sprint
- [ ] **Sub-tasks**
- [ ] **Time Tracking**
- [ ] **In-App Notifications**

---

## Push Workflow

When your work is ready to push:

```bash
# From friction-dashboard-dev/ folder:
# Double-click DO_PUSH.bat  (Windows)
# OR run in terminal:
cd C:\Users\<YourName>\Documents\friction-sdn-bhd\friction-dashboard-dev
DO_PUSH.bat
```

The bat file removes any stale git locks, stages, commits, pulls with rebase, and pushes to `feature/dashboard-supabase`.

---

## Design System (v4 — Framer Edition)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F5F0E8` | Page background (parchment) |
| `--sf-1` | `#FDFBF7` | Card surfaces |
| `--sf-2` | `#FFFFFF` | Elevated cards / topbar |
| `--blood` | `#5D0D18` | Primary CTA (Bloodstone) |
| `--sage` | `#5B8C7D` | Secondary accent |
| `--t1` | `#1A1410` | Primary text |
| `--t3` | `#7A6B62` | Secondary text |
| `--t4` | `#B0A49C` | Muted / labels |

Font: **Outfit** (Google Fonts) — already imported in `index.css`

All shadows use warm-tinted RGBA: `rgba(26,20,16,...)` not pure black.

---

## Questions / Issues

Open a GitHub Issue on the repo or ping Jeevan directly.
Repo: https://github.com/Jeevan1811/friction-dashboard/tree/feature/dashboard-supabase
