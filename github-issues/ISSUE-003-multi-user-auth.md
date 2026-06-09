# Issue #3 — Multi-User Access (Supabase Auth)

**Assigned to:** J (CTO) — future sprint  
**Depends on:** Issue #2 (UI) merged to `feature/dashboard-supabase`

## Background

Currently the dashboard uses an open RLS policy (`founders_all`) that allows
any anon key to read/write. This is intentional for local dev — but before
deploying to VPS, we need proper auth so only Friction founders can access it.

## Plan

### Step 1 — Enable Supabase Auth
- Enable Email/Magic Link auth in Supabase Dashboard > Auth > Providers
- Add `jeevank1811@gmail.com`, `baratstylo0@gmail.com`, and M's email as allowed users

### Step 2 — Update RLS policy on `dashboard_store`
Replace the current open policy with:
```sql
-- Drop open policy
DROP POLICY IF EXISTS "founders_all" ON dashboard_store;

-- Auth-gated policies
CREATE POLICY "auth_read"   ON dashboard_store FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write"  ON dashboard_store FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_update" ON dashboard_store FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_delete" ON dashboard_store FOR DELETE USING (auth.role() = 'authenticated');
```

### Step 3 — Add login page to dashboard
- Simple `login.html` with email input + "Send Magic Link" button
- On load: check `supabase.auth.getSession()` — if no session, redirect to login
- After magic link click: `supabase.auth.exchangeCodeForSession()` handles it

### Step 4 — Update `supabase-db.js`
- Pass user session to all Supabase calls (already handled by anon key + RLS)
- Add `supabase.auth.onAuthStateChange()` listener

## For Others to Use the Dashboard

### Option A — Share localhost (easiest, temporary)
1. Start `npx serve .` on your machine
2. Use ngrok: `ngrok http 3000`
3. Share the ngrok URL — anyone with the link can access

### Option B — VPS deploy (production)
1. Rent cheap Linux VPS (Contabo/DigitalOcean ~$4/mo)
2. `scp -r friction-dashboard-dev/ user@vps:/var/www/dashboard/`
3. nginx config pointing to `/var/www/dashboard/`
4. Certbot for HTTPS
5. Set `dashboard.friction.com.my` DNS → VPS IP
6. Anyone goes to `https://dashboard.friction.com.my` and logs in with magic link

## Security Reminders (from CLAUDE.md)
- NEVER bypass RLS with service role from client-side
- SUPABASE_SERVICE_KEY is server-only — never in config.js
- Parameterised queries only
