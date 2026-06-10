# Friction Task Board

React 18 + Vite 5 kanban board for the Friction Startup OS.

**Palette:** Vanilla Custard `#FFF9EB` · Misty Sage `#9FB2AC` · Bloodstone `#5D0D18`

---

## Getting started

```bash
cd taskboard-app
npm install
npm run dev
```

Opens at `http://localhost:5173`.

---

## Project structure

```
taskboard-app/
├── src/
│   ├── App.jsx          DndContext, state, filters, modal state
│   ├── data.js          Task data, COLS, MEMBERS, PHASES, PRIORITIES
│   ├── index.css        Design tokens (CSS variables), animations
│   └── components/
│       ├── Sidebar.jsx  Bloodstone sidebar – logo, nav, team, user
│       ├── Board.jsx    Topbar, stats row, filter bar, kanban columns
│       ├── Card.jsx     Draggable task card (useSortable)
│       └── Modal.jsx    Add / edit / delete task form
```

---

## GitHub issues for Barat

### Issue #1 — Mobile touch drag-and-drop

**Goal:** Make the kanban board fully usable on iOS and Android.

**Background:**  
`@dnd-kit` supports a `TouchSensor` but it needs careful configuration to avoid conflicts with scroll. The current setup uses only `PointerSensor` which works on desktop but touch drag is unreliable on mobile.

**Tasks:**
1. Import `TouchSensor` from `@dnd-kit/core`.
2. Add it to `useSensors` in `App.jsx` with an activation constraint of `delay: 200, tolerance: 5` so scrolling still works normally.
3. Test on iOS Safari and Chrome Android.
4. Optionally add a visual "long-press" indicator (scale pulse on 200 ms hold).

**Files to edit:** `src/App.jsx`

**Acceptance criteria:**
- Cards can be dragged between columns on a real iOS/Android device.
- Vertical page scroll still works when not dragging.
- No janky visual glitches on drop.

---

### Issue #2 — Supabase real-time data integration

**Goal:** Replace the sample data in `data.js` with live data from the Supabase `tasks` table.

**Background:**  
The project ID is `fziaxuhonvrhqjulhcyu`. Credentials come from `window.ENV` (set in the gitignored `config.js` in the parent `friction-dashboard-dev` folder — never hard-code keys).

**Security rules (non-negotiable):**
- RLS is enabled on all tables — never use the service role key client-side.
- Only use the anon/publishable key from `window.ENV.SUPABASE_ANON_KEY`.
- Parameterised queries only — no string concatenation in SQL.
- Never commit `config.js` or any file containing keys.

**Tasks:**
1. Install `@supabase/supabase-js` (`npm install @supabase/supabase-js`).
2. Create `src/lib/supabase.js` that initialises the client from `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.
3. Create a `.env.local` file (gitignored) for local dev with those two vars.
4. In `App.jsx`, replace `INITIAL_TASKS` with a `useEffect` that calls `supabase.from('tasks').select('*')` on mount.
5. Subscribe to real-time changes so the board updates when another user moves a card.
6. On drag-end, call `supabase.from('tasks').update({ status: destStatus }).eq('id', taskId)`.

**Files to create/edit:**  
`src/lib/supabase.js` (new), `src/App.jsx`, `.env.local` (new, gitignored), `.gitignore` (add `.env.local`)

**Acceptance criteria:**
- Board loads real tasks from Supabase on page load.
- Moving a card persists the new status.
- Opening two browser windows shows live sync.
- No keys committed to git.

---

### Issue #3 — Polish: empty states, loading skeleton, overdue badge

**Goal:** Improve perceived quality for demo and investor meetings.

**Tasks:**
1. **Loading skeleton:** When `loading === true` in App.jsx, render 2–3 placeholder cards per column using a shimmer animation (CSS `@keyframes shimmer` with a gradient sweep). Use the existing CSS variable set.
2. **Empty board state:** If `tasks.length === 0` and not loading, show a centered illustration-free empty state: "No tasks yet — add your first one" with the New Task button.
3. **Overdue badge:** On the topbar, show a small red badge count next to the title if any non-done tasks are past their due date. e.g. `3 overdue`.
4. **Column add button:** Add the "+ Add task" quick-add button to all 4 columns (currently only on "To Do"). Clicking it opens the modal with the relevant status pre-selected.

**Files to edit:** `src/App.jsx`, `src/components/Board.jsx`, `src/components/Card.jsx`, `src/index.css`

**Acceptance criteria:**
- Skeleton renders for at least 400 ms even if data loads instantly (use `setTimeout`).
- Empty state renders correctly when all tasks are deleted.
- Overdue badge is visible in the topbar.
- All 4 columns have the quick-add button.
