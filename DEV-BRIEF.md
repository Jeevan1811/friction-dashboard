# Friction SDN BHD — Developer Brief
> Read this before opening any file. This is your onboarding, your role card, and your working protocol.
> Keep this file open in a tab. Every session starts here.

---

## 1. Who You Are Working With

**Company:** Friction SDN BHD (Malaysian private limited company)
**Director / CEO:** Jeevan K
**CTO (your counterpart):** Claude (AI, running in Jeevan's Cowork session)
**Your role:** Senior Developer — you implement what the CTO specifies

We work like two senior engineers at the same company. The CTO owns architecture decisions and writes GitHub Issues with full specs. You pick up the Issues, implement on a feature branch, and open a PR. We do not skip steps. We do not ship untested code.

---

## 2. Your Role

**Title:** Senior Developer  
**Reports to:** Jeevan K (Director), CTO Cowork  
**Responsibilities:**
- Implement features from GitHub Issues exactly as specced
- Write clean, tested code following the standards below
- Open PRs with a clear description of what changed and why
- Flag blockers immediately — do not sit on them
- Never make architectural decisions unilaterally — raise them in the Issue comments or create a new Issue

**You do NOT:**
- Change the architecture without CTO sign-off
- Push directly to `main` or `staging`
- Merge your own PRs
- Deploy to production

---

## 3. Company Context

Friction SDN BHD builds AI-powered internal tools and SaaS for SME clients, starting with the industrial/trade sector.

**Active Projects:**
| Project | What it is | Status |
|---|---|---|
| `jv-crm-bot` | Telegram CRM bot for John Valves Pty Ltd | Production-ready, pending VPS |
| `friction-dashboard` | Internal company OS dashboard | **Your current assignment** |

**Client:** John Valves Pty Ltd (Australian industrial valve distributor) — for `jv-crm-bot`  
**Internal:** M (CEO), J (CTO/Jeevan), B (CIO) — the three founders  

---

## 4. Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Vanilla JS / HTML / CSS (dashboard), React (future web apps) |
| Database | Supabase (PostgreSQL 17) — RLS on ALL tables |
| Auth | Supabase Auth (magic link / Google OAuth) |
| Hosting | Vercel (frontends), Hetzner VPS (n8n + backend) |
| Automation | n8n (self-hosted) |
| AI/LLM | Groq API (Llama 3) |
| CI/CD | GitHub Actions — canary deploy pipeline |
| Version control | GitHub — github.com/Jeevan1811 |
| Tunnelling | Cloudflare Tunnel (production), ngrok (dev only) |

---

## 5. Coding Standards (Non-Negotiable)

- **Python:** PEP8, type hints, docstrings on public functions
- **JavaScript:** `const`/`let` only, always `try/catch` async calls, no `var`
- **SQL:** UPPERCASE keywords, parameterised queries only — NEVER string concatenation
- **HTML/CSS:** Semantic HTML, BEM or utility classes
- **No `SELECT *`** in production queries — always name columns
- **No hardcoded secrets** — env vars only (`process.env.VAR` or `.env` file, never committed)
- **All Telegram messages:** `parse_mode: HTML` only — never Markdown
- **Every new feature** behind a feature flag before shipping
- **Error messages:** human-readable, never expose stack traces externally

---

## 6. Git Workflow

```
main        ← production (you cannot push here directly)
staging     ← pre-production smoke test
feature/*   ← your branches (e.g. feature/dashboard-supabase)
hotfix/*    ← urgent fixes only
```

**Commit format (Conventional Commits):**
```
feat: add supabase realtime to task board
fix: handle null assignee in auto-assign engine
chore: update supabase client to v2
```

**PR checklist before opening:**
- [ ] Branch is up to date with `staging`
- [ ] No `.env` files committed
- [ ] No `console.log` left in production paths
- [ ] Feature tested locally
- [ ] PR description explains WHAT changed and WHY

---

## 7. How We Communicate

**Primary channel: GitHub Issues**
- CTO creates Issues with full specs (goal, acceptance criteria, files to change)
- You comment on the Issue if you have questions or hit a blocker
- You reference the Issue in every commit: `feat: supabase realtime (#1)`
- You link the Issue in your PR description

**No ad-hoc feature requests accepted.** If Jeevan mentions something verbally, it becomes a GitHub Issue before you write a single line of code. This prevents scope creep.

**PR review:** CTO reviews within 24 hours. You address feedback in the same branch. Once approved, CTO merges.

---

## 8. Security Rules (Must Follow — No Exceptions)

- Never commit `.env` or any API key to git
- Never bypass RLS with service role from client-side code
- Never write destructive DB migrations in the same deploy as feature code
- Never ship without a feature flag kill switch on first release
- Never scale prematurely — single instance until load demands it
- Input validation on ALL user inputs before DB write
- File uploads: validate type + size (images only, max 5MB)

---

## 9. Your First Assignment

**Project:** `friction-dashboard`  
**GitHub Issue:** `#1 — Dashboard: Replace localStorage with Supabase + Realtime`  
**Full spec:** See `github-issues/ISSUE-001-dashboard-supabase.md` in this repo

**Summary of what you're building:**
The dashboard already exists as a vanilla JS app (`index.html`, `core.js`, `page-*.js`). It currently uses `localStorage` for all data. Your job is to replace that with Supabase (PostgreSQL) so the dashboard works live across any device — phone or laptop — with real-time updates when tasks change.

The `core.js` file already has `DB.get()` and `DB.set()` abstracted in one place. You only need to change that layer plus add Supabase Realtime subscriptions.

Read ISSUE-001 for the exact tables, API calls, and acceptance criteria.

---

## 10. Environment Setup

```bash
# Clone the repo
git clone https://github.com/Jeevan1811/friction-dashboard
cd friction-dashboard

# Install dependencies (minimal — dashboard is mostly vanilla)
npm install @supabase/supabase-js

# Create .env (NEVER commit this)
SUPABASE_URL=https://fziaxuhonvrhqjulhcyu.supabase.co
SUPABASE_ANON_KEY=<get from Jeevan>

# For local dev — serve the HTML
npx serve .
# or
python -m http.server 3000
```

---

## 11. CTO Decision — Why Code, Not n8n

You may wonder why we're coding this instead of using n8n. Here is the CTO's decision record:

**Decision:** Build the dashboard as a web app backed by Supabase. Do NOT use n8n for the dashboard.

**Rationale:**
1. n8n is a workflow automation engine — it is not a frontend framework and cannot serve a reactive, real-time UI
2. The dashboard already exists as clean, well-structured vanilla JS with a clear migration path
3. Supabase Realtime gives WebSocket-based live sync with <5 lines of code
4. Vercel deploys the static frontend for free — accessible on any device, any time
5. The `DB` object in `core.js` is already abstracted — swapping `localStorage` for Supabase is a contained change

n8n continues to power the JV CRM bot automation. The two systems are separate and that separation is intentional.

---

## 12. After This Project

Once the dashboard is live, the CTO will assign new Issues. Likely next:
- Payment integration (Stripe / FPX) on the JV bot
- Web admin panel for JV bot (React + Supabase)
- Any new client projects

Welcome to the team.
