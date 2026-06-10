export const COLS = [
  { id: 'todo',    label: 'To Do',       color: 'var(--col-todo)' },
  { id: 'inprog',  label: 'In Progress', color: 'var(--col-inprog)' },
  { id: 'blocked', label: 'Blocked',     color: 'var(--col-blocked)' },
  { id: 'done',    label: 'Done',        color: 'var(--col-done)' },
]

export const PRIORITIES = [
  { id: 'critical', label: 'Critical', color: 'var(--p-critical)' },
  { id: 'high',     label: 'High',     color: 'var(--p-high)' },
  { id: 'medium',   label: 'Medium',   color: 'var(--p-medium)' },
  { id: 'low',      label: 'Low',      color: 'var(--p-low)' },
]

export const MEMBERS = [
  { id: 'J', name: 'Jeevan', role: 'Founder',   color: '#8B1525' },
  { id: 'B', name: 'Barat',  role: 'Developer', color: '#3D8C74' },
]

export const PHASES = ['Discovery','Validation','Design','Development','Launch','Operations']

export const INITIAL_TASKS = [
  { id: 't1', title: 'Customer discovery interviews',    note: 'Conduct 20 interviews with SME owners in KL & Selangor. Focus on task delegation pain points.',  phase: 'Discovery',   assignee: 'J', priority: 'critical', status: 'inprog',  due: '2026-06-18' },
  { id: 't2', title: 'Define MVP feature scope',         note: 'Align with co-founders on the three core workflows for v1. Document non-goals explicitly.',        phase: 'Validation',  assignee: 'J', priority: 'high',     status: 'inprog',  due: '2026-06-15' },
  { id: 't3', title: 'Supabase schema — tasks table',    note: 'Design RLS policies, table structure, and real-time subscription for the task board.',             phase: 'Development', assignee: 'B', priority: 'high',     status: 'todo',    due: '2026-06-20' },
  { id: 't4', title: 'Mobile touch drag-and-drop',       note: 'Implement @dnd-kit TouchSensor so the board works on iOS and Android natively.',                   phase: 'Development', assignee: 'B', priority: 'medium',   status: 'todo',    due: '2026-06-25' },
  { id: 't5', title: 'Pitch deck — seed round',          note: 'Draft 12-slide deck: problem, solution, traction, market sizing, team, and ask.',                  phase: 'Validation',  assignee: 'J', priority: 'critical', status: 'blocked', due: '2026-06-30' },
  { id: 't6', title: 'Landing page v1',                  note: 'Build and deploy the marketing page with waitlist signup and OG preview image.',                   phase: 'Launch',      assignee: 'B', priority: 'high',     status: 'todo',    due: '2026-06-28' },
  { id: 't7', title: 'Competitor analysis report',       note: 'Deep-dive on Asana, Monday, and Notion for SMB positioning gaps and differentiation angles.',     phase: 'Discovery',   assignee: 'J', priority: 'low',      status: 'done',    due: '2026-06-08' },
  { id: 't8', title: 'CI/CD pipeline — GitHub Actions',  note: 'Vite build, Supabase migration runner, and preview deployment on each PR.',                       phase: 'Development', assignee: 'B', priority: 'medium',   status: 'inprog',  due: '2026-06-21' },
  { id: 't9', title: 'User auth — magic link',           note: 'Supabase auth with magic link. Handle session persistence, redirect logic, and protected routes.',  phase: 'Development', assignee: 'B', priority: 'high',     status: 'blocked', due: '2026-06-19' },
  { id: 't10',title: 'Brand guidelines doc',             note: 'Typography scale, colour usage rules, and component patterns for the design system.',              phase: 'Design',      assignee: 'J', priority: 'low',      status: 'done',    due: '2026-06-10' },
]
