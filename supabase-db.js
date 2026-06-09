/* ═══════════════════════════════════════════════════════
SUPABASE-DB.JS — Cloud sync layer
feat: replace localStorage with Supabase (#1)
Pattern: write-through cache
Load order: AFTER core.js (needs SK), BEFORE page-*.js
═══════════════════════════════════════════════════════ */

const _SUPABASE_URL  = (typeof window !== 'undefined' && window.ENV?.SUPABASE_URL)  || '';
const _SUPABASE_ANON = (typeof window !== 'undefined' && window.ENV?.SUPABASE_ANON_KEY) || '';

let _sbClient = null;

/* ── CLIENT SINGLETON ───────────────────────────────── */
function _getClient() {
  if (_sbClient) return _sbClient;
  if (!_SUPABASE_URL || !_SUPABASE_ANON) {
    console.error('[supabase-db] SUPABASE_URL or SUPABASE_ANON_KEY missing — copy config.example.js to config.js and fill in the values');
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
      .from('dashboard_store')
      .select('store_key, store_value');

    if (error) throw error;

    (data || []).forEach(row => {
      try { localStorage.setItem(row.store_key, JSON.stringify(row.store_value)); } catch (_) {}
    });

    console.log('[supabase-db] Pulled ' + (data || []).length + ' key(s) from cloud');
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
      .from('dashboard_store')
      .upsert({ store_key: key, store_value: value }, { onConflict: 'store_key' });

    if (error) throw error;
  } catch (err) {
    console.warn('[supabase-db] Push failed for "' + key + '":', err.message);
  }
}

/* ── DELETE: remove key from cloud ──────────────────── */
async function deleteFromSupabase(key) {
  const sb = _getClient();
  if (!sb) return;

  try {
    const { error } = await sb
      .from('dashboard_store')
      .delete()
      .eq('store_key', key);

    if (error) throw error;
  } catch (err) {
    console.warn('[supabase-db] Delete failed for "' + key + '":', err.message);
  }
}

/* ── REALTIME: sync remote changes to local cache ────── */
function _subscribeRealtime() {
  const sb = _getClient();
  if (!sb) return;

  sb.channel('dashboard_store_sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'dashboard_store' },
      payload => {
        const { eventType, new: row, old } = payload;
        const key = row?.store_key || old?.store_key;
        if (!key) return;

        if (eventType === 'DELETE') {
          try { localStorage.removeItem(key); } catch (_) {}
        } else {
          try { localStorage.setItem(key, JSON.stringify(row.store_value)); } catch (_) {}
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
function _refreshActivePage(key) {
  const activeId = document.querySelector('.page.active')?.id;
  if (!activeId) return;

  const KEY_MAP = {
    [SK.tasks]:        { page: 'page-taskboard', fn: () => typeof renderTaskboard === 'function' && renderTaskboard() },
    [SK.clientTasks]:  { page: 'page-clients',   fn: () => typeof renderClients   === 'function' && renderClients()   },
    [SK.clients]:      { page: 'page-clients',   fn: () => typeof renderClients   === 'function' && renderClients()   },
    [SK.invoices]:     { page: 'page-docs',      fn: () => typeof renderDocs      === 'function' && renderDocs()      },
    [SK.templates]:    { page: 'page-docs',      fn: () => typeof renderDocs      === 'function' && renderDocs()      },
    [SK.docTypes]:     { page: 'page-docs',      fn: () => typeof renderDocs      === 'function' && renderDocs()      },
    [SK.kpi]:          { page: 'page-anal',      fn: () => typeof renderAnal      === 'function' && setTimeout(renderAnal, 80) },
    [SK.members]:      { page: 'page-backend',   fn: () => typeof renderBackend   === 'function' && renderBackend()   },
    [SK.roles]:        { page: 'page-backend',   fn: () => typeof renderBackend   === 'function' && renderBackend()   },
    [SK.keywords]:     { page: 'page-backend',   fn: () => typeof renderBackend   === 'function' && renderBackend()   },
    [SK.backendTasks]: { page: 'page-backend',   fn: () => typeof renderBackend   === 'function' && renderBackend()   },
    [SK.company]:      { page: 'page-backend',   fn: () => typeof renderBackend   === 'function' && renderBackend()   },
  };

  const entry = KEY_MAP[key];
  if (entry && activeId === entry.page) entry.fn();
}

/* ── INIT: await this before initDefaults() ─────────── */
async function initSupabase() {
  await pullFromSupabase();
  _subscribeRealtime();
}
