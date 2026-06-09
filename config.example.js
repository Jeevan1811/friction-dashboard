// ═══════════════════════════════════════════════════════
// config.example.js — Supabase environment config template
//
// HOW TO USE:
// 1. Copy this file to config.js  (cp config.example.js config.js)
// 2. Fill in SUPABASE_URL and SUPABASE_ANON_KEY
// 3. NEVER commit config.js — it is in .gitignore
//
// The anon key is safe to use in client-side code.
// Supabase Row-Level Security (RLS) is what protects the data.
// ═══════════════════════════════════════════════════════

window.ENV = {
  SUPABASE_URL:      'https://YOUR_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE',
};
