import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MEMBERS } from '../data.js'

const P_COLOR = {
  critical: '#C0392B',
  high:     '#C05B30',
  medium:   '#C07D40',
  low:      '#2D8C5A',
}

const P_BG = {
  critical: 'rgba(192,57,43,0.08)',
  high:     'rgba(192,91,48,0.08)',
  medium:   'rgba(192,125,64,0.08)',
  low:      'rgba(45,140,90,0.08)',
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d     = new Date(dateStr)
  const today = new Date(); today.setHours(0,0,0,0)
  const dd    = new Date(d); dd.setHours(0,0,0,0)
  const diff  = Math.round((dd - today) / 86400000)
  if (diff < 0)   return { label: `${Math.abs(diff)}d overdue`, cls: 'overdue' }
  if (diff === 0) return { label: 'Today',                      cls: 'soon' }
  if (diff <= 3)  return { label: `${diff}d left`,              cls: 'soon' }
  return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), cls: '' }
}

/* ── Card inner content ─────────────────── */
function CardContent({ task, pColor, pBg, member, dateInfo }) {
  return (
    <>
      {/* Priority accent bar — gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: 3,
        background: `linear-gradient(180deg, ${pColor} 0%, ${pColor}88 100%)`,
        borderRadius: '12px 0 0 12px',
      }}/>

      {/* Phase tag */}
      {task.phase && (
        <div style={{ marginBottom: 8 }}>
          <span style={{
            fontSize: 9.5, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: '#5B8C7D',
            background: 'rgba(91,140,125,0.09)',
            border: '1px solid rgba(91,140,125,0.18)',
            borderRadius: 5, padding: '2px 7px',
          }}>{task.phase}</span>
        </div>
      )}

      {/* Title */}
      <div style={{
        fontSize: 13.5,
        fontWeight: 600,
        color: '#1A1410',
        lineHeight: 1.42,
        letterSpacing: '-0.015em',
        marginBottom: task.note ? 6 : 10,
      }}>
        {task.title}
      </div>

      {/* Note */}
      {task.note && (
        <div style={{
          fontSize: 11.5,
          color: '#7A6B62',
          lineHeight: 1.58,
          marginBottom: 10,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {task.note}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 8,
        borderTop: '1px solid rgba(26,20,16,0.05)',
        paddingTop: 9, marginTop: !task.note && !task.phase ? 4 : 0,
      }}>
        {/* Assignee + priority */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {member ? (
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: `linear-gradient(135deg, ${member.color}DD, ${member.color})`,
              color: '#fff', fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: `0 1px 4px ${member.color}50`,
            }}>{member.id}</div>
          ) : (
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(26,20,16,0.07)', flexShrink: 0 }}/>
          )}
          <span style={{
            fontSize: 9.5, fontWeight: 700,
            color: pColor,
            background: pBg,
            borderRadius: 99, padding: '1.5px 7px',
            border: `1px solid ${pColor}20`,
          }}>
            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
          </span>
        </div>

        {/* Due date */}
        {dateInfo && (
          <span style={{
            fontSize: 10.5,
            fontWeight: dateInfo.cls === 'overdue' ? 700 : 500,
            color: dateInfo.cls === 'overdue'
              ? '#C0392B'
              : dateInfo.cls === 'soon'
              ? '#C07D40'
              : '#B0A49C',
            letterSpacing: '-0.01em',
          }}>
            {dateInfo.cls === 'overdue' ? '⚠ ' : ''}{dateInfo.label}
          </span>
        )}
      </div>
    </>
  )
}

/* ── CardOverlay — drag ghost ───────────── */
export function CardOverlay({ task }) {
  const member   = MEMBERS.find(m => m.id === task.assignee)
  const pColor   = P_COLOR[task.priority] || '#B0A49C'
  const pBg      = P_BG[task.priority]    || 'rgba(176,164,156,0.08)'
  const dateInfo = formatDate(task.due)

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 12,
      border: '1px solid rgba(26,20,16,0.10)',
      padding: '12px 14px 11px 20px',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(26,20,16,0.18), 0 6px 16px rgba(26,20,16,0.10)',
      transform: 'rotate(1.5deg) scale(1.03)',
      cursor: 'grabbing', userSelect: 'none',
      width: 270,
    }}>
      <CardContent task={task} pColor={pColor} pBg={pBg} member={member} dateInfo={dateInfo}/>
    </div>
  )
}

/* ── Card (sortable) ─────────────────────── */
export default function Card({ task, onClick }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: task.id })

  const member   = MEMBERS.find(m => m.id === task.assignee)
  const pColor   = P_COLOR[task.priority] || '#B0A49C'
  const pBg      = P_BG[task.priority]    || 'rgba(176,164,156,0.08)'
  const dateInfo = formatDate(task.due)

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.15 : 1 }}
      {...attributes} {...listeners}>
      <div
        onClick={onClick}
        style={{
          background: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid rgba(26,20,16,0.06)',
          padding: '12px 14px 11px 20px',
          position: 'relative', overflow: 'hidden',
          cursor: 'grab',
          transition: 'box-shadow 0.20s var(--ease-out), transform 0.20s var(--ease-out), border-color 0.15s',
          userSelect: 'none',
          boxShadow: '0 1px 4px rgba(26,20,16,0.05), 0 0 0 0 transparent',
          animation: 'fadeUp 0.18s ease both',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(26,20,16,0.10), 0 2px 6px rgba(26,20,16,0.06)'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.borderColor = 'rgba(26,20,16,0.10)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(26,20,16,0.05)'
          e.currentTarget.style.transform = ''
          e.currentTarget.style.borderColor = 'rgba(26,20,16,0.06)'
        }}
      >
        <CardContent task={task} pColor={pColor} pBg={pBg} member={member} dateInfo={dateInfo}/>
      </div>
    </div>
  )
}
