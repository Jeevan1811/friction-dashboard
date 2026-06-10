import { MEMBERS } from '../data.js'

const NAV = [
  { id: 'tasks', label: 'Task Board', active: true, icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg> },
  { id: 'analytics', label: 'Analytics', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 12.5L5.5 8L8.5 10.5L13 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 14.5H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { id: 'clients', label: 'Clients', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1.5 13.5C1.5 11.015 3.515 9 6 9s4.5 2.015 4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="12" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M14.5 13.5c0-2-1.12-3.5-2.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: 'docs', label: 'Docs', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 1.5h5l3.5 3.5V14a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5V2a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.4"/><path d="M9 1.5V5H12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 8.5h4M6 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: 'var(--sb-w)', minWidth: 'var(--sb-w)', height: '100vh',
      background: 'var(--surface-0)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: 'var(--sage-hi)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: '#0C0407', letterSpacing: '-0.5px', lineHeight: 1 }}>F</span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>friction</div>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 2 }}>Startup OS</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--t4)', padding: '6px 8px 8px' }}>Workspace</p>

        {NAV.map(item => (
          <button key={item.id} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 7, border: 'none',
            background: item.active ? 'var(--surface-2)' : 'transparent',
            color: item.active ? 'var(--t1)' : 'var(--t3)',
            cursor: 'pointer', fontSize: 13, fontWeight: item.active ? 600 : 400,
            textAlign: 'left', transition: 'background 0.12s, color 0.12s',
            position: 'relative', letterSpacing: '-0.1px',
          }}
          onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--t2)'; }}}
          onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t3)'; }}}
          >
            {item.active && <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 2.5, height: 16, background: 'var(--sage-hi)', borderRadius: '0 2px 2px 0' }}/>}
            <span style={{ opacity: item.active ? 1 : 0.6, flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ height: 1, background: 'var(--border)', margin: '12px 0 10px' }}/>

        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--t4)', padding: '2px 8px 8px' }}>Team</p>

        {MEMBERS.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px', borderRadius: 7 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 25, height: 25, borderRadius: '50%',
                background: m.color,
                border: '1.5px solid rgba(255,249,235,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10.5, fontWeight: 700, color: '#fff',
              }}>{m.id}</div>
              <span style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 7, height: 7, borderRadius: '50%',
                background: '#4CAF82', border: '1.5px solid var(--surface-0)',
                animation: 'pulse 3s ease-in-out infinite',
              }}/>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--t2)', lineHeight: 1.2 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: 'var(--t4)', lineHeight: 1.1 }}>{m.role}</div>
            </div>
          </div>
        ))}
      </nav>

      {/* User strip */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--surface-3)',
          border: '1.5px solid var(--border-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: 'var(--sage-hi)', flexShrink: 0,
        }}>J</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', lineHeight: 1.2 }}>Jeevan</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.1 }}>Founder</div>
        </div>
        <button style={{
          background: 'none', border: 'none', padding: 4, borderRadius: 6,
          cursor: 'pointer', color: 'var(--t3)', display: 'flex', alignItems: 'center',
          transition: 'color 0.12s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--t2)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}
