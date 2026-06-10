import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { MEMBERS } from '../data.js'
import Card from './Card.jsx'

const COLS = [
  { id:'todo',    label:'To Do',       color:'#64748B' },
  { id:'inprog',  label:'In Progress', color:'#D97706' },
  { id:'blocked', label:'Blocked',     color:'#DC2626' },
  { id:'done',    label:'Done',        color:'#16A34A' },
]

const PRIO_LIST   = ['critical','high','medium','low']
const PRIO_COLORS = { critical:'#DC2626', high:'#EA580C', medium:'#D97706', low:'#16A34A' }
const PRIO_LABELS = { critical:'Critical', high:'High', medium:'Medium', low:'Low' }

/* ── Icons ───────────────────────────────── */
const IcoAll     = () => <svg width="15" height="15" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="2" width="6" height="6" rx="1.5"/><rect x="12" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="12" width="6" height="6" rx="1.5"/><rect x="12" y="12" width="6" height="6" rx="1.5"/></svg>
const IcoClock   = () => <svg width="15" height="15" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><circle cx="10" cy="10" r="8"/><path d="M10 5.5v4.5l2.5 2.5" strokeLinecap="round"/></svg>
const IcoCheck   = () => <svg width="15" height="15" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M17 5L8 14l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IcoFire    = () => <svg width="15" height="15" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M12 3c0 4-4 5-4 8a4 4 0 008 0c0-3-2-4-2-6a3 3 0 01-2-2z" strokeLinejoin="round"/><path d="M10 15a1.5 1.5 0 000-3" strokeLinecap="round"/></svg>
const IcoPlus    = () => <svg width="12" height="12" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><path d="M8 3v10M3 8h10" strokeLinecap="round"/></svg>
const IcoSearch  = () => <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="5"/><path d="M11 11l2.5 2.5" strokeLinecap="round"/></svg>
const IcoCmd     = () => <svg width="13" height="13" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M4.5 4.5a2 2 0 100-4 2 2 0 000 4zm0 0v7m0 0a2 2 0 100 4 2 2 0 000-4zm0 0h7m0 0a2 2 0 104 0 2 2 0 00-4 0zm0 0V4.5m0 0a2 2 0 10-4 0 2 2 0 004 0zm0 0h-7" strokeLinecap="round"/></svg>

/* ── Stat Card — luxury thin numbers ─────── */
function StatCard({ label, value, icon, accent, delta }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid rgba(14,2,4,0.06)',
        boxShadow: '0 1px 3px rgba(14,2,4,0.05)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'default',
        transition: 'box-shadow 0.18s, transform 0.18s',
        padding: '16px 18px 14px',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(14,2,4,0.08), 0 0 0 1px rgba(14,2,4,0.05)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(14,2,4,0.05)'
        e.currentTarget.style.transform = ''
      }}
    >
      {/* Top accent line */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: accent }}/>

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `${accent}14`,
          color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        {delta !== undefined && (
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: delta >= 0 ? '#16A34A' : '#DC2626',
            background: delta >= 0 ? 'rgba(22,163,74,0.09)' : 'rgba(220,38,38,0.09)',
            borderRadius: 99, padding: '2px 7px',
          }}>
            {delta >= 0 ? '+' : ''}{delta}
          </span>
        )}
      </div>

      {/* Luxury thin number */}
      <div style={{
        fontSize: 30,
        fontWeight: 300,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        color: '#0E0204',
        marginBottom: 4,
      }}>
        {value}
      </div>

      {/* Label */}
      <div style={{
        fontSize: 11,
        fontWeight: 500,
        color: '#A88285',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
      }}>
        {label}
      </div>
    </div>
  )
}

/* ── Column ──────────────────────────────── */
function Column({ col, tasks, onAdd, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  const taskIds = tasks.map(t => t.id)

  return (
    <div style={{ display:'flex', flexDirection:'column', minWidth: 260, maxWidth: 290, flex:'1 1 260px' }}>
      {/* Column header */}
      <div style={{ display:'flex', alignItems:'center', gap:7, padding:'0 2px 10px' }}>
        <div style={{ width:7, height:7, borderRadius:'50%', background: col.color, flexShrink:0 }}/>
        <span style={{
          fontSize: 11, fontWeight: 700, color:'#2E1318',
          textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1,
        }}>
          {col.label}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: col.color,
          background: `${col.color}13`,
          borderRadius: 99, padding: '1px 8px',
          minWidth: 20, textAlign: 'center',
        }}>
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          padding: 9,
          borderRadius: 12,
          border: `1px solid ${isOver ? col.color+'35' : 'rgba(14,2,4,0.07)'}`,
          background: isOver ? `${col.color}06` : 'rgba(254,252,246,0.60)',
          minHeight: 100,
          flex: 1,
          transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <Card key={task.id} task={task} onClick={() => onEdit(task)}/>
          ))}
        </SortableContext>

        {/* Add task dashed button */}
        <button
          onClick={() => onAdd(col.id)}
          style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'7px 10px',
            borderRadius: 7,
            border:`1.5px dashed rgba(14,2,4,0.13)`,
            color:'#C4AEAE',
            fontSize:12, fontWeight:500,
            cursor:'pointer',
            background:'transparent',
            transition:'all 0.13s',
            fontFamily:'inherit',
            marginTop: tasks.length > 0 ? 1 : 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = col.color+'50'
            e.currentTarget.style.color = col.color
            e.currentTarget.style.background = col.color+'08'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(14,2,4,0.13)'
            e.currentTarget.style.color = '#C4AEAE'
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
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', flex: 1 }}>

      {/* ── Topbar ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 26px', height: 58,
        background:'#FFFFFF',
        borderBottom:'1px solid rgba(14,2,4,0.07)',
        boxShadow:'0 1px 0 rgba(14,2,4,0.04)',
        flexShrink:0, zIndex:10, gap:12,
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing:'-0.025em', color:'#0E0204', lineHeight:1.2 }}>
            Task Board
          </div>
          <div style={{ fontSize:11, color:'#A88285', fontWeight:400, marginTop:1 }}>
            {dateStr}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Cmd+K search trigger */}
          <button
            onClick={onOpenCmd}
            title="Command palette (⌘K)"
            style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'7px 12px',
              borderRadius: 8,
              border:'1px solid rgba(14,2,4,0.10)',
              background:'#F0E8D3',
              color:'#A88285',
              fontSize:12, fontWeight:500,
              cursor:'pointer',
              transition:'all 0.13s',
              fontFamily:'inherit',
              gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(14,2,4,0.18)'; e.currentTarget.style.color='#6B4448'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(14,2,4,0.10)'; e.currentTarget.style.color='#A88285'; }}
          >
            <IcoSearch/>
            <span>Search</span>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:2,
              fontSize:10, fontWeight:600,
              color:'#C4AEAE', background:'rgba(14,2,4,0.05)',
              borderRadius:4, padding:'1px 5px', letterSpacing:'0.02em',
            }}>⌘K</span>
          </button>

          {overdue > 0 && (
            <div style={{
              display:'flex', alignItems:'center', gap:5,
              padding:'6px 11px', borderRadius:99,
              background:'rgba(220,38,38,0.07)', border:'1px solid rgba(220,38,38,0.16)',
              color:'#DC2626', fontSize:11, fontWeight:600,
            }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#DC2626', animation:'blink 1.5s ease infinite', display:'inline-block', flexShrink:0 }}/>
              {overdue} overdue
            </div>
          )}

          <button
            onClick={() => onAdd(null)}
            style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'8px 16px', borderRadius:9,
              background:'#5D0D18', color:'#FFF9EB',
              fontSize:13, fontWeight:600, letterSpacing:'-0.01em',
              border:'none', cursor:'pointer',
              boxShadow:'0 2px 10px rgba(93,13,24,0.28)',
              transition:'background 0.13s, box-shadow 0.13s, transform 0.13s',
              fontFamily:'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background='#7A1020'
              e.currentTarget.style.boxShadow='0 4px 16px rgba(93,13,24,0.38)'
              e.currentTarget.style.transform='translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background='#5D0D18'
              e.currentTarget.style.boxShadow='0 2px 10px rgba(93,13,24,0.28)'
              e.currentTarget.style.transform=''
            }}
          >
            <IcoPlus/> New Task
          </button>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex:1, overflow:'auto', padding:'22px 26px 32px' }}>

        {/* ── Stats ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          <StatCard label="Total Tasks"  value={tasks.length} icon={<IcoAll/>}   accent="#5D0D18" />
          <StatCard label="In Progress"  value={inProg}       icon={<IcoClock/>} accent="#D97706" />
          <StatCard label="Completed"    value={done}         icon={<IcoCheck/>} accent="#16A34A" delta={done > 0 ? done : undefined} />
          <StatCard label="Critical"     value={critical}     icon={<IcoFire/>}  accent="#DC2626" />
        </div>

        {/* ── Filter bar ── */}
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:18, flexWrap:'wrap' }}>
          {MEMBERS.map(m => {
            const active = filterMember === m.id
            return (
              <button
                key={m.id}
                onClick={() => setFilterMember(p => p === m.id ? null : m.id)}
                style={{
                  display:'inline-flex', alignItems:'center', gap:5,
                  padding:'4px 10px 4px 5px', borderRadius:99,
                  border:`1px solid ${active ? '#5D0D18' : 'rgba(14,2,4,0.10)'}`,
                  background: active ? 'rgba(93,13,24,0.06)' : '#FFFFFF',
                  color: active ? '#5D0D18' : '#6B4448',
                  fontSize:11.5, fontWeight: active ? 600 : 500, cursor:'pointer',
                  transition:'all 0.12s',
                  boxShadow: active ? '0 0 0 3px rgba(93,13,24,0.07)' : 'none',
                  fontFamily:'inherit',
                }}
              >
                <div style={{ width:18, height:18, borderRadius:'50%', background:m.color, color:'#fff', fontSize:9.5, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {m.id}
                </div>
                {m.name}
              </button>
            )
          })}

          <div style={{ width:1, height:16, background:'rgba(14,2,4,0.10)', margin:'0 2px', flexShrink:0 }}/>

          {PRIO_LIST.map(p => {
            const active = filterPriority === p
            const c = PRIO_COLORS[p]
            return (
              <button
                key={p}
                onClick={() => setFilterPriority(prev => prev === p ? null : p)}
                style={{
                  display:'inline-flex', alignItems:'center', gap:4,
                  padding:'4px 10px', borderRadius:99,
                  border:`1px solid ${active ? c : 'rgba(14,2,4,0.10)'}`,
                  background: active ? `${c}10` : '#FFFFFF',
                  color: active ? c : '#6B4448',
                  fontSize:11.5, fontWeight: active ? 600 : 500, cursor:'pointer',
                  transition:'all 0.12s',
                  boxShadow: active ? `0 0 0 3px ${c}18` : 'none',
                  fontFamily:'inherit',
                }}
              >
                <span style={{ width:5, height:5, borderRadius:'50%', background:c, flexShrink:0 }}/>
                {PRIO_LABELS[p]}
              </button>
            )
          })}

          {hasFilter && (
            <>
              <div style={{ width:1, height:16, background:'rgba(14,2,4,0.10)', margin:'0 2px', flexShrink:0 }}/>
              <button
                onClick={() => { setFilterMember(null); setFilterPriority(null) }}
                style={{
                  padding:'4px 10px', borderRadius:99,
                  border:'1px solid rgba(14,2,4,0.10)',
                  background:'transparent', color:'#A88285',
                  fontSize:11.5, fontWeight:500, cursor:'pointer',
                  transition:'all 0.12s', fontFamily:'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.color='#2E1318'; e.currentTarget.style.borderColor='rgba(14,2,4,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='#A88285'; e.currentTarget.style.borderColor='rgba(14,2,4,0.10)'; }}
              >
                ✕ Clear
              </button>
              <span style={{ fontSize:11.5, color:'#A88285', padding:'0 2px' }}>
                {filtered.length} task{filtered.length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>

        {/* ── Kanban columns ── */}
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
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
