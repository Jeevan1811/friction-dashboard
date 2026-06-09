# Issue #2 — Friction Warm UI Redesign (Task Board)

**Assigned to:** Barat  
**Branch:** `feature/dashboard-ui` (branch off `feature/dashboard-supabase`)  
**Reference file:** `taskboard-prototype.html` (in repo root of this branch)

## What needs to be done

The `taskboard-prototype.html` in this repo is the **exact visual target**.
Open it in a browser — that is what the Task Board should look like.

### Changes needed in `page-taskboard.js`
The CTO has already rewritten this file with the Friction Warm row layout.
Your job is to **integrate it with the data from Supabase** (via `DB` / `pushToSupabase`).
Specifically:
- Verify `renderTaskboard()` is called correctly from `index.html` after `initSupabase()`
- Test that adding/editing/deleting tasks persists to Supabase
- Test Realtime sync: open two browser tabs, add a task in one, verify it appears in the other

### Changes needed in `style.css`
The CTO has appended all `fw-*` CSS classes.
Check that fonts load: `Inter` and `JetBrains Mono` from Google Fonts.
Verify the topnav background inherits the warm parchment tone.

### Changes needed in `index.html`
CTO updated the taskboard section. Verify layout renders correctly.
Optionally: update the `<link>` for Google Fonts to include Inter + JetBrains Mono
if not already present.

## Definition of Done
- [ ] Task Board visually matches `taskboard-prototype.html`
- [ ] Parchment background, terracotta accent, Inter font visible
- [ ] Row/table layout (not card grid)
- [ ] All filters (member, priority, search) work
- [ ] Add / Edit / Delete / Delegate all persist to Supabase
- [ ] Realtime sync verified across two tabs
- [ ] `feature/dashboard-ui` branch PR opened against `feature/dashboard-supabase`
