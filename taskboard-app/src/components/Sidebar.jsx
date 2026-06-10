import { MEMBERS } from '../data.js'

const NAV = [
  {
    id: 'tasks', label: 'Task Board', active: true,
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>,
  },
  {
    id: 'analytics', label: 'Analytics',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 12.5L5.5 8L8.5 10.5L13 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 14.5H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  },
  {
    id: 'clients', label: 'Clients',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1.5 13.5C1.5 11.015 3.515 9 6 9s4.5 2.015 4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="11.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M14 13.5C14 11.567 12.657 10 11 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    id: 'docs', label: 'Docs',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M9.5 1.5H4a1 1 0 00-1 1v11a1 1 0 001 1h8a1 1 0 001-1V5.5L9.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M9.5 1.5v4H13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 8.5h5M5.5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: 216,
      flexShrink: 0,
      background: '#0E0908',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      borderRight: '1px solid rgba(255,255,255,0.04)',
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: '20px 16px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 8,
            background: '#5D0D18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(93,13,24,0.40)',
          }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#FFF9EB', letterSpacing: '-0.04em', lineHeight: 1 }}>F</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              friction
            </div>
            <div style={{ fontSize: 9.5, fontWeight: 500, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.10em', textTransform: 'uppercase', marginTop: 1 }}>
              Startup OS
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 12px 6px' }}/>

      {/* ── Nav ── */}
      <nav style={{ padding: '4px 8px', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 8px 5px' }}>
          Workspace
        </div>
        {NAV.map(item => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '7px 10px 7px 12px',
              borderRadius: 7,
              cursor: 'pointer',
              color: item.active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.38)',
              background: item.active ? 'rgba(255,255,255,0.07)' : 'transparent',
              fontSize: 13,
              fontWeight: item.active ? 600 : 400,
              transition: 'background 0.12s, color 0.12s',
              position: 'relative',
              marginBottom: 1,
            }}
            onMouseEnter={e => {
              if (!item.active) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.60)'
              }
            }}
            onMouseLeave={e => {
              if (!item.active) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.38)'
              }
            }}
          >
            {/* Bloodstone active indicator — signal, not fill */}
            {item.active && (
              <div style={{
                position: 'absolute',
                left: 0, top: '50%', transform: 'translateY(-50%)',
                width: 2.5, height: 16,
                borderRadius: '0 2px 2px 0',
                background: '#5D0D18',
              }}/>
            )}
            <span style={{ opacity: item.active ? 0.9 : 0.6, flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }}/>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 12px 8px' }}/>

      {/* ── Team ── */}
      <div style={{ padding: '0 8px 10px', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 8px 7px' }}>
          Team
        </div>
        {MEMBERS.map(m => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '5px 10px',
              borderRadius: 7,
              cursor: 'pointer',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 26, height: 26,
                borderRadius: '50%',
                background: m.color,
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid rgba(255,255,255,0.10)',
              }}>
                {m.id}
              </div>
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 7, height: 7,
                borderRadius: '50%',
                background: '#22C55E',
                border: '1.5px solid #0E0908',
                animation: 'pulse 3s ease infinite',
              }}/>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.78)', lineHeight: 1.2 }}>
                {m.name}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', fontWeight: 400 }}>
                {m.role}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 12px 0' }}/>

      {/* ── Current user ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '11px 14px',
        flexShrink: 0,
        cursor: 'pointer',
        transition: 'background 0.12s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        <div style={{
          width: 28, height: 28,
          borderRadius: '50%',
          background: '#8B1525',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          border: '1.5px solid rgba(255,255,255,0.10)',
        }}>
          J
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Jeevan
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', fontWeight: 400 }}>
            Founder
          </div>
        </div>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ color: 'rgba(255,255,255,0.22)', flexShrink: 0 }}>
          <circle cx="7" cy="7" r="1" fill="currentColor"/>
          <circle cx="7" cy="3" r="1" fill="currentColor"/>
          <circle cx="7" cy="11" r="1" fill="currentColor"/>
        </svg>
      </div>
    </aside>
  )
}
