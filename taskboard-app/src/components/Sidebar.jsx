import { NavLink } from 'react-router-dom'
import { MEMBERS } from '../data.js'

const NAV = [
  {
    path: '/',
    label: 'Task Board',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>,
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 12.5L5.5 8L8.5 10.5L13 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 14.5H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  },
  {
    path: '/clients',
    label: 'Clients',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1.5 13.5C1.5 11.015 3.515 9 6 9s4.5 2.015 4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="11.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M14 13.5C14 11.567 12.657 10 11 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    path: '/docs',
    label: 'Docs',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M9.5 1.5H4a1 1 0 00-1 1v11a1 1 0 001 1h8a1 1 0 001-1V5.5L9.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M9.5 1.5v4H13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 8.5h5M5.5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    path: '/backend',
    label: 'Settings',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.22 3.22l1.06 1.06M11.72 11.72l1.06 1.06M3.22 12.78l1.06-1.06M11.72 4.28l1.06-1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  },
]

const sectionLabel = {
  fontSize: 9,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.18)',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '8px 10px 5px',
  userSelect: 'none',
}

export default function Sidebar() {
  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      background: 'linear-gradient(180deg, #140E0B 0%, #0E0A08 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      borderRight: '1px solid rgba(255,255,255,0.035)',
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: '22px 16px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {/* Logo mark */}
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #7A1020 0%, #5D0D18 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(93,13,24,0.50), inset 0 1px 0 rgba(255,255,255,0.10)',
          }}>
            <span style={{
              fontSize: 17, fontWeight: 800, color: '#FFF9EB',
              letterSpacing: '-0.05em', lineHeight: 1,
            }}>F</span>
          </div>

          <div>
            <div style={{
              fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.025em',
              color: 'rgba(255,255,255,0.90)', lineHeight: 1.1,
            }}>friction</div>
            <div style={{
              fontSize: 9, fontWeight: 600, letterSpacing: '0.13em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
              marginTop: 2,
            }}>Startup OS</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 14px 8px' }}/>

      {/* ── Nav ── */}
      <nav style={{ padding: '2px 8px', flexShrink: 0 }}>
        <div style={sectionLabel}>Workspace</div>
        {NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 11px 7px 13px',
              borderRadius: 8,
              cursor: 'pointer',
              color: isActive ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.35)',
              background: isActive
                ? 'linear-gradient(90deg, rgba(93,13,24,0.28) 0%, rgba(93,13,24,0.10) 100%)'
                : 'transparent',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              letterSpacing: isActive ? '-0.01em' : '0',
              transition: 'background 0.15s, color 0.15s',
              position: 'relative',
              marginBottom: 1,
              textDecoration: 'none',
              boxShadow: isActive ? 'inset 0 0 0 1px rgba(93,13,24,0.30)' : 'none',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.getAttribute('aria-current')) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.62)'
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.getAttribute('aria-current')) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
              }
            }}
          >
            {({ isActive }) => (
              <>
                {/* Active accent bar */}
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 18, borderRadius: '0 3px 3px 0',
                    background: 'linear-gradient(180deg, #7A1020, #5D0D18)',
                    boxShadow: '0 0 8px rgba(93,13,24,0.50)',
                  }}/>
                )}
                <span style={{ opacity: isActive ? 0.95 : 0.55, flexShrink: 0, lineHeight: 0 }}>
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }}/>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 14px 8px' }}/>

      {/* ── Team ── */}
      <div style={{ padding: '0 8px 8px', flexShrink: 0 }}>
        <div style={sectionLabel}>Team</div>
        {MEMBERS.map(m => (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 11px', borderRadius: 8,
            cursor: 'pointer', transition: 'background 0.14s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: `linear-gradient(135deg, ${m.color}DD, ${m.color})`,
                color: '#fff', fontSize: 10.5, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid rgba(255,255,255,0.12)',
                boxShadow: `0 2px 8px ${m.color}40`,
              }}>{m.id}</div>
              <div style={{
                position: 'absolute', bottom: 0, right: -1,
                width: 8, height: 8, borderRadius: '50%',
                background: '#34D399', border: '1.5px solid #100C0A',
                animation: 'pulse 3s ease infinite',
              }}/>
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.80)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>{m.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 400, marginTop: 1 }}>{m.role}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 14px 0' }}/>

      {/* ── Current user ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        flexShrink: 0, cursor: 'pointer', transition: 'background 0.14s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg, #A01828, #8B1525)',
          color: '#fff', fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          border: '1.5px solid rgba(255,255,255,0.12)',
          boxShadow: '0 2px 8px rgba(139,21,37,0.40)',
        }}>J</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.2, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Jeevan</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 400, marginTop: 1 }}>Founder</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: 'rgba(255,255,255,0.20)', flexShrink: 0 }}>
          <circle cx="8" cy="4"  r="1.2" fill="currentColor"/>
          <circle cx="8" cy="8"  r="1.2" fill="currentColor"/>
          <circle cx="8" cy="12" r="1.2" fill="currentColor"/>
        </svg>
      </div>
    </aside>
  )
}
