/* ═══════════════════════════════════════════════════════
   SUPABASE-DB.JS — Cloud sync layer
   feat: replace localStorage with Supabase (#1)

   Pattern: write-through cache
   ┌─────────────┐    pull on init     ┌──────────────┐
   │  Supabase   │ ──────────────────► │ localStorage │ ◄── UI reads (sync)
   │  (cloud)    │ ◄────────────────── │  (cache)     │ ──► UI writes (sync → push async)
   └─────────────┘  push on DB.set()   └──────────────┘
         │
         └── Realtime ──► update localStorage + re-render active page

   Load order: AFTER core.js (needs SK), BEFORE page-*.js
═══════════════════════════════════════════════════════ */

const _SUPABASE_URL  = 'https://hryhedlmnwoueeslzpjk.supabase.co';
const _SUPABASE_ANON = (typeof window !== 'undefined' && window.ENV?.SUPABASE_ANON_KEY) || '';

let _sbClient = null;

/* ── CLIENT SINGLETON ───────────────────────────────── */
function _getClient() {
  if (_sbClient) return _sbClient;
  if (!_SUPABASE_ANON) {
    console.error('[supabase-db] SUPABASE_ANON_KEY missing — copy config.example.js to config.js and fill in the key');
    return null;
  }
  if (typeof supabase === 'undefined') {
    console.error('[supabase-db] Supabase CDN script not loaded');
    return null;
  }
  _sbClient = supabase.createClient(_SUPABASE_URL, _SUPABASE_ANON);
  return _sbClient;
}

/* ── PULL: cloud → localStorage ─────────────────────── */
async function pullFromSupabase() {
  const sb = _getClient();
  if (!sb) return false;

  try {
    const { data, error } = await sb
      .from('app_data')
      .select('key, value');

    if (error) throw error;

    (data || []).forEach(row => {
      try { localStorage.setItem(row.key, JSON.stringify(row.value)); } catch (_) {}
    });

    console.log(`[supabase-db] Pulled ${(data || []).length} key(s) from cloud`);
    return true;
  } catch (err) {
    console.warn('[supabase-db] Pull failed — running on local cache:', err.message);
    return false;
  }
}

/* ── PUSH: localStorage → cloud (fire-and-forget) ───── */
async function pushToSupabase(key, value) {
  const sb = _getClient();
  if (!sb) return;

  try {
    const { error } = await sb
      .from('app_data')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) throw error;
  } catch (err) {
    console.warn(`[supabase-db] Push failed for "${key}":`, err.message);
  }
}

/* ── DELETE: remove key from cloud ──────────────────── */
async function deleteFromSupabase(key) {
  const sb = _getClient();
  if (!sb) return;

  try {
    const { error } = await sb
      .from('app_data')
      .delete()
      .eq('key', key);

    if (error) throw error;
  } catch (err) {
    console.warn(`[supabase-db] Delete failed for "${key}":`, err.message);
  }
}

/* ── REALTIME: sync remote changes to local cache ────── */
function _subscribeRealtime() {
  const sb = _getClient();
  if (!sb) return;

  sb.channel('app_data_sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'app_data' },
      payload => {
        const { eventType, new: row, old } = payload;
        const key = row?.key || old?.key;
        if (!key) return;

        if (eventType === 'DELETE') {
          try { localStorage.removeItem(key); } catch (_) {}
        } else {
          try { localStorage.setItem(key, JSON.stringify(row.value)); } catch (_) {}
        }

        _refreshActivePage(key);
      }
    )
    .subscribe(status => {
      if (status === 'SUBSCRIBED') {
        console.log('[supabase-db] Realtime connected — live sync active');
      }
    });
}

/* ── MAP: storage key → page renderer ───────────────── */
// Only re-renders if that key's page is currently visible
function _refreshActivePage(key) {
  const activeId = document.querySelector('.page.active')?.id;
  if (!activeId) return;

  const KEY_MAP = {
    [SK.tasks]:        { page: 'page-taskboard', fn: () => typeof renderTaskboard === 'function' && renderTaskboard()                },
    [SK.clientTasks]:  { page: 'page-clients',   fn: () => typeof renderClients   === 'function' && renderClients()                  },
    [SK.clients]:      { page: 'page-clients',   fn: () => typeof renderClients   === 'function' && renderClients()                  },
    [SK.invoices]:     { page: 'page-docs',       fn: () => typeof renderDocs       === 'function' && renderDocs()                    },
    [SK.templates]:    { page: 'page-docs',       fn: () => typeof renderDocs       === 'function' && renderDocs()                    },
    [SK.docTypes]:     { page: 'page-docs',       fn: () => typeof renderDocs       === 'function' && renderDocs()                    },
    [SK.kpi]:          { page: 'page-anal',       fn: () => typeof renderAnal       === 'function' && setTimeout(renderAnal, 80)      },
    [SK.members]:      { page: 'page-backend',    fn: () => typeof renderBackend    === 'function' && renderBackend()                 },
    [SK.roles]:        { page: 'page-backend',    fn: () => typeof renderBackend    === 'function' && renderBackend()                 },
    [SK.keywords]:     { page: 'page-backend',    fn: () => typeof renderBackend    === 'function' && renderBackend()                 },
    [SK.backendTasks]: { page: 'page-backend',    fn: () => typeof renderBackend    === 'function' && renderBackend()                 },
    [SK.company]:      { page: 'page-backend',    fn: () => typeof renderBackend    === 'function' && renderBackend()                 },
  };

  const entry = KEY_MAP[key];
  if (entry && activeId === entry.page) entry.fn();
}

/* ── INIT: await this before initDefaults() ─────────── */
async function initSupabase() {
  await pullFromSupabase();
  _subscribeRealtime();
}
