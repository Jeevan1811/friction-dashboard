# Friction Dashboard

Internal operations dashboard for Friction SDN BHD — task board, analytics, clients, docs, and backend tools for founders M, J, and B.

## Stack

- Vanilla JS (no framework)
- Supabase (PostgreSQL + Realtime) — see Issue #1
- Vercel (static hosting)
- Design: "Friction Warm" — terracotta, parchment, soft 3D

## Local Dev

```bash
npx serve .
```

Open `http://localhost:3000`.

## Env Setup

Copy `.env.example` → `.env` and fill in your Supabase keys. **Never commit `.env`.**

```bash
cp .env.example .env
```

Add your keys from [supabase.com/dashboard](https://supabase.com/dashboard) → Project Settings → API.

## Deploy

Push to `main` → Vercel auto-deploys. Set env vars in Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Structure

```
friction-dashboard/
├── index.html              # Shell + nav
├── core.js                 # DB layer, shared state, auto-assign logic
├── style.css               # Friction Warm design system
├── page-taskboard.js       # Task board (Issue #1 — active)
├── page-anal.js            # Analytics
├── page-clients.js         # Clients
├── page-docs.js            # Docs
├── page-backend.js         # Backend tools
├── taskboard-prototype.html  # Standalone prototype (design reference)
├── github-issues/
│   └── ISSUE-001-dashboard-supabase.md
└── supabase/
    └── migrations/
        └── 001_dashboard_store.sql
```

## Contributing

See [DEV-BRIEF.md](./DEV-BRIEF.md) for the full collaborator onboarding guide.

Issues are the source of truth for all work. Comment on the issue — do not DM.
