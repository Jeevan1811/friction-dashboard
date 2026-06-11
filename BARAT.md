# Friction Startup OS — Complete Developer Handover (Barat)

> **Your single source of truth.** Everything you need to own this project end-to-end.

---

## 1. Quick Start (5 minutes)

**Prerequisites:** Node 18+, Git

```bash
# 1. Clone
git clone https://github.com/Jeevan1811/friction-dashboard.git
cd friction-dashboard
git checkout feature/dashboard-supabase

# 2. Install deps
cd taskboard-app
npm install

# 3. Config (NEVER commit this file)
cp src/config.example.js src/config.js
# Edit src/config.js and fill in:
#   SUPABASE_URL  = 'https://fziaxuhonvrhqjulhcyu.supabase.co'
#   SUPABASE_ANON_KEY = '<ask Jeevan for the anon key>'

# 4. Run
npm run dev
# → http://localhost:5173
```

---

## 2. Project Goal

**Friction Startup OS** is a private internal dashboard for Jeevan (J) and Barat (B) — two founders running a Malaysian tech startup.

Think Monday.com × Productive.io, purpose-built for a 2-person founding team. Tracks tasks, KPIs, clients, invoices, and workspace settings. All data lives in Supabase (Postgres + real-time subscriptions).

**Current state:** 5 pages live and wired to Supabase. Full dark UI redesign done (see Section 4).

---

## 3. Tech Stack

| Layer        | Tech                                      |
|---|---|
| Frontend     | Vite 5 + React 18, JSX only (no TypeScript) |
| Routing      | react-router-dom v6 (createBrowserRouter) |
| Drag & Drop  | @dnd-kit/core + @dnd-kit/sortable         |
| Charts       | chart.js v4 + react-chartjs-2 v5          |
| Database     | Supabase (PostgreSQL + real-time)         |
| Auth         | 🔴 TODO — Supabase magic-link (your P1)   |
| Hosting      | Vercel (CI/CD from feature branch)        |
| Fonts        | Space Grotesk · Inter · JetBrains Mono    |

---

## 4. UI Reference — The CEO's Target Design

The CEO shared `taskboard-demo.html` as the target visual. The dark redesign is done for all 5 pages. You will see these tokens throughout the codebase:

### Design System v5 (Dark Edition)
```
Background:    #0a0c12
Surfaces:      #12151f / #1a1e2c
Borders:       rgba(255,255,255,0.08)  (0.18 on hover)
Text:          #f2f4f8 / #c8cdd8 / #8b93a7 / #555e72
Accent:        #6366f1 → #a855f7  (indigo/purple gradient)

Priority colours (Eisenhower matrix):
  critical = #f43f5e  "Do Now"     (red)
  high     = #f59e0b  "Delegate"   (yellow)
  medium   = #38bdf8  "Schedule"   (blue)
  low      = #34d399  "Do Last"    (green)

Ambient glows: radial-gradient body::before (indigo top-left, purple top-right, blue bottom)
Glassmorphism: backdrop-filter: blur(12px) on cards + filter bars
Priority pills: colored dot with CSS box-shadow glow + uppercase mono label
Task cards:    2px colored top-border strip per priority
```

### What Still Needs to Be Built (from the reference)
These features are in `taskboard-demo.html` but not yet in the React app — all your tasks:
- Recursive subtasks (up to 3 levels deep)
- Auto-assign engine (keyword → member mapping)
- Auto-priority engine (keyword → priority)
- Tools & Docs panel per task card
- Delegate modal with reason selection
- Toast notification system
- Phase-grouped card view (alternative to Kanban)

---

## 5. Project Structure

```
friction-dashboard-dev/
├── taskboard-app/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── TaskBoard.jsx       ← Kanban board (real-time Supabase)
│   │   │   ├── Analytics.jsx       ← SHS/KPI charts (chart.js)
│   │   │   ├── Clients.jsx         ← Client CRM
│   │   │   ├── Docs.jsx            ← Invoice builder
│   │   │   └── Backend.jsx         ← Settings (5 tabs)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         ← Left nav (dark glassmorphism)
│   │   │   ├── Board.jsx           ← Kanban + PipelineStrip + stats
│   │   │   ├── Card.jsx            ← Draggable task card + priority pill
│   │   │   ├── Modal.jsx           ← Task create/edit dialog
│   │   │   └── CommandPalette.jsx  ← Cmd+K search (needs dark update)
│   │   ├── lib/
│   │   │   ├── supabase.js         ← Supabase client (reads config.js)
│   │   │   └── db.js               ← All DB functions
│   │   ├── data.js                 ← MEMBERS, PHASES, INITIAL_TASKS
│   │   └── index.css               ← Design tokens v5 + all CSS classes
├── BARAT.md                        ← This file
├── PROJECT_STATUS.md               ← Migration-ready project snapshot
└── DO_PUSH.bat                     ← Push to GitHub (Windows)
```

---

## 6. Your Full Task List (Priority Order)

### 🔴 PRIORITY 1 — This Week

#### A. Magic Link Auth (Supabase)
**Files to create/edit:** `src/pages/Login.jsx` (new), `src/App.jsx`, `src/lib/Layout.jsx`

Step 1 — Create Login page:
```jsx
// src/pages/Login.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (!error) setSent(true)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0c12', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#12151f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:40, width:360 }}>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", color:'#f2f4f8', marginBottom:24 }}>Friction OS</h2>
        {sent ? (
          <p style={{ color:'#34d399' }}>Magic link sent! Check your email ✓</p>
        ) : (
          <>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ width:'100%', padding:'10px 14px', background:'#0e111a', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'#f2f4f8', fontFamily:"'Inter',sans-serif", marginBottom:16, boxSizing:'border-box' }}
            />
            <button
              onClick={handleLogin}
              style={{ width:'100%', padding:'10px 0', background:'linear-gradient(135deg,#6366f1,#a855f7)', border:'none', borderRadius:8, color:'#fff', fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, cursor:'pointer' }}
            >
              Send Magic Link
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

Step 2 — Guard the app in `App.jsx`:
```jsx
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import Login from './pages/Login.jsx'

// Inside App component, before the router:
const [session, setSession] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setSession(data.session)
    setLoading(false)
  })
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
  return () => subscription.unsubscribe()
}, [])

if (loading) return null
if (!session) return <Login />
```

Step 3 — Enable magic link in Supabase dashboard:
- Go to https://supabase.com/dashboard/project/fziaxuhonvrhqjulhcyu → Authentication → Providers
- Email is enabled by default. No extra config needed for magic link.
- Under Authentication → URL Configuration, set Site URL to your Vercel URL.

**Why this matters:** Currently anyone can read/write the database. Once auth is enabled, only people with magic-link access (= you and Jeevan) can use the app.

---

#### B. List View Toggle on TaskBoard
Add a view switcher (Kanban | List | Table) at the top of `Board.jsx`:

```jsx
// State to add to Board.jsx
const [view, setView] = useState('kanban') // 'kanban' | 'list' | 'table'

// View switcher buttons (add to topbar):
<div style={{ display:'flex', gap:4 }}>
  {['kanban','list','table'].map(v => (
    <button key={v} onClick={() => setView(v)}
      style={{ padding:'4px 12px', borderRadius:6, border:'none', cursor:'pointer',
        background: view===v ? 'rgba(99,102,241,0.2)' : 'transparent',
        color: view===v ? '#6366f1' : '#8b93a7',
        fontFamily:"'Space Grotesk',sans-serif", fontSize:12, textTransform:'capitalize' }}>
      {v}
    </button>
  ))}
</div>
```

List view: rows with title, assignee chip, priority pill, due date, status dropdown.
Table view: compact `<table>` with sortable columns (click header to sort by that field).

---

### 🟡 PRIORITY 2 — Next Sprint

#### C. Recursive Subtasks (up to 3 levels)
First, add the column to Supabase:
```sql
-- Run this in Supabase SQL editor:
ALTER TABLE friction_tasks ADD COLUMN subtasks JSONB DEFAULT '[]';
```

Data shape:
```js
// SubTask = { id: uuid, title: string, done: boolean, subtasks: SubTask[] }
// Max depth = 3 (root → level1 → level2 → level3)
```

Render in `Modal.jsx` using a recursive component:
```jsx
function SubTree({ subtasks, onToggle, onAdd, depth = 0 }) {
  return (
    <div style={{ marginLeft: depth * 20 }}>
      {subtasks.map(s => (
        <div key={s.id}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 0' }}>
            <button onClick={() => onToggle(s.id)}
              style={{ width:16, height:16, borderRadius:4, border:'1px solid rgba(255,255,255,0.2)',
                background: s.done ? '#6366f1' : 'transparent', cursor:'pointer' }}>
              {s.done && '✓'}
            </button>
            <span style={{ color: s.done ? '#555e72' : '#c8cdd8', textDecoration: s.done ? 'line-through' : 'none',
              fontFamily:"'Inter',sans-serif", fontSize:13 }}>
              {s.title}
            </span>
          </div>
          {depth < 2 && s.subtasks?.length > 0 &&
            <SubTree subtasks={s.subtasks} onToggle={onToggle} onAdd={onAdd} depth={depth+1} />}
        </div>
      ))}
      {depth < 2 &&
        <button onClick={() => onAdd(depth)}
          style={{ color:'#6366f1', background:'none', border:'none', cursor:'pointer', fontSize:12 }}>
          + Add subtask
        </button>}
    </div>
  )
}
```

Also show subtask progress on the card (e.g. "2/5 subtasks done" as a small bar).

---

#### D. Auto-Assign Engine
Create `src/lib/autoAssign.js`:
```js
// Keyword sets — extend as needed
const KEYWORDS = {
  J: ['deploy', 'api', 'code', 'server', 'bug', 'database', 'ai', 'cloud',
      'security', 'architecture', 'backend', 'devops', 'infrastructure'],
  B: ['data', 'report', 'analytics', 'compliance', 'document', 'records',
      'kpi', 'pdpa', 'minutes', 'legal', 'finance', 'invoice', 'client'],
}

export function autoAssign(title, description = '') {
  const text = (title + ' ' + description).toLowerCase()
  const scores = { J: 0, B: 0 }
  for (const [member, kws] of Object.entries(KEYWORDS)) {
    for (const kw of kws) {
      if (text.includes(kw)) scores[member]++
    }
  }
  if (scores.J === 0 && scores.B === 0) return null // no suggestion
  return scores.J >= scores.B ? 'J' : 'B'
}
```

Wire into `Modal.jsx`: call `autoAssign(title, description)` on title/description change, show a suggestion chip "💡 Suggested: J" with a "Use" button that sets the assignedTo field.

---

#### E. Auto-Priority Engine
Create `src/lib/autoPriority.js`:
```js
const PRIORITY_KEYWORDS = {
  critical: ['urgent', 'block', 'today', 'asap', 'payment', 'sign', 'legal', 'deadline', 'overdue'],
  high:     ['send', 'reply', 'follow', 'update', 'remind', 'confirm', 'approve', 'review'],
  medium:   ['plan', 'setup', 'register', 'design', 'draft', 'prepare', 'research', 'document'],
}

export function autoPriority(title, description = '') {
  const text = (title + ' ' + description).toLowerCase()
  for (const [priority, kws] of Object.entries(PRIORITY_KEYWORDS)) {
    if (kws.some(kw => text.includes(kw))) return priority
  }
  return 'low'
}
```

Same as auto-assign — show suggestion in Modal.jsx with "Use" button.

---

#### F. Delegate Modal
Add a "Delegate" button to each expanded task card. Opens a small modal:

```jsx
function DelegateModal({ task, onClose, onDelegate }) {
  const [to, setTo] = useState('')
  const [reason, setReason] = useState('')
  const REASONS = ['More suitable to them', "I'm overloaded", 'Their area of expertise', 'Custom...']

  return (
    <div style={{ /* overlay */ }}>
      <div style={{ /* dark modal card */ }}>
        <h3>Delegate Task</h3>
        <p style={{ color:'#8b93a7' }}>{task.title}</p>
        <label>Assign to</label>
        <select value={to} onChange={e => setTo(e.target.value)}>
          <option value="J">Jeevan (J)</option>
          <option value="B">Barat (B)</option>
        </select>
        <label>Reason</label>
        {REASONS.map(r => (
          <label key={r}><input type="radio" name="reason" value={r} onChange={() => setReason(r)} />{r}</label>
        ))}
        <button onClick={() => onDelegate(task.id, to, reason)}>Delegate</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
```

`onDelegate` updates `assignedTo` in Supabase and optionally stores the reason in a new `remark` field.

---

#### G. Task Comments
New Supabase table:
```sql
CREATE TABLE friction_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT REFERENCES friction_tasks(id) ON DELETE CASCADE,
  author TEXT NOT NULL CHECK (author IN ('J', 'B')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE friction_task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON friction_task_comments
  FOR ALL TO anon USING (true) WITH CHECK (true);
```

Render a comment thread at the bottom of `Modal.jsx`. Subscribe with `supabase.channel('comments').on('postgres_changes', ...)`.

---

#### H. File Attachments
Create a Supabase Storage bucket called `friction-attachments`. Then add this to `db.js`:
```js
// Upload
export async function uploadAttachment(taskId, file) {
  const path = `${taskId}/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('friction-attachments')
    .upload(path, file)
  if (error) throw error
  return data.path
}

// Get public URL
export function getAttachmentUrl(path) {
  const { data } = supabase.storage.from('friction-attachments').getPublicUrl(path)
  return data.publicUrl
}
```

Add `attachments JSONB DEFAULT '[]'` column to `friction_tasks`:
```sql
ALTER TABLE friction_tasks ADD COLUMN attachments JSONB DEFAULT '[]';
```

---

### 🟢 PRIORITY 3 — Infrastructure

These coordinate with Jeevan:

- **CI/CD:** GitHub Actions → Vercel auto-deploy. Ask Jeevan for Vercel API token.
- **Error tracking:** `npm install @sentry/react` — free Sentry.io project
- **Caching:** `npm install @tanstack/react-query` — wrap Supabase calls for auto-refresh
- **Testing:** `npm install -D vitest @testing-library/react` — add unit tests for db.js helpers
- **Rate limiting:** Vercel Edge middleware (ask Jeevan to set up in Vercel dashboard)

---

### 🔵 PRIORITY 4 — Advanced Features

- **Phase-grouped view:** Alternative to Kanban. Group cards by phase label (Validate / Form Co. / Build MVP / 1st Client / Beta / Comply / Scale). Add a `phase` toggle button next to the view switcher.
- **Gantt chart:** Show task timelines using `frappe-gantt` library
- **Notifications:** Browser push notifications when a task is assigned to you
- **Mobile/PWA:** Add `vite-plugin-pwa`, configure service worker for offline support
- **Client portal:** Separate subdomain (e.g. client.friction.my) with read-only task + invoice view for external clients

---

## 7. Supabase Tables

### friction_tasks
```sql
id TEXT PRIMARY KEY
title TEXT NOT NULL
description TEXT
phase TEXT          -- Kanban column: 'To Do' | 'In Progress' | 'Review' | 'Done'
status TEXT
priority TEXT       -- critical | high | medium | low
assignedTo TEXT     -- J or B
dueDate TEXT
subtasks JSONB DEFAULT '[]'
attachments JSONB DEFAULT '[]'
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

### friction_kpi
```sql
id TEXT PRIMARY KEY
date TEXT
ts TIMESTAMPTZ
shs INTEGER    -- Startup Health Score (0-100)
re INTEGER     -- Revenue Engine
ds INTEGER     -- Decision Speed
oe INTEGER     -- Output Engine
ai INTEGER     -- Adaptability Index
j INTEGER      -- Jeevan score
b INTEGER      -- Barat score
team INTEGER   -- Team average
```

### friction_clients
```sql
id TEXT PRIMARY KEY
name TEXT NOT NULL
industry TEXT
status TEXT        -- Active | Prospect | Inactive | On Hold
contact TEXT
email TEXT
phone TEXT
value NUMERIC
notes TEXT
assignee TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

### friction_invoices
```sql
id TEXT PRIMARY KEY
number TEXT
client TEXT
contact TEXT
email TEXT
inv_date TEXT
due_date TEXT
items JSONB
subtotal NUMERIC
tax_pct NUMERIC
tax_amt NUMERIC
total NUMERIC
status TEXT        -- Draft | Sent | Paid | Cancelled
notes TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

---

## 8. Security Rules — Never Break These

These are non-negotiable. Jeevan is strict about these.

| Rule | Detail |
|---|---|
| ❌ Never commit `config.js` | It's in `.gitignore`. Contains real API keys. |
| ❌ No service role key client-side | Only anon key in `config.js`. Service key is server-only. |
| ❌ No RLS disable | Every table must have RLS enabled. |
| ❌ No string-concatenated SQL | Supabase JS client is parameterised by default. Never build raw SQL strings. |
| ✅ Always add RLS policy on new tables | Copy the `allow_all` pattern from existing tables. |
| ✅ `.env` files → use `config.js` pattern | Never create a `.env` file in this project. |

---

## 9. Push Workflow (Windows)

```bash
# Option 1: double-click DO_PUSH.bat from File Explorer

# Option 2: in terminal:
cd C:\Users\Asus\Documents\friction-sdn-bhd\friction-dashboard-dev
DO_PUSH.bat
```

The bat removes the git lock → stages all → commits with a timestamp message → pulls with rebase → pushes to `feature/dashboard-supabase`.

**Verify:** open `push_log.txt` and check the last line for `Exit code: 0`.  
Or visit: https://github.com/Jeevan1811/friction-dashboard/tree/feature/dashboard-supabase

---

## 10. Links

| Resource | URL |
|---|---|
| GitHub repo | https://github.com/Jeevan1811/friction-dashboard |
| Active branch | `feature/dashboard-supabase` |
| Supabase dashboard | https://supabase.com/dashboard/project/fziaxuhonvrhqjulhcyu |
| Supabase SQL editor | https://supabase.com/dashboard/project/fziaxuhonvrhqjulhcyu/sql |
| Supabase Auth | https://supabase.com/dashboard/project/fziaxuhonvrhqjulhcyu/auth |
| Vercel | Ask Jeevan for invite |

---

## 11. Working with Claude (Cowork)

You have access to a Cowork session just like Jeevan. The AI has read all the project files.

**Good prompts for getting help:**
- "Read `taskboard-app/src/components/Board.jsx` and add a list view toggle"
- "Implement the auto-assign engine from section 6D of BARAT.md"
- "Create the Login.jsx component from section 6A and update App.jsx to guard routes"
- "Run the Supabase SQL from section 6G to create the comments table"

The AI cannot push to GitHub for you — run `DO_PUSH.bat` yourself after each feature.
