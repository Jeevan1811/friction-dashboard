import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { MEMBERS } from '../data.js'
import Card from './Card.jsx'

const COLS = [
  { id:'todo',    label:'To Do',       color:'#64748B', bg:'rgba(100,116,139,0.07)' },
  { id:'inprog',  label:'In Progress', color:'#C07D40', bg:'rgba(192,125,64,0.07)' },
  { id:'blocked', label:'Blocked',     color:'#C0392B', bg:'rgba(192,57,43,0.07)'  },
  { id:'done',    label:'Done',        color:'#2D8C5A', bg:'rgba(45,140,90,0.07)'  },
]

const PRIO_LIST   = ['critical','high','medium','low']
const PRIO_COLORS = { critical:'#C0392B', high:'#C05B30', medium:'#C07D40', low:'#2D8C5A' }
const PRIO_LABELS = { critical:'Critical', high:'High', medium:'Medium', low:'Low' }

/* ── Icons ───────────────────────────────── */
const IcoAll    = () => <svg width="14" height="14" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="2" width="6" height="6" rx="1.5"/><rect x="12" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="12" width="6" height="6" rx="1.5"/><rect x="12" y="12" width="6" height="6" rx="1.5"/></svg>
const IcoClock  = () => <svg width="14" height="14" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><circle cx="10" cy="10" r="8"/><path d="M10 5.5v4.5l2.5 2.5" strokeLinecap="round"/></svg>
const IcoCheck  = () => <svg width="14" height="14" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M17 5L8 14l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IcoFire   = () => <svg width="14" height="14" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M12 3c0 4-4 5-4 8a4 4 0 008 0c0-3-2-4-2-6a3 3 0 01-2-2z" strokeLinejoin="round"/><path d="M10 15a1.5 1.5 0 000-3" strokeLinecap="round"/></svg>
const IcoPlus   = () => <svg width="11" height="11" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2.2"><path d="M8 3v10M3 8h10" strokeLinecap="round"/></svg>
const IcoSearch = () => <svg width="13" height="13" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7"><circle cx="7" cy="7" r="5"/><path d="M11 11l2.5 2.5" strokeLinecap="round"/></svg>

/* ── Stat Card ───────────────────────────── */
function StatCard({ label, value, icon, accent, note }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 14,
        border: '1px solid rgba(26,20,16,0.06)',
        padding: '18px 20px 16px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'default',
        transition: 'box-shadow 0.20s, transform 0.20s',
        boxShadow: '0 1px 4px rgba(26,20,16,0.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,20,16,0.09), 0 2px 6px rgba(26,20,16,0.05)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(26,20,16,0.05)'
        e.currentTarget.style.transform = ''
      }}
    >
      {/* Gradient top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
      }}/>

      {/* Icon pill */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${accent}12`,
        color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        {icon}
      </div>

      {/* Number */}
      <div style={{
        fontSize: 34, fontWeight: 200, lineHeight: 1,
        letterSpacing: '-0.05em', color: '#1A1410',
        marginBottom: 5,
      }}>
        {value}
      </div>

      {/* Label */}
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#B0A49C',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {label}
      </div>

      {note && (
        <div style={{
          position: 'absolute', top: 18, right: 16,
          fontSize: 10, fontWeight: 600,
          color: accent, background: `${accent}12`,
          borderRadius: 99, padding: '2px 8px',
        }}>{note}</div>
      )}
    </div>
  )
}

/* ── Column ──────────────────────────────── */
function Column({ col, tasks, onAdd, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  const taskIds = tasks.map(t => t.id)

  return (
    <div style={{ display:'flex', flexDirection:'column', minWidth: 262, maxWidth: 295, flex:'1 1 262px' }}>
      {/* Column header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 2px 10px' }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: col.color,
          textTransform: 'uppercase', letterSpacing: '0.09em', flex: 1,
        }}>
          {col.label}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: col.color,
          background: col.bg,
          borderRadius: 99, padding: '2px 9px',
          border: `1px solid ${col.color}22`,
        }}>
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          padding: 8, borderRadius: 14,
          border: `1.5px solid ${isOver ? col.color+'40' : 'rgba(26,20,16,0.07)'}`,
          background: isOver ? `${col.color}07` : 'rgba(253,251,247,0.65)',
          minHeight: 120, flex: 1,
          transition: 'background 0.18s, border-color 0.18s',
          boxShadow: 'inset 0 1px 2px rgba(26,20,16,0.03)',
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <Card key={task.id} task={task} onClick={() => onEdit(task)}/>
          ))}
        </SortableContext>

        {/* Add task button */}
        <button
          onClick={() => onAdd(col.id)}
          style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            padding:'8px 10px',
            borderRadius: 9,
            border:`1.5px dashed rgba(26,20,16,0.12)`,
            color:'#B0A49C',
            fontSize:12, fontWeight:500,
            cursor:'pointer',
            background:'transparent',
            transition:'all 0.15s',
            fontFamily:'inherit',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = col.color+'55'
            e.currentTarget.style.color = col.color
            e.currentTarget.style.background = col.color+'08'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(26,20,16,0.12)'
            e.currentTarget.style.color = '#B0A49C'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <IcoPlus/> Add task
        </button>
      </div>
    </div>
  )
}

/* ── Board ───────────────────────────────── */
export default function Board({
  tasks,
  filterMember, setFilterMember,
  filterPriority, setFilterPriority,
  onAdd, onEdit,
  onOpenCmd,
}) {
  const today   = new Date()
  const dateStr = today.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })

  const overdue  = tasks.filter(t => t.due && new Date(t.due) < new Date(today.toDateString()) && t.status !== 'done').length
  const inProg   = tasks.filter(t => t.status === 'inprog').length
  const done     = tasks.filter(t => t.status === 'done').length
  const critical = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').length

  const filtered = tasks.filter(t => {
    if (filterMember   && t.assignee !== filterMember)   return false
    if (filterPriority && t.priority !== filterPriority) return false
    return true
  })

  const colTasks  = id => filtered.filter(t => t.status === id)
  const hasFilter = filterMember || filterPriority

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', flex: 1, background: '#F5F0E8' }}>

      {/* ── Topbar ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 28px', height: 62,
        background: '#FAF8F3',
        borderBottom:'1px solid rgba(26,20,16,0.06)',
        boxShadow: '0 1px 0 rgba(26,20,16,0.03)',
        flexShrink:0, zIndex:10, gap:14,
      }}>
        {/* Left: Title + date pill */}
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div>
            <div style={{
              fontSize: 19, fontWeight: 700,
              letterSpacing:'-0.03em', color:'#1A1410', lineHeight:1.1,
            }}>
              Task Board
            </div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 500, color: '#B0A49C',
            background: 'rgba(26,20,16,0.05)',
            borderRadius: 99, padding: '3px 10px',
            letterSpacing: '-0.01em',
          }}>
            {dateStr}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Search */}
          <button
            onClick={onOpenCmd}
            title="Command palette (⌘K)"
            style={{
              display:'flex', alignItems:'center', gap:7,
              padding:'7px 14px',
              borderRadius: 9, border:'1px solid rgba(26,20,16,0.10)',
              background:'#FFFFFF',
              color:'#B0A49C', fontSize:12.5, fontWeight:500,
              cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(26,20,16,0.18)'; e.currentTarget.style.color='#7A6B62'; e.currentTarget.style.boxShadow='0 2px 8px rgba(26,20,16,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(26,20,16,0.10)'; e.currentTarget.style.color='#B0A49C'; e.currentTarget.style.boxShadow='none'; }}
          >
            <IcoSearch/>
            <span>Search</span>
            <span style={{
              fontSize:10, fontWeight:700, color:'#D8D0C8',
              background:'rgba(26,20,16,0.05)', borderRadius:5,
              padding:'1px 6px', letterSpacing:'0.02em',
            }}>⌘K</span>
          </button>

          {/* Overdue badge */}
          {overdue > 0 && (
            <div style={{
              display:'flex', alignItems:'center', gap:5,
              padding:'6px 12px', borderRadius:99,
              background:'rgba(192,57,43,0.07)', border:'1px solid rgba(192,57,43,0.18)',
              color:'#C0392B', fontSize:11.5, fontWeight:700,
            }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#C0392B', animation:'blink 1.5s ease infinite', display:'inline-block', flexShrink:0 }}/>
              {overdue} overdue
            </div>
          )}

          {/* New Task */}
          <button
            onClick={() => onAdd(null)}
            style={{
              display:'flex', alignItems:'center', gap:7,
              padding:'8px 18px', borderRadius:10,
              background:'linear-gradient(135deg, #7A1020, #5D0D18)',
              color:'#FFF9EB',
              fontSize:13, fontWeight:600, letterSpacing:'-0.01em',
              border:'none', cursor:'pointer',
              boxShadow:'0 3px 12px rgba(93,13,24,0.32), inset 0 1px 0 rgba(255,255,255,0.10)',
              transition:'all 0.18s var(--ease-out)',
              fontFamily:'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow='0 6px 20px rgba(93,13,24,0.42), inset 0 1px 0 rgba(255,255,255,0.10)'
              e.currentTarget.style.transform='translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow='0 3px 12px rgba(93,13,24,0.32), inset 0 1px 0 rgba(255,255,255,0.10)'
              e.currentTarget.style.transform=''
            }}
          >
            <IcoPlus/> New Task
          </button>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex:1, overflow:'auto', padding:'24px 28px 36px' }}>

        {/* ── Stats ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          <StatCard label="Total Tasks"  value={tasks.length} icon={<IcoAll/>}   accent="#5D0D18" />
          <StatCard label="In Progress"  value={inProg}       icon={<IcoClock/>} accent="#C07D40" />
          <StatCard label="Completed"    value={done}         icon={<IcoCheck/>} accent="#2D8C5A" note={done > 0 ? `${Math.round(done/Math.max(tasks.length,1)*100)}%` : undefined} />
          <StatCard label="Critical"     value={critical}     icon={<IcoFire/>}  accent="#C0392B" />
        </div>

        {/* ── Filter bar ── */}
        <div style={{
          display:'flex', alignItems:'center', gap:6, marginBottom:20,
          flexWrap:'wrap',
          background: '#FFFFFF',
          border: '1px solid rgba(26,20,16,0.07)',
          borderRadius: 12, padding: '8px 12px',
          boxShadow: '0 1px 3px rgba(26,20,16,0.04)',
        }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#D8D0C8', textTransform:'uppercase', letterSpacing:'0.08em', marginRight:2 }}>Filter:</span>

          {MEMBERS.map(m => {
            const active = filterMember === m.id
            return (
              <button
                key={m.id}
                onClick={() => setFilterMember(p => p === m.id ? null : m.id)}
                style={{
                  display:'inline-flex', alignItems:'center', gap:5,
                  padding:'4px 10px 4px 5px', borderRadius:99,
                  border:`1px solid ${active ? '#5D0D18' : 'rgba(26,20,16,0.09)'}`,
                  background: active ? 'rgba(93,13,24,0.07)' : 'transparent',
                  color: active ? '#5D0D18' : '#7A6B62',
                  fontSize:12, fontWeight: active ? 700 : 500, cursor:'pointer',
                  transition:'all 0.14s', fontFamily:'inherit',
                  boxShadow: active ? '0 0 0 3px rgba(93,13,24,0.08)' : 'none',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius:'50%',
                  background: `linear-gradient(135deg, ${m.color}DD, ${m.color})`,
                  color:'#fff', fontSize:9.5, fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0, boxShadow:`0 1px 4px ${m.color}40`,
                }}>{m.id}</div>
                {m.name}
              </button>
            )
          })}

          <div style={{ width:1, height:16, background:'rgba(26,20,16,0.09)', margin:'0 2px', flexShrink:0 }}/>

          {PRIO_LIST.map(p => {
            const active = filterPriority === p
            const c = PRIO_COLORS[p]
            return (
              <button
                key={p}
                onClick={() => setFilterPriority(prev => prev === p ? null : p)}
                style={{
                  display:'inline-flex', alignItems:'center', gap:5,
                  padding:'4px 10px', borderRadius:99,
                  border:`1px solid ${active ? c : 'rgba(26,20,16,0.09)'}`,
                  background: active ? `${c}10` : 'transparent',
                  color: active ? c : '#7A6B62',
                  fontSize:12, fontWeight: active ? 700 : 500, cursor:'pointer',
                  transition:'all 0.14s',
                  boxShadow: active ? `0 0 0 3px ${c}18` : 'none',
                  fontFamily:'inherit',
                }}
              >
                <span style={{ width:6, height:6, borderRadius:'50%', background:c, flexShrink:0 }}/>
                {PRIO_LABELS[p]}
              </button>
            )
          })}

          {hasFilter && (
            <>
              <div style={{ width:1, height:16, background:'rgba(26,20,16,0.09)', margin:'0 2px', flexShrink:0 }}/>
              <button
                onClick={() => { setFilterMember(null); setFilterPriority(null) }}
                style={{
                  padding:'4px 10px', borderRadius:99,
                  border:'1px solid rgba(26,20,16,0.09)',
                  background:'transparent', color:'#B0A49C',
                  fontSize:12, fontWeight:500, cursor:'pointer',
                  transition:'all 0.14s', fontFamily:'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.color='#4A3930'; e.currentTarget.style.borderColor='rgba(26,20,16,0.20)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='#B0A49C'; e.currentTarget.style.borderColor='rgba(26,20,16,0.09)'; }}
              >
                ✕ Clear
              </button>
              <span style={{ fontSize:11.5, color:'#B0A49C', padding:'0 2px' }}>
                {filtered.length} task{filtered.length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>

        {/* ── Kanban columns ── */}
        <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
          {COLS.map(col => (
            <Column
              key={col.id}
              col={col}
              tasks={colTasks(col.id)}
              onAdd={onAdd}
              onEdit={onEdit}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
