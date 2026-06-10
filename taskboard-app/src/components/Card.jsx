import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MEMBERS } from '../data.js'

const P_COLOR = { critical:'var(--p-critical)', high:'var(--p-high)', medium:'var(--p-medium)', low:'var(--p-low)' }
const P_LABEL = { critical:'Critical', high:'High', medium:'Medium', low:'Low' }

function fmtDate(s) {
  if (!s) return null
  const d = new Date(s), now = new Date()
  const diff = Math.ceil((d - now) / 86400000)
  return { label: d.toLocaleDateString('en-MY', { day:'numeric', month:'short' }), overdue: diff < 0, soon: diff >= 0 && diff <= 3 }
}

export default function Card({ task, onEdit, isDragOverlay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const member = MEMBERS.find(m => m.id === task.assignee)
  const pc = P_COLOR[task.priority] || 'var(--t3)'
  const dt = fmtDate(task.due)

  const cardEl = (
    <div
      onClick={() => !isDragOverlay && onEdit?.(task)}
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${pc}`,
        borderRadius: 'var(--r-lg)',
        padding: '13px 14px 12px',
        cursor: isDragOverlay ? 'grabbing' : 'pointer',
        userSelect: 'none',
        boxShadow: isDragOverlay ? 'var(--sh-float)' : 'var(--sh-card)',
        transform: isDragOverlay ? 'rotate(1.8deg) scale(1.03)' : 'none',
        transition: isDragOverlay ? 'none' : 'box-shadow 0.15s, border-color 0.15s, background 0.15s',
        animation: isDragOverlay ? 'none' : 'fadein 0.16s ease',
      }}
      onMouseEnter={e => { if (!isDragOverlay) { e.currentTarget.style.boxShadow = 'var(--sh-hover)'; e.currentTarget.style.background = 'var(--surface-2)'; }}}
      onMouseLeave={e => { if (!isDragOverlay) { e.currentTarget.style.boxShadow = 'var(--sh-card)'; e.currentTarget.style.background = 'var(--surface-1)'; }}}
    >
      {/* Top row: phase + priority */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8, gap: 6 }}>
        {task.phase && (
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
            color: 'var(--sage-hi)', background: 'var(--sage-bg)',
            border: '1px solid var(--sage-border)',
            borderRadius: 4, padding: '2px 7px',
          }}>{task.phase}</span>
        )}
        <span style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontWeight: 600, color: pc,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: pc, display: 'inline-block' }}/>
          {P_LABEL[task.priority]}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.2px', lineHeight: 1.35, marginBottom: 6 }}>
        {task.title}
      </div>

      {/* Note */}
      {task.note && (
        <div className="clamp2" style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.55, marginBottom: 10 }}>
          {task.note}
        </div>
      )}

      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 6, marginTop: task.note ? 0 : 6 }}>
        {member && (
          <div style={{ display:'flex', alignItems:'center', gap: 5 }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: member.color, border: '1.5px solid rgba(255,249,235,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#fff',
            }}>{member.id}</div>
            <span style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 500 }}>{member.name}</span>
          </div>
        )}
        {dt && (
          <span style={{
            marginLeft: 'auto', display:'flex', alignItems:'center', gap: 4,
            fontSize: 11, fontWeight: 500,
            color: dt.overdue ? 'var(--p-critical)' : dt.soon ? 'var(--p-medium)' : 'var(--t4)',
          }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {dt.label}{dt.overdue && ' · Overdue'}
          </span>
        )}
      </div>
    </div>
  )

  if (isDragOverlay) return cardEl

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0 : 1 }} {...attributes} {...listeners}>
      {cardEl}
    </div>
  )
}
