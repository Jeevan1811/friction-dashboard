import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { COLS, MEMBERS, PRIORITIES } from '../data.js'
import Card from './Card.jsx'

function StatCard({ value, label, color, icon }) {
  return (
    <div style={{
      background: 'var(--surface-1)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', padding: '16px 18px', flex: 1, minWidth: 0,
      boxShadow: 'var(--sh-card)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: color, borderRadius:'99px 99px 0 0' }}/>
      <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color: color, flexShrink: 0,
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color:'var(--t1)', letterSpacing:'-1.5px', lineHeight:1 }}>{value}</div>
          <div style={{ fontSize: 11.5, fontWeight: 500, color:'var(--t3)', marginTop: 3, letterSpacing:'0.1px' }}>{label}</div>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 'var(--r-lg)', padding: '14px 14px 12px',
      background: 'var(--card)', border: '1px solid var(--border)',
      boxShadow: 'var(--sh-xs)', overflow: 'hidden',
    }}>
      {/* Title line */}
      <div className="skeleton-line" style={{ height: 11, width: '75%', borderRadius: 6, marginBottom: 8 }}/>
      {/* Note line */}
      <div className="skeleton-line" style={{ height: 9, width: '55%', borderRadius: 6, marginBottom: 14 }}/>
      {/* Footer chips */}
      <div style={{ display:'flex', gap: 6 }}>
        <div className="skeleton-line" style={{ height: 18, width: 48, borderRadius: 99 }}/>
        <div className="skeleton-line" style={{ height: 18, width: 36, borderRadius: 99 }}/>
      </div>
    </div>
  )
}

function Column({ col, tasks, loading, onEditTask, onAddTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div style={{ width: 304, minWidth: 304, display:'flex', flexDirection:'column', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap: 7, padding:'0 2px 12px' }}>
        <span style={{
          width: 7, height: 7, borderRadius:'50%', background: col.color, flexShrink:0,
          ...(col.id === 'inprog' ? { animation:'pulse 2.5s ease-in-out infinite' } : {})
        }}/>
        <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing:'0.5px', textTransform:'uppercase', color:'var(--t3)' }}>{col.label}</span>
        <span style={{
          marginLeft:'auto', background:'var(--surface-2)', border:'1px solid var(--border-md)',
          borderRadius: 20, fontSize: 11, fontWeight: 600, color:'var(--t4)',
          padding:'1px 8px', lineHeight:1.7,
        }}>{loading ? '—' : tasks.length}</span>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef} style={{
        flex:1, display:'flex', flexDirection:'column', gap: 7, minHeight: 64,
        borderRadius: 'var(--r-lg)', padding: isOver ? '5px' : '0',
        background: isOver ? `${col.color}08` : 'transparent',
        outline: isOver ? `1px dashed ${col.color}40` : 'none',
        transition: 'background 0.15s, outline 0.15s, padding 0.1s',
      }}>
        {loading ? (
          <>
            <SkeletonCard/>
            <SkeletonCard/>
            <SkeletonCard/>
          </>
        ) : (
          <>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map(t => <Card key={t.id} task={t} onEdit={onEditTask}/>)}
            </SortableContext>
            {tasks.length === 0 && (
              <div style={{
                height: 80, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap: 5,
                border: `1px dashed ${col.color}25`, borderRadius: 'var(--r-lg)',
                fontSize: 12, color:'var(--t4)', letterSpacing:'0.1px',
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" opacity="0.4"><rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.4"/><path d="M6 9h6M9 6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                No tasks yet
              </div>
            )}
          </>
        )}
      </div>

      {/* Add button */}
      <button onClick={onAddTask} style={{
        marginTop: 8, width:'100%', padding:'7px 10px',
        background:'none', border:'1px dashed var(--border-md)', borderRadius:'var(--r)',
        fontSize: 12.5, fontWeight: 500, color:'var(--t4)', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap: 6,
        transition:'border-color 0.13s, color 0.13s, background 0.13s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--sage-hi)'; e.currentTarget.style.color='var(--sage-hi)'; e.currentTarget.style.background='var(--sage-bg)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-md)'; e.currentTarget.style.color='var(--t4)'; e.currentTarget.style.background='none'; }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        Add task
      </button>
    </div>
  )
}

export default function Board({ tasks, allTasks, loading, filterMember, filterPriority, onFilterMember, onFilterPriority, onAddTask, onEditTask }) {
  const total    = allTasks.length
  const inProg   = allTasks.filter(t => t.status === 'inprog').length
  const done     = allTasks.filter(t => t.status === 'done').length
  const critical = allTasks.filter(t => t.priority === 'critical' && t.status !== 'done').length
  const overdue  = allTasks.filter(t => t.due && new Date(t.due) < new Date() && t.status !== 'done').length

  const today = new Date().toLocaleDateString('en-MY', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

  return (
    <main style={{ flex:1, minWidth:0, height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)', overflow:'hidden' }}>
      {/* Topbar */}
      <header style={{
        height:'var(--top-h)', padding:'0 28px',
        display:'flex', alignItems:'center', gap: 14,
        borderBottom:'1px solid var(--border)',
        background:'var(--surface-0)', flexShrink:0,
      }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
            <h1 style={{ fontSize:15, fontWeight:700, color:'var(--t1)', letterSpacing:'-0.4px', lineHeight:1 }}>Task Board</h1>
            {overdue > 0 && (
              <span style={{
                background:'var(--p-critical)', color:'#fff',
                fontSize: 10.5, fontWeight: 700, padding:'2px 7px', borderRadius: 99, lineHeight:1.6,
              }}>{overdue} overdue</span>
            )}
          </div>
          <p style={{ fontSize:12, color:'var(--t4)', marginTop:2, lineHeight:1 }}>{today}</p>
        </div>

        {/* Breadcrumb-style section label */}
        <div style={{ display:'flex', alignItems:'center', gap: 6, padding:'4px 10px', background:'var(--surface-1)', border:'1px solid var(--border)', borderRadius:6 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="0.5" y="0.5" width="4.5" height="4.5" rx="1" stroke="var(--t4)" strokeWidth="1.2"/><rect x="7" y="0.5" width="4.5" height="4.5" rx="1" stroke="var(--t4)" strokeWidth="1.2"/><rect x="0.5" y="7" width="4.5" height="4.5" rx="1" stroke="var(--t4)" strokeWidth="1.2"/><rect x="7" y="7" width="4.5" height="4.5" rx="1" stroke="var(--t4)" strokeWidth="1.2"/></svg>
          <span style={{ fontSize:12, color:'var(--t3)', fontWeight:500 }}>Board</span>
        </div>

        <button onClick={onAddTask} style={{
          display:'flex', alignItems:'center', gap:7, padding:'8px 16px',
          background:'var(--btn)', color:'var(--btn-text)',
          border:'none', borderRadius:'var(--r)', fontSize:13, fontWeight:700,
          cursor:'pointer', letterSpacing:'-0.2px',
          boxShadow:'0 1px 4px rgba(0,0,0,0.4)',
          transition:'background 0.13s, box-shadow 0.13s',
          flexShrink:0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background='var(--btn-hover)'; e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.background='var(--btn)'; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.4)'; }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
          New Task
        </button>
      </header>

      {/* Body scroll */}
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'24px 28px 36px', display:'flex', flexDirection:'column', gap:22 }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          <StatCard value={total} label="Total Tasks" color="var(--t3)"
            icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.3" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.3" stroke="currentColor" strokeWidth="1.4"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.3" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.3" stroke="currentColor" strokeWidth="1.4"/></svg>}
          />
          <StatCard value={inProg} label="In Progress" color="var(--col-inprog)"
            icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 4.5V8l2.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
          <StatCard value={done} label="Completed" color="var(--col-done)"
            icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
          <StatCard value={critical} label="Critical" color="var(--p-critical)"
            icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.7" fill="currentColor"/></svg>}
          />
        </div>

        {/* Filter bar */}
        <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
          <span style={{ fontSize:11.5, fontWeight:600, color:'var(--t4)', letterSpacing:'0.3px', textTransform:'uppercase', marginRight:4 }}>Filter</span>

          {MEMBERS.map(m => (
            <button key={m.id} onClick={() => onFilterMember(filterMember === m.id ? null : m.id)} style={{
              display:'flex', alignItems:'center', gap:5, padding:'4px 10px 4px 6px',
              borderRadius: 99, cursor:'pointer', fontSize:12, fontWeight:500,
              border: filterMember === m.id ? `1px solid ${m.color}80` : '1px solid var(--border-md)',
              background: filterMember === m.id ? `${m.color}18` : 'var(--surface-1)',
              color: filterMember === m.id ? 'var(--t1)' : 'var(--t3)',
              transition:'all 0.13s',
            }}>
              <div style={{ width:17, height:17, borderRadius:'50%', background: m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'#fff' }}>{m.id}</div>
              {m.name}
            </button>
          ))}

          <div style={{ width:1, height:16, background:'var(--border-md)' }}/>

          {[{ id:'critical', label:'Critical', c:'var(--p-critical)' },{ id:'high', label:'High', c:'var(--p-high)' },{ id:'medium', label:'Medium', c:'var(--p-medium)' }].map(p => (
            <button key={p.id} onClick={() => onFilterPriority(filterPriority === p.id ? null : p.id)} style={{
              display:'flex', alignItems:'center', gap:5, padding:'4px 10px',
              borderRadius:99, cursor:'pointer', fontSize:12, fontWeight:500,
              border: filterPriority === p.id ? `1px solid ${p.c}60` : '1px solid var(--border-md)',
              background: filterPriority === p.id ? `${p.c}18` : 'var(--surface-1)',
              color: filterPriority === p.id ? 'var(--t1)' : 'var(--t3)',
              transition:'all 0.13s',
            }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background: p.c, display:'inline-block' }}/>
              {p.label}
            </button>
          ))}

          {(filterMember || filterPriority) && (
            <button onClick={() => { onFilterMember(null); onFilterPriority(null); }} style={{
              padding:'4px 9px', borderRadius:99, border:'1px solid var(--border-md)',
              background:'none', cursor:'pointer', fontSize:11.5, fontWeight:500, color:'var(--t4)',
              display:'flex', alignItems:'center', gap:4, transition:'color 0.12s, border-color 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color='var(--t2)'; e.currentTarget.style.borderColor='var(--border-lg)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--t4)'; e.currentTarget.style.borderColor='var(--border-md)'; }}
            >
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 1l7 7M8 1L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Clear
            </button>
          )}

          <span style={{ marginLeft:'auto', fontSize:11.5, color:'var(--t4)' }}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}{filterMember || filterPriority ? ' filtered' : ''}
          </span>
        </div>

        {/* Kanban */}
        <div style={{ display:'flex', gap:14, alignItems:'flex-start', overflowX:'auto', paddingBottom:8 }}>
          {COLS.map(col => (
            <Column key={col.id} col={col} tasks={tasks.filter(t => t.status === col.id)} loading={loading} onEditTask={onEditTask} onAddTask={onAddTask}/>
          ))}
        </div>
      </div>
    </main>
  )
}
