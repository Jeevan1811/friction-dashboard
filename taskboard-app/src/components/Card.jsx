import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MEMBERS } from '../data.js'

const P_COLOR = {
  critical: '#DC2626',
  high:     '#EA580C',
  medium:   '#D97706',
  low:      '#16A34A',
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

/* ── Card inner content (shared between Card and CardOverlay) ── */
function CardContent({ task, pColor, member, dateInfo }) {
  return (
    <>
      {/* Priority left bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: 2.5,
        background: pColor,
        borderRadius: '10px 0 0 10px',
      }}/>

      {/* Phase + Priority row */}
      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:7, flexWrap:'wrap' }}>
        {task.phase && (
          <span style={{
            fontSize: 9.5, fontWeight: 700, textTransform:'uppercase', letterSpacing:'0.07em',
            color:'#7A9B94', background:'rgba(159,178,172,0.13)',
            border:'1px solid rgba(159,178,172,0.22)',
            borderRadius: 4, padding:'2px 6px',
          }}>{task.phase}</span>
        )}
        <span style={{
          display:'inline-flex', alignItems:'center', gap:3.5,
          fontSize: 9.5, fontWeight: 600,
          color: pColor,
          borderRadius: 99, padding:'1.5px 6px 1.5px 4px',
          border: `1px solid ${pColor}28`,
        }}>
          <span style={{ width:4.5, height:4.5, borderRadius:'50%', background: pColor, flexShrink:0 }}/>
          {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
        </span>
      </div>

      {/* Title */}
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#0E0204',
        lineHeight: 1.4,
        letterSpacing: '-0.01em',
        marginBottom: task.note ? 5 : 0,
      }}>
        {task.title}
      </div>

      {/* Note */}
      {task.note && (
        <div style={{
          fontSize: 11.5,
          color: '#6B4448',
          lineHeight: 1.55,
          marginBottom: 9,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          opacity: 0.8,
        }}>
          {task.note}
        </div>
      )}

      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginTop: (!task.note && task.title) ? 9 : 0 }}>
        {member ? (
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: member.color, color: '#fff',
              fontSize: 9.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {member.id}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 500, color: '#A88285' }}>{member.name}</span>
          </div>
        ) : <div/>}
        {dateInfo && (
          <span style={{
            fontSize: 10.5,
            fontWeight: dateInfo.cls === 'overdue' ? 600 : 500,
            color: dateInfo.cls === 'overdue' ? '#DC2626' : dateInfo.cls === 'soon' ? '#D97706' : '#A88285',
            letterSpacing: '-0.005em',
          }}>
            {dateInfo.label}
          </span>
        )}
      </div>
    </>
  )
}

/* ── CardOverlay — floating drag ghost ──── */
export function CardOverlay({ task }) {
  const member   = MEMBERS.find(m => m.id === task.assignee)
  const pColor   = P_COLOR[task.priority] || '#A88285'
  const dateInfo = formatDate(task.due)

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 10,
      border: `1px solid rgba(14,2,4,0.12)`,
      padding: '11px 13px 10px',
      paddingLeft: 20,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 56px rgba(14,2,4,0.16), 0 4px 12px rgba(14,2,4,0.10)',
      transform: 'rotate(1.5deg) scale(1.02)',
      cursor: 'grabbing',
      userSelect: 'none',
      width: 265,
    }}>
      <CardContent task={task} pColor={pColor} member={member} dateInfo={dateInfo}/>
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
  const pColor   = P_COLOR[task.priority] || '#A88285'
  const dateInfo = formatDate(task.due)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.20 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        onClick={onClick}
        style={{
          background: '#FFFFFF',
          borderRadius: 10,
          border: '1px solid rgba(14,2,4,0.06)',
          padding: '11px 13px 10px',
          paddingLeft: 20,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'grab',
          transition: 'box-shadow 0.18s, transform 0.18s, border-color 0.13s',
          userSelect: 'none',
          boxShadow: '0 1px 3px rgba(14,2,4,0.05)',
          animation: 'fadeUp 0.16s ease both',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 4px 18px rgba(14,2,4,0.09), 0 0 0 1px rgba(14,2,4,0.05)'
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.borderColor = 'rgba(14,2,4,0.09)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(14,2,4,0.05)'
          e.currentTarget.style.transform = ''
          e.currentTarget.style.borderColor = 'rgba(14,2,4,0.06)'
        }}
      >
        <CardContent task={task} pColor={pColor} member={member} dateInfo={dateInfo}/>
      </div>
    </div>
  )
}
