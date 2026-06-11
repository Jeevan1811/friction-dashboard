import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',          icon: '⬡', label: 'Tasks'     },
  { to: '/analytics', icon: '◈', label: 'Analytics' },
  { to: '/clients',   icon: '◉', label: 'Clients'   },
  { to: '/docs',      icon: '◧', label: 'Docs'      },
  { to: '/settings',  icon: '◎', label: 'Settings'  },
]

const TEAM = [
  { id: 'J', name: 'Jeevan', color: '#6366f1' },
  { id: 'B', name: 'Barat',  color: '#a855f7' },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: 220, minWidth: 220,
      background: '#080a10',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 14px',
      position: 'relative', zIndex: 10, overflow: 'hidden',
    }}>
      {/* Ambient top glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 180,
        background: 'radial-gradient(ellipse at 50% -20%, rgba(99,102,241,0.18), transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 17, fontWeight: 700, letterSpacing: '-0.03em',
        color: '#f2f4f8', padding: '0 6px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        marginBottom: 14, position: 'relative',
      }}>
        <span style={{
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>Friction</span>
        {' '}OS
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, position: 'relative' }}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10,
                fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                color: isActive ? '#f2f4f8' : '#8b93a7',
                background: isActive ? 'rgba(99,102,241,0.14)' : 'transparent',
                border: isActive ? '1px solid rgba(99,102,241,0.28)' : '1px solid transparent',
                transition: 'all 0.15s ease', cursor: 'pointer',
              }}>
                <span style={{
                  fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0,
                  color: isActive ? '#6366f1' : '#555e72',
                }}>{icon}</span>
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Team */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingTop: 14, marginTop: 8, position: 'relative',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9.5, fontWeight: 600, letterSpacing: '0.10em',
          color: '#555e72', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4,
        }}>Team</div>
        {TEAM.map(m => (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 10px', borderRadius: 9, marginBottom: 2,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: `${m.color}22`, border: `1.5px solid ${m.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, fontWeight: 700, color: m.color,
              flexShrink: 0, position: 'relative',
            }}>
              {m.id}
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 7, height: 7, borderRadius: '50%',
                background: '#34d399', border: '1.5px solid #080a10',
              }} />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#c8cdd8' }}>{m.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: '#555e72' }}>Founder</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
