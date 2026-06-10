# Barat — Task Board Dev Handoff

> **Read this first. Work top to bottom. Complete Task 1 before starting Task 2.**
> This file is your single source of truth. All context, file paths, and acceptance criteria are here.

---

## Project context

Friction is a startup OS dashboard. The task board (`taskboard-app/`) is a Vite + React 18 kanban board using `@dnd-kit` for drag and drop. It currently runs with sample data only. Your job is to wire it to real Supabase data, make it work on mobile, and add polish.

**Stack:** Vite 5, React 18, @dnd-kit/core + @dnd-kit/sortable, no other UI libraries.

**Run locally:**
```bash
cd taskboard-app
npm install
npm run dev
# opens at http://localhost:5173
```

---

## Security rules — non-negotiable, no exceptions

- **Never** commit `.env`, `.env.local`, `config.js`, or any file with keys
- **Never** use the Supabase service role key on the client side
- **Only** use the anon/publishable key (`VITE_SUPABASE_ANON_KEY`)
- RLS is enabled on all tables — never bypass it
- Parameterised queries only — no string concatenation in SQL
- `.env.local` must be in `.gitignore` before you create it

---

## Task 1 — Supabase real-time integration (highest priority)

**Goal:** Replace the sample data in `src/data.js` with live data from Supabase. When anyone moves a card it persists and syncs to everyone in real time.

### Setup

1. Install the Supabase client:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Add `.env.local` to `.gitignore` **before** creating it:
   ```
   # in taskboard-app/.gitignore (create if missing)
   .env.local
   node_modules
   dist
   ```

3. Create `taskboard-app/.env.local` (never commit this):
   ```
   VITE_SUPABASE_URL=https://fziaxuhonvrhqjulhcyu.supabase.co
   VITE_SUPABASE_ANON_KEY=<ask Jeevan for the anon key — it is in config.js in friction-dashboard-dev>
   ```

4. Create `src/lib/supabase.js`:
   ```js
   import { createClient } from '@supabase/supabase-js'

   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY,
   )
   ```

### Database migration

Create the tasks table in Supabase. Run this SQL in the Supabase dashboard → SQL editor (or via migration file):

```sql
create table if not exists tasks (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  note        text,
  phase       text,
  assignee    text,
  priority    text default 'medium',
  status      text default 'todo',
  due         date,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- RLS
alter table tasks enable row level security;

-- Allow all authenticated and anon reads for now (tighten later with auth)
create policy "Anyone can read tasks"
  on tasks for select using (true);

create policy "Anyone can insert tasks"
  on tasks for insert with check (true);

create policy "Anyone can update tasks"
  on tasks for update using (true);

create policy "Anyone can delete tasks"
  on tasks for delete using (true);

-- Enable real-time
alter publication supabase_realtime add table tasks;
```

### Wire up in App.jsx

Replace `useState(INITIAL_TASKS)` with a Supabase fetch + real-time subscription:

```jsx
import { supabase } from './lib/supabase.js'

// In App component:
const [tasks, setTasks] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  // Initial fetch
  supabase.from('tasks').select('*').order('created_at').then(({ data, error }) => {
    if (!error) setTasks(data ?? [])
    setLoading(false)
  })

  // Real-time subscription
  const channel = supabase
    .channel('tasks-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
      supabase.from('tasks').select('*').order('created_at').then(({ data }) => {
        if (data) setTasks(data)
      })
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])
```

When saving a task (in `saveTask` callback):
```js
// New task
await supabase.from('tasks').insert([{ ...data, id: `t${Date.now()}` }])

// Edit task
await supabase.from('tasks').update(data).eq('id', editingTask.id)
```

When deleting:
```js
await supabase.from('tasks').delete().eq('id', id)
```

When dragging to a new column (`handleDragEnd`):
```js
await supabase.from('tasks').update({ status: destStatus }).eq('id', active.id)
```

**Files to edit:** `src/App.jsx`, create `src/lib/supabase.js`, create `.env.local`, update `.gitignore`

**Acceptance criteria:**
- Board loads real tasks from Supabase on page load
- Adding/editing/deleting a task persists after page refresh
- Moving a card to a different column persists
- Opening the app in two browser windows shows live sync
- Zero keys committed to git (check with `git diff --cached` before every commit)

---

## Task 2 — Mobile touch drag and drop

**Goal:** Cards should be draggable on iOS Safari and Chrome Android without conflicting with page scroll.

**Files to edit:** `src/App.jsx`

```jsx
import {
  PointerSensor,
  KeyboardSensor,
  TouchSensor,   // add this
  useSensor,
  useSensors,
} from '@dnd-kit/core'

const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 8 },
  }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
)
```

The `delay: 200` gives the user time to scroll vs. drag. `tolerance: 8` allows minor finger movement during the press before cancelling.

**Test on:**
- iPhone Safari (primary)
- Android Chrome

**Acceptance criteria:**
- Cards can be dragged between columns on a real mobile device
- Normal vertical page scroll still works without accidentally picking up cards
- No visual glitches on drop

---

## Task 3 — Loading skeleton + empty states

**Goal:** Show a polished loading state while Supabase data loads, and a friendly empty state if the board has no tasks.

### Loading skeleton

In `src/components/Board.jsx`, pass `loading` prop down from App. When `loading === true`, render skeleton cards inside each column instead of real cards:

```jsx
function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderLeft: '3px solid var(--border-md)', borderRadius: 'var(--r-m)',
      padding: '13px 14px', overflow: 'hidden',
    }}>
      {/* Shimmer lines */}
      {[60, 100, 80].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 10 : i === 1 ? 14 : 10,
          width: `${w}%`, borderRadius: 4,
          background: 'linear-gradient(90deg, var(--border) 25%, var(--border-md) 50%, var(--border) 75%)',
          backgroundSize: '800px 100%',
          animation: 'shimmer 1.4s ease infinite',
          marginBottom: i < 2 ? 8 : 0,
        }}/>
      ))}
    </div>
  )
}
```

Add to `src/index.css`:
```css
@keyframes shimmer {
  from { background-position: -400px 0; }
  to   { background-position:  400px 0; }
}
```

Render 2–3 `<SkeletonCard/>` per column when `loading` is true.

### Empty state

If `tasks.length === 0` and `!loading`, show in the board body:
```jsx
<div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--t3)' }}>
  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--t2)', marginBottom: 6 }}>No tasks yet</div>
  <div style={{ fontSize: 13, marginBottom: 20 }}>Add your first task to get started</div>
  <button onClick={onAddTask}>New Task</button>
</div>
```

**Files to edit:** `src/App.jsx`, `src/components/Board.jsx`, `src/index.css`

---

## Branch + commit rules

- Work on branch: `feature/barat-taskboard`
- Create it from `feature/dashboard-supabase`:
  ```bash
  git checkout feature/dashboard-supabase
  git checkout -b feature/barat-taskboard
  ```
- Commit after each task is fully working, e.g.:
  - `feat: wire taskboard to Supabase with real-time sync`
  - `feat: add TouchSensor for mobile drag-and-drop`
  - `feat: loading skeleton and empty state`
- Open a PR into `feature/dashboard-supabase` when all three tasks are done

---

## Questions / blockers

Tag @Jeevan in the PR or message directly. Don't guess on security decisions — ask first.
