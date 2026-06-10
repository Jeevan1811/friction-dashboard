import { useState } from "react";

/* ═══════════════════════════════════════════════════
   FRICTION TASK BOARD — Premium React Preview
   Dark sidebar · Warm pastel main · Terracotta accent
   ═══════════════════════════════════════════════════ */

/* ── DESIGN TOKENS ── */
const T = {
  // Sidebar
  sidebarBg:     '#1C1816',
  sidebarText:   '#9E938C',
  sidebarActive: '#FAF8F4',
  sidebarAccent: '#C4522A',
  sidebarBorder: 'rgba(250,248,244,0.08)',
  sidebarHover:  'rgba(250,248,244,0.05)',

  // Main (warm pastel)
  mainBg:    '#FAF8F4',
  surface:   '#FFFFFF',
  surface2:  '#F5F2EE',
  surface3:  '#EDE9E2',
  border:    '#E8E3DB',
  border2:   '#D4CCBF',

  // Text
  text:      '#1A1614',
  muted:     '#7A6E66',
  muted2:    '#ADA49C',

  // Brand accent
  accent:    '#C4522A',
  accentH:   '#B04825',
  accent10:  'rgba(196,82,42,0.10)',
  accent20:  'rgba(196,82,42,0.20)',

  // Semantic
  red:    '#DC2626', redBg:    'rgba(220,38,38,0.08)',
  amber:  '#D97706', amberBg:  'rgba(217,119,6,0.08)',
  blue:   '#2563EB', blueBg:   'rgba(37,99,235,0.08)',
  green:  '#16A34A', greenBg:  'rgba(22,163,74,0.08)',
  violet: '#7C3AED', violetBg: 'rgba(124,58,237,0.08)',
};

/* ── SAMPLE DATA ── */
const PIPELINE = [
  { key:'validate', name:'Validate',   color:'#DC2626' },
  { key:'form',     name:'Form Co.',   color:'#D97706' },
  { key:'mvp',      name:'Build MVP',  color:'#2563EB' },
  { key:'client',   name:'1st Client', color:'#C4522A' },
  { key:'beta',     name:'Beta',       color:'#16A34A' },
  { key:'comply',   name:'Comply',     color:'#7C3AED' },
  { key:'scale',    name:'Scale',      color:'#0F766E' },
];

const PHASE_COLORS = {
  'NOW — Validate':       '#DC2626',
  'COMPANY FORMATION':    '#D97706',
  'PRODUCT & TECH':       '#2563EB',
  'COMPLIANCE & FUNDING': '#7C3AED',
};

const PRIORITY = {
  red:   { label:'Do Now',   color:'#DC2626', bg:'rgba(220,38,38,0.09)' },
  amber: { label:'Delegate', color:'#D97706', bg:'rgba(217,119,6,0.09)' },
  yellow:{ label:'Delegate', color:'#D97706', bg:'rgba(217,119,6,0.09)' },
  blue:  { label:'Schedule', color:'#2563EB', bg:'rgba(37,99,235,0.09)' },
  green: { label:'Do Last',  color:'#16A34A', bg:'rgba(22,163,74,0.09)' },
};

const MEMBERS = {
  M: { bg:'rgba(124,58,237,0.12)', color:'#7C3AED' },
  J: { bg:'rgba(196,82,42,0.12)',  color:'#C4522A' },
  B: { bg:'rgba(22,163,74,0.12)',  color:'#16A34A' },
};

const INIT_TASKS = [
  { id:'t1',  phase:'NOW — Validate',       title:'Conduct 20 customer discovery interviews',  note:'Target: SME owners in KL/Selangor',      assignedTo:'M', priority:'red',   stage:'validate', dueDate:'2026-06-15', done:false },
  { id:'t2',  phase:'NOW — Validate',       title:'Build problem-solution fit landing page',   note:'Use Framer or Webflow',                  assignedTo:'J', priority:'amber', stage:'validate', dueDate:'2026-06-12', done:true  },
  { id:'t3',  phase:'NOW — Validate',       title:'Analyse interview data + key themes',       note:'Affinity mapping, top 5 pain points',    assignedTo:'B', priority:'red',   stage:'validate', dueDate:'2026-06-18', done:false },
  { id:'t4',  phase:'COMPANY FORMATION',    title:'Register Sdn Bhd with SSM',                 note:'Prepare MOA & AA documents',             assignedTo:'M', priority:'blue',  stage:'form',     dueDate:'2026-06-20', done:false },
  { id:'t5',  phase:'COMPANY FORMATION',    title:'Open CIMB company bank account',            note:'Need SSM cert + director ICs',           assignedTo:'J', priority:'blue',  stage:'form',     dueDate:'2026-06-25', done:false },
  { id:'t6',  phase:'COMPANY FORMATION',    title:'Draft shareholders agreement',              note:'Equity split: M-40% J-35% B-25%',        assignedTo:'M', priority:'amber', stage:'form',     dueDate:'2026-06-28', done:false },
  { id:'t7',  phase:'PRODUCT & TECH',       title:'Ship dashboard v1 to Supabase',             note:'Multi-user auth + realtime sync done',   assignedTo:'J', priority:'red',   stage:'mvp',      dueDate:'2026-06-22', done:false },
  { id:'t8',  phase:'PRODUCT & TECH',       title:'Mobile-responsive layout',                  note:'Target: iOS Safari + Chrome Android',    assignedTo:'B', priority:'amber', stage:'mvp',      dueDate:'2026-07-01', done:false },
  { id:'t9',  phase:'PRODUCT & TECH',       title:'Integrate Stripe for billing',              note:'MYR currency support required',          assignedTo:'J', priority:'green', stage:'mvp',      dueDate:'2026-07-10', done:false },
  { id:'t10', phase:'COMPLIANCE & FUNDING', title:'Apply for MaGIC pre-accelerator',           note:'Deadline: 30 Jun — do not miss',         assignedTo:'M', priority:'red',   stage:'comply',   dueDate:'2026-06-30', done:false },
  { id:'t11', phase:'COMPLIANCE & FUNDING', title:'Register for SST if revenue > RM500k',      note:'LHDN compliance requirement',            assignedTo:'M', priority:'blue',  stage:'comply',   dueDate:'2026-07-15', done:false },
];

/* ── HELPERS ── */
function daysLeft(iso) {
  if (!iso) return 999;
  return Math.ceil((new Date(iso) - new Date()) / 86400000);
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-MY', { day:'numeric', month:'short' });
}

/* ═══════════════════════════
   SVG ICONS
═══════════════════════════ */
const Icons = {
  tasks: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <rect x="2" y="2" width="5" height="5" rx="1.2"/>
      <rect x="9" y="2" width="5" height="5" rx="1.2"/>
      <rect x="2" y="9" width="5" height="5" rx="1.2"/>
      <rect x="9" y="9" width="5" height="5" rx="1.2" opacity="0.35"/>
    </svg>
  ),
  chart: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="9" width="3" height="6" rx="1"/>
      <rect x="6" y="5" width="3" height="10" rx="1"/>
      <rect x="11" y="1" width="3" height="14" rx="1" opacity="0.35"/>
    </svg>
  ),
  users: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="6" cy="5" r="3"/>
      <path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" opacity="0.8"/>
      <circle cx="12.5" cy="4" r="2" opacity="0.4"/>
      <path d="M11 13.5c0-2 1.34-3.5 3.5-3.5" opacity="0.4" strokeWidth="1.5" fill="none" stroke="currentColor"/>
    </svg>
  ),
  docs: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 1h6.5L13 4.5V15H3V1z" opacity="0.5"/>
      <path d="M9.5 1v3.5H13" fill="none" stroke="currentColor" strokeWidth="1"/>
      <path d="M5 7.5h6M5 9.5h6M5 11.5h3.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  server: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="14" height="4" rx="1.5"/>
      <rect x="1" y="6" width="14" height="4" rx="1.5" opacity="0.5"/>
      <rect x="1" y="11" width="14" height="4" rx="1.5" opacity="0.3"/>
      <circle cx="12.5" cy="3" r="1" fill="#16A34A"/>
    </svg>
  ),
  search: () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.5 0a6.5 6.5 0 1 1 0 13A6.5 6.5 0 0 1 6.5 0zm0 1.5a5 5 0 1 0 0 10A5 5 0 0 0 6.5 1.5zm4.97 9.53a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06-1.06l3.5-3.5z"/>
    </svg>
  ),
  plus: () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  sync: () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="8" r="3" fill="#16A34A"/>
      <circle cx="8" cy="8" r="3" fill="#16A34A" opacity="0.3">
        <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),
};

const NAV = [
  { id:'taskboard', label:'Task Board', icon: Icons.tasks  },
  { id:'anal',      label:'Analytics',  icon: Icons.chart  },
  { id:'clients',   label:'Clients',    icon: Icons.users  },
  { id:'docs',      label:'Docs',       icon: Icons.docs   },
  { id:'backend',   label:'Backend',    icon: Icons.server },
];

/* ═══════════════════════════
   SIDEBAR
═══════════════════════════ */
function Sidebar({ active, onNav, pendingCount }) {
  return (
    <aside style={{
      width: '216px',
      minWidth: '216px',
      height: '100vh',
      background: T.sidebarBg,
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      overflowY: 'auto',
      scrollbarWidth: 'none',
    }}>
      {/* Logo */}
      <div style={{ padding:'22px 20px 18px', borderBottom:`1px solid ${T.sidebarBorder}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{
            width:'30px', height:'30px',
            background: T.sidebarAccent,
            borderRadius:'8px',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'15px', fontWeight:'800', color:'#fff',
            letterSpacing:'-0.5px',
          }}>F</div>
          <div>
            <div style={{ fontSize:'15px', fontWeight:'700', color:T.sidebarActive, letterSpacing:'-0.4px' }}>friction</div>
            <div style={{ fontSize:'10px', color:T.sidebarText, fontFamily:'JetBrains Mono, monospace', marginTop:'1px' }}>startup os</div>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding:'18px 20px 6px' }}>
        <div style={{ fontSize:'10px', fontWeight:'600', letterSpacing:'0.1em', color:T.sidebarText, textTransform:'uppercase', fontFamily:'JetBrains Mono, monospace', opacity:0.6 }}>
          Workspace
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding:'0 10px', flex:1 }}>
        {NAV.map(item => {
          const isActive = item.id === active;
          return (
            <div
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'9px 10px',
                borderRadius:'8px',
                marginBottom:'2px',
                cursor:'pointer',
                background: isActive ? 'rgba(196,82,42,0.14)' : 'transparent',
                color: isActive ? T.sidebarAccent : T.sidebarText,
                borderLeft: `3px solid ${isActive ? T.sidebarAccent : 'transparent'}`,
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.12s',
                userSelect: 'none',
              }}
              onMouseEnter={e => { if(!isActive){ e.currentTarget.style.background=T.sidebarHover; e.currentTarget.style.color=T.sidebarActive; } }}
              onMouseLeave={e => { if(!isActive){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=T.sidebarText; } }}
            >
              <span style={{ opacity: isActive ? 1 : 0.55, flexShrink:0, display:'flex' }}>
                <item.icon/>
              </span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.id === 'taskboard' && pendingCount > 0 && (
                <span style={{
                  fontSize:'10px', fontWeight:'700',
                  background: T.sidebarAccent, color:'#fff',
                  padding:'1px 7px', borderRadius:'10px',
                  fontFamily:'JetBrains Mono, monospace',
                }}>{pendingCount}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding:'14px 14px 18px', borderTop:`1px solid ${T.sidebarBorder}` }}>
        {/* Sync status */}
        <div style={{
          display:'flex', alignItems:'center', gap:'8px',
          padding:'7px 10px', borderRadius:'7px',
          background:'rgba(22,163,74,0.08)',
          marginBottom:'10px',
        }}>
          <Icons.sync/>
          <span style={{ fontSize:'11px', color:'#16A34A', fontFamily:'JetBrains Mono, monospace' }}>Live · Supabase</span>
        </div>
        {/* User */}
        <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
          <div style={{
            width:'28px', height:'28px', borderRadius:'50%',
            background:'rgba(196,82,42,0.15)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'11px', fontWeight:'700', color:T.sidebarAccent, flexShrink:0,
          }}>J</div>
          <div>
            <div style={{ fontSize:'12px', fontWeight:'600', color:T.sidebarActive }}>Jeevan</div>
            <div style={{ fontSize:'10px', color:T.sidebarText, fontFamily:'JetBrains Mono, monospace' }}>CTO</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ═══════════════════════════
   TOP BAR
═══════════════════════════ */
function TopBar({ tasks }) {
  const done = tasks.filter(t => t.done).length;
  const today = new Date().toLocaleDateString('en-MY', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'16px 28px', gap:'16px',
      background: T.surface,
      borderBottom:`1px solid ${T.border}`,
      position:'sticky', top:0, zIndex:100,
    }}>
      <div>
        <div style={{ fontSize:'19px', fontWeight:'700', letterSpacing:'-0.4px', color:T.text }}>Task Board</div>
        <div style={{ fontSize:'11px', color:T.muted, marginTop:'2px', fontFamily:'JetBrains Mono, monospace' }}>
          {today} · {done}/{tasks.length} complete
        </div>
      </div>
      <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
        {/* Search */}
        <div style={{
          display:'flex', alignItems:'center', gap:'8px',
          padding:'7px 14px',
          background: T.surface2,
          border:`1px solid ${T.border}`,
          borderRadius:'8px',
          color: T.muted2, fontSize:'13px', cursor:'text',
        }}>
          <Icons.search/>
          <span style={{ fontFamily:'Inter, sans-serif' }}>Search tasks…</span>
        </div>
        {/* Add task btn */}
        <button style={{
          padding:'7px 16px',
          borderRadius:'8px',
          background: T.accent,
          color:'#fff', border:'none',
          fontSize:'13px', fontWeight:'600',
          cursor:'pointer',
          display:'flex', alignItems:'center', gap:'6px',
          fontFamily:'Inter, sans-serif',
          boxShadow:'0 2px 8px rgba(196,82,42,0.28)',
          transition:'background 0.12s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = T.accentH}
        onMouseLeave={e => e.currentTarget.style.background = T.accent}
        >
          <Icons.plus/> Add Task
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════
   PIPELINE TRACK
═══════════════════════════ */
function PipelineTrack({ tasks }) {
  const tot = {}, done = {};
  tasks.forEach(t => {
    tot[t.stage]  = (tot[t.stage]  || 0) + 1;
    if (t.done) done[t.stage] = (done[t.stage] || 0) + 1;
  });
  const totalDone = tasks.filter(t => t.done).length;
  const pct = tasks.length ? Math.round(totalDone / tasks.length * 100) : 0;

  return (
    <div style={{ padding:'20px 28px 0' }}>
      <div style={{
        background: T.surface,
        border:`1px solid ${T.border}`,
        borderRadius:'14px',
        padding:'16px 20px',
        boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
          <span style={{ fontSize:'11px', fontWeight:'600', letterSpacing:'0.08em', color:T.muted2, textTransform:'uppercase', fontFamily:'JetBrains Mono, monospace' }}>
            Startup Pipeline
          </span>
          <span style={{ fontSize:'12px', color:T.accent, fontWeight:'600', fontFamily:'JetBrains Mono, monospace' }}>
            {pct}% overall · {totalDone}/{tasks.length}
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', overflowX:'auto', scrollbarWidth:'none', gap:0 }}>
          {PIPELINE.map((s, i) => {
            const t = tot[s.key] || 0, d = done[s.key] || 0;
            const isDone = t > 0 && d === t;
            const isActive = !isDone && (d > 0 || (i === 0 && t > 0));
            return (
              <div key={s.key} style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:'7px',
                  padding:'5px 12px', borderRadius:'20px',
                  background: isDone ? 'rgba(22,163,74,0.08)' : isActive ? T.accent10 : 'transparent',
                  transition:'background 0.2s',
                }}>
                  <div style={{
                    width:'8px', height:'8px', borderRadius:'50%',
                    background: isDone ? '#16A34A' : isActive ? T.accent : T.border2,
                    boxShadow: isActive ? `0 0 0 3px rgba(196,82,42,0.15)` : 'none',
                    flexShrink:0,
                    transition:'all 0.3s',
                  }}/>
                  <span style={{ fontSize:'11px', fontWeight:'600', color: isDone ? '#16A34A' : isActive ? T.accent : T.muted2 }}>
                    {s.name}
                  </span>
                  <span style={{ fontSize:'10px', color: isActive ? T.accent : T.muted2, fontFamily:'JetBrains Mono, monospace', opacity:0.7 }}>
                    {d}/{t}
                  </span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <span style={{ fontSize:'13px', color:T.border2, padding:'0 2px', flexShrink:0 }}>›</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════
   STATS ROW
═══════════════════════════ */
function StatsRow({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pct = total ? Math.round(done/total*100) : 0;
  const byM = tasks.filter(t => t.assignedTo==='M');
  const byJ = tasks.filter(t => t.assignedTo==='J');
  const byB = tasks.filter(t => t.assignedTo==='B');
  const crit = tasks.filter(t => t.priority==='red' && !t.done).length;

  const cards = [
    { num:`${pct}%`,  label:'Overall Done',  color:'#16A34A', bar:pct },
    { num:`${done}/${total}`, label:'Complete', color:T.accent, bar:pct },
    { num:`${byM.filter(t=>t.done).length}/${byM.length}`, label:"M's Tasks",  color:'#7C3AED', bar: byM.length ? Math.round(byM.filter(t=>t.done).length/byM.length*100) : 0 },
    { num:`${byJ.filter(t=>t.done).length}/${byJ.length}`, label:"J's Tasks",  color:T.accent,  bar: byJ.length ? Math.round(byJ.filter(t=>t.done).length/byJ.length*100) : 0 },
    { num:`${byB.filter(t=>t.done).length}/${byB.length}`, label:"B's Tasks",  color:'#16A34A', bar: byB.length ? Math.round(byB.filter(t=>t.done).length/byB.length*100) : 0 },
    { num:crit,       label:'Critical Left', color:'#DC2626', bar:0 },
  ];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'10px', padding:'16px 28px' }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background: T.surface,
          border:`1px solid ${T.border}`,
          borderRadius:'12px',
          padding:'16px 16px',
          position:'relative', overflow:'hidden',
          boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
          transition:'box-shadow 0.15s, transform 0.15s',
          cursor:'default',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform='translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform='translateY(0)'; }}
        >
          {/* Top accent line */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:c.color, opacity:0.5, borderRadius:'12px 12px 0 0' }}/>
          <div style={{ fontSize:'22px', fontWeight:'700', lineHeight:1, color:c.color, fontFamily:'JetBrains Mono, monospace', letterSpacing:'-0.5px' }}>{c.num}</div>
          <div style={{ fontSize:'11px', color:T.muted, marginTop:'5px', fontWeight:'500' }}>{c.label}</div>
          {c.bar > 0 && (
            <div style={{ height:'2px', background:T.border, borderRadius:'1px', marginTop:'10px', overflow:'hidden' }}>
              <div style={{ height:'100%', background:c.color, width:`${c.bar}%`, borderRadius:'1px', transition:'width 0.6s ease' }}/>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════
   FILTER TOOLBAR
═══════════════════════════ */
function FilterToolbar({ mf, setMf, cf, setCf }) {
  const chip = (active, activeColor) => ({
    display:'inline-flex', alignItems:'center', gap:'6px',
    padding:'5px 12px', borderRadius:'20px',
    fontSize:'12px', fontWeight: active ? '600' : '500',
    cursor:'pointer', userSelect:'none',
    border:`1px solid ${active ? activeColor+'44' : T.border}`,
    background: active ? `${activeColor}12` : T.surface,
    color: active ? activeColor : T.muted,
    transition:'all 0.12s',
    boxShadow:'0 1px 2px rgba(0,0,0,0.03)',
    fontFamily:'Inter, sans-serif',
  });

  const members = [
    { id:'ALL', label:'All members',  color:T.muted },
    { id:'M',   label:'M (Mentee)',   color:'#7C3AED', mc:MEMBERS.M },
    { id:'J',   label:'Jeevan',       color:T.accent,  mc:MEMBERS.J },
    { id:'B',   label:'Barat',        color:'#16A34A', mc:MEMBERS.B },
  ];
  const priorities = [
    { id:'red',   label:'Do Now',   color:'#DC2626' },
    { id:'amber', label:'Delegate', color:'#D97706' },
    { id:'blue',  label:'Schedule', color:'#2563EB' },
    { id:'green', label:'Do Last',  color:'#16A34A' },
  ];

  return (
    <div style={{ display:'flex', alignItems:'center', padding:'0 28px 16px', gap:'6px', flexWrap:'wrap' }}>
      {members.map(m => (
        <div key={m.id} onClick={() => setMf(m.id)} style={chip(mf===m.id, m.color)}>
          {m.mc && (
            <div style={{ width:'17px', height:'17px', borderRadius:'50%', background:m.mc.bg, color:m.mc.color, fontSize:'9px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center' }}>{m.id}</div>
          )}
          {m.label}
        </div>
      ))}
      <div style={{ width:'1px', height:'24px', background:T.border, margin:'0 4px' }}/>
      {priorities.map(p => (
        <div key={p.id} onClick={() => setCf(cf===p.id ? 'ALL' : p.id)} style={chip(cf===p.id, p.color)}>
          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:p.color, flexShrink:0 }}/>
          {p.label}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════
   TASK ROW
═══════════════════════════ */
function TaskRow({ task, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const dl = daysLeft(task.dueDate);
  const ds = task.done ? 'done' : dl < 0 ? 'overdue' : dl <= 5 ? 'soon' : 'ok';
  const dueLabel = task.done ? 'Done ✓' : dl < 0 ? `${Math.abs(dl)}d overdue` : dl === 0 ? 'Due today' : `${dl}d left`;
  const dueC = { done:{bg:'rgba(22,163,74,0.08)',color:'#16A34A'}, overdue:{bg:'rgba(220,38,38,0.08)',color:'#DC2626'}, soon:{bg:'rgba(217,119,6,0.08)',color:'#D97706'}, ok:{bg:T.surface2,color:T.muted2} }[ds];
  const pm = PRIORITY[task.priority] || PRIORITY.green;
  const mc = MEMBERS[task.assignedTo] || MEMBERS.J;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:'grid',
        gridTemplateColumns:'1fr 100px 78px 104px 78px 60px',
        padding:'11px 16px',
        borderBottom:`1px solid ${T.border}`,
        alignItems:'center', gap:'8px',
        background: hovered ? T.surface2 : T.surface,
        transition:'background 0.1s',
      }}
    >
      {/* Name */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', minWidth:0 }}>
        <div
          onClick={() => onToggle(task.id)}
          style={{
            width:'15px', height:'15px', borderRadius:'4px', flexShrink:0,
            border:`1.5px solid ${task.done ? T.accent : T.border2}`,
            background: task.done ? T.accent : 'transparent',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.15s',
          }}
        >
          {task.done && <span style={{ color:'#fff', fontSize:'9px', fontWeight:'700', lineHeight:1 }}>✓</span>}
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:'13px', fontWeight:'500', color: task.done ? T.muted2 : T.text, textDecoration: task.done ? 'line-through' : 'none', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{task.title}</div>
          {task.note && <div style={{ fontSize:'11px', color:T.muted2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:'1px' }}>{task.note}</div>}
        </div>
      </div>

      {/* Priority */}
      <div>
        <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 9px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', background:pm.bg, color:pm.color, border:`1px solid ${pm.color}22` }}>
          <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'currentColor', flexShrink:0 }}/>
          {pm.label}
        </span>
      </div>

      {/* Assignee */}
      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
        <div style={{ width:'21px', height:'21px', borderRadius:'50%', background:mc.bg, color:mc.color, fontSize:'9px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{task.assignedTo}</div>
        <span style={{ fontSize:'12px', color:T.muted }}>{task.assignedTo}</span>
      </div>

      {/* Due */}
      <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
        <span style={{ fontSize:'11px', color:T.muted, fontFamily:'JetBrains Mono, monospace' }}>{fmtDate(task.dueDate)}</span>
        <span style={{ fontSize:'10px', fontWeight:'600', padding:'1px 6px', borderRadius:'4px', width:'fit-content', background:dueC.bg, color:dueC.color, fontFamily:'JetBrains Mono, monospace' }}>{dueLabel}</span>
      </div>

      {/* Stage */}
      <div>
        <span style={{ fontSize:'10px', fontWeight:'600', padding:'3px 8px', borderRadius:'4px', background:T.accent10, color:T.accent, border:`1px solid rgba(196,82,42,0.15)`, fontFamily:'JetBrains Mono, monospace' }}>{task.stage}</span>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:'3px', opacity: hovered ? 1 : 0, transition:'opacity 0.1s' }}>
        {['✏','↗','✕'].map((icon, i) => (
          <button key={i} style={{ width:'21px', height:'21px', borderRadius:'4px', background:'none', border:`1px solid ${T.border}`, color:T.muted2, cursor:'pointer', fontSize:'10px', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>{icon}</button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════
   PHASE GROUP
═══════════════════════════ */
function PhaseGroup({ phase, tasks, onToggle }) {
  const [open, setOpen] = useState(true);
  const color = PHASE_COLORS[phase] || T.accent;
  const done = tasks.filter(t => t.done).length;
  const pct = tasks.length ? Math.round(done/tasks.length*100) : 0;
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ marginBottom:'8px' }}>
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display:'flex', alignItems:'center', gap:'10px',
          padding:'11px 16px', borderRadius:'10px',
          cursor:'pointer', userSelect:'none',
          background: T.surface,
          border:`1px solid ${hovered ? T.border2 : T.border}`,
          marginBottom:'1px',
          boxShadow: hovered ? '0 2px 10px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.03)',
          transition:'all 0.12s',
        }}
      >
        <span style={{ fontSize:'10px', color:T.muted2, transition:'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', display:'inline-block' }}>›</span>
        <div style={{ width:'3px', height:'16px', borderRadius:'2px', background:color, flexShrink:0 }}/>
        <span style={{ fontSize:'13px', fontWeight:'600', color:T.text }}>{phase}</span>
        <div style={{ display:'flex', gap:'8px', alignItems:'center', marginLeft:'auto' }}>
          <div style={{ width:'64px', height:'3px', background:T.border, borderRadius:'2px', overflow:'hidden' }}>
            <div style={{ height:'100%', background:color, width:`${pct}%`, borderRadius:'2px', transition:'width 0.5s' }}/>
          </div>
          <span style={{ fontSize:'11px', color:T.muted2, fontFamily:'JetBrains Mono, monospace', background:T.surface2, padding:'2px 8px', borderRadius:'10px', border:`1px solid ${T.border}` }}>{done}/{tasks.length}</span>
        </div>
      </div>

      {open && (
        <>
          {/* Column headers */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 78px 104px 78px 60px', padding:'6px 16px', background:T.surface2, border:`1px solid ${T.border}`, borderTop:'none' }}>
            {['Task','Priority','Assigned','Due','Stage',''].map((h, i) => (
              <div key={i} style={{ fontSize:'10px', fontWeight:'600', letterSpacing:'0.07em', color:T.muted2, textTransform:'uppercase' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ border:`1px solid ${T.border}`, borderTop:'none', borderRadius:'0 0 10px 10px', overflow:'hidden' }}>
            {tasks.map(t => <TaskRow key={t.id} task={t} onToggle={onToggle}/>)}
          </div>

          {/* Add row */}
          <div
            style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 16px', background:T.surface, border:`1px solid ${T.border}`, borderTop:`1px dashed ${T.border}`, cursor:'pointer', color:T.muted2, fontSize:'12px', transition:'all 0.1s', borderRadius:'0 0 10px 10px' }}
            onMouseEnter={e => { e.currentTarget.style.color=T.accent; e.currentTarget.style.background='rgba(196,82,42,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color=T.muted2; e.currentTarget.style.background=T.surface; }}
          >
            <div style={{ width:'15px', height:'15px', borderRadius:'4px', border:'1.5px dashed currentColor', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', flexShrink:0 }}>+</div>
            Add task to {phase}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════
   ROOT COMPONENT
═══════════════════════════ */
export default function FrictionTaskBoard() {
  const [activePage, setActivePage] = useState('taskboard');
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [mf, setMf] = useState('ALL');
  const [cf, setCf] = useState('ALL');

  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  const visible = tasks.filter(t => {
    if (mf !== 'ALL' && t.assignedTo !== mf) return false;
    if (cf !== 'ALL' && t.priority !== cf && !(cf === 'amber' && t.priority === 'yellow')) return false;
    return true;
  });

  const phases = [...new Set(tasks.map(t => t.phase))];

  return (
    <div style={{
      display:'flex',
      minHeight:'100vh',
      background: T.mainBg,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      color: T.text,
      /* Subtle warm paper texture */
      backgroundImage: `
        radial-gradient(ellipse at 20% 0%, rgba(196,82,42,0.04) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 100%, rgba(196,82,42,0.03) 0%, transparent 60%)
      `,
    }}>
      <Sidebar active={activePage} onNav={setActivePage} pendingCount={tasks.filter(t=>!t.done).length}/>

      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', maxHeight:'100vh', overflowY:'auto' }}>
        <TopBar tasks={tasks}/>

        <div style={{ flex:1 }}>
          <PipelineTrack tasks={tasks}/>
          <StatsRow tasks={tasks}/>
          <FilterToolbar mf={mf} setMf={setMf} cf={cf} setCf={setCf}/>

          {/* Board */}
          <div style={{ padding:'0 28px 48px' }}>
            {phases.map(phase => {
              const phaseTasks = visible.filter(t => t.phase === phase);
              const allPhaseTasks = tasks.filter(t => t.phase === phase);
              if (phaseTasks.length === 0 && (mf !== 'ALL' || cf !== 'ALL')) return null;
              return (
                <PhaseGroup
                  key={phase}
                  phase={phase}
                  tasks={(mf !== 'ALL' || cf !== 'ALL') ? phaseTasks : allPhaseTasks}
                  onToggle={toggleTask}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
