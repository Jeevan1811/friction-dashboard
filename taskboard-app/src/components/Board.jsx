import { useState, useCallback, useEffect } from 'react'
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import Card from './Card.jsx'
import Modal from './Modal.jsx'
import { MEMBERS, PHASES } from '../data.js'

const PRIORITY_LABELS = {
  critical: 'Do Now', high: 'Delegate', medium: 'Schedule', low: 'Do Last',
}

const STAGES = [
  { id: 'validate', name: 'Validate' },
  { id: 'form',     name: 'Form Co.' },
  { id: 'mvp',      name: 'Build MVP' },
  { id: 'client',   name: '1st Client' },
  { id: 'beta',     name: 'Beta' },
  { id: 'comply',   name: 'Comply' },
  { id: 'scale',    name: 'Scale' },
]

function PipelineStrip({ tasks }) {
  const perStage = STAGES.map(s => {
    const list = tasks.filter(t => t.phase?.toLowerCase().includes(s.id) || t.stage === s.id)
    const done = list.filter(t => t.status === 'Done').length
    return { ...s, total: list.length, done, pct: list.length ? Math.round(done / list.length * 100) : 0 }
  })
  const activeIdx = perStage.findIndex(s => s.total > 0 && s.done < s.total)

  return (
    <div className="pipeline-strip" style={{ marginBottom: 16 }}>
      {perStage.map((s, i) => {
        const isDone = s.total > 0 && s.done === s.total
        const isActive = i === activeIdx
        const prev = perStage[i - 1]
        const prevDone = prev && prev.total > 0 && prev.done === prev.total
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
            {i > 0 && (
              <div className={`p-connector${isActive ? ' flow' : prevDone && isDone ? ' done-line' : ''}`} />
            )}
            <div className={`p-stage${isActive ? ' active' : ''}`}>
              <div className={`p-circle${isDone ? ' done' : isActive ? ' active' : ''}`}>
                {isDone ? '✓' : s.total > 0 ? `${s.pct}%` : '—'}
              </div>
              <div className="p-name">{s.name}</div>
              <div className="p-count">{s.done}/{s.total}</div>
              <div className="p-bar"><div className="p-bar-fill" style={{ width: `${s.pct}%` }} /></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatCard({ label, value, note, accent }) {
  return (
    <div className="stat-card">
      <div className={`stat-num${accent ? ` ${accent}` : ''}`}>{value}</div>
      <div className="stat-label">{label}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  )
}

function DropColumn({ phase, tasks, onCardClick, activeId }) {
  return (
    <div className="kanban-col">
      <div className="col-header">
        <span className="col-title">{phase}</span>
        <span className="col-count">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.length === 0 ? (
          <div className={`drop-zone${activeId ? ' over' : ''}`}>Drop here</div>
        ) : (
          tasks.map(t => <Card key={t.id} task={t} onClick={onCardClick} />)
        )}
      </SortableContext>
    </div>
  )
}

export default function Board({ tasks, onAdd, onUpdate, onDelete, loading }) {
  const [modal, setModal]       = useState(null)   // null | 'new' | task object
  const [filterMember, setFilterMember] = useState('all')
  const [filterPriority, setFilterPriority] = useState(null)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const today = new Date().toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long' })

  // Filtered tasks
  const filtered = tasks.filter(t => {
    if (filterMember !== 'all' && t.assignedTo !== filterMember) return false
    if (filterPriority && t.priority !== filterPriority) return false
    return true
  })

  // Stats
  const done      = tasks.filter(t => t.status === 'Done').length
  const total     = tasks.length
  const overdue   = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length
  const pct       = total ? Math.round(done / total * 100) : 0

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const task = tasks.find(t => t.id === active.id)
    const target = tasks.find(t => t.id === over.id)
    if (task && target && task.phase !== target.phase) {
      onUpdate({ ...task, phase: target.phase })
    }
  }

  function handleSave(data) {
    if (data.id && tasks.find(t => t.id === data.id)) {
      onUpdate(data)
    } else {
      onAdd({ ...data, id: data.id || `t_${Date.now()}`, status: data.status || 'To Do', created_at: new Date().toISOString() })
    }
    setModal(null)
  }

  function handleDelete(id) {
    onDelete(id)
    setModal(null)
  }

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg, #0a0c12)' }}>

      {/* Topbar */}
      <div style={{
        height: 58, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 26px',
        background: 'rgba(8,10,16,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#f2f4f8' }}>
          Tasks
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10.5, color: '#555e72',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 99, padding: '3px 10px',
        }}>{today}</div>
        {loading && <div className="loading-bar" />}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={() => setModal('new')}
            className="btn-primary"
            style={{ fontSize: 13, padding: '8px 16px' }}
          >+ New Task</button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 80px' }}>

        {/* Pipeline */}
        <PipelineStrip tasks={tasks} />

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12, marginBottom: 20,
        }}>
          <StatCard label="Overall done"   value={`${pct}%`}          accent="green" />
          <StatCard label="Tasks complete" value={`${done}/${total}`} />
          {MEMBERS.map(m => {
            const mine = tasks.filter(t => t.assignedTo === m.id)
            const d    = mine.filter(t => t.status === 'Done').length
            return (
              <StatCard
                key={m.id}
                label={`${m.name} done`}
                value={`${d}/${mine.length}`}
                accent="accent"
              />
            )
          })}
          {overdue > 0 && <StatCard label="Overdue" value={overdue} note="needs attention" />}
        </div>

        {/* Filter bar */}
        <div className="filter-bar" style={{ marginBottom: 20 }}>
          {/* Member filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`f-btn${filterMember === 'all' ? ' active-member' : ''}`}
              onClick={() => setFilterMember('all')}
            >All</button>
            {MEMBERS.map(m => (
              <button
                key={m.id}
                className={`f-btn${filterMember === m.id ? ' active-member' : ''}`}
                onClick={() => setFilterMember(filterMember === m.id ? 'all' : m.id)}
              >{m.id}</button>
            ))}
          </div>

          <div className="filter-sep" />

          {/* Priority filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(PRIORITY_LABELS).map(([p, label]) => {
              const colors = { critical: '#f43f5e', high: '#f59e0b', medium: '#38bdf8', low: '#34d399' }
              const active = filterPriority === p
              return (
                <button
                  key={p}
                  className="f-btn"
                  onClick={() => setFilterPriority(active ? null : p)}
                  style={active ? {
                    background: colors[p], color: '#0a0c12',
                    borderColor: 'transparent',
                    boxShadow: `0 2px 14px ${colors[p]}55`,
                    fontWeight: 600,
                  } : {}}
                >
                  <span style={{
                    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                    background: colors[p], marginRight: 7,
                    boxShadow: active ? 'none' : `0 0 6px ${colors[p]}`,
                    verticalAlign: 'middle',
                  }} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Kanban board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => setActiveId(active.id)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
            {PHASES.map(phase => (
              <DropColumn
                key={phase}
                phase={phase}
                tasks={filtered.filter(t => t.phase === phase || t.status === phase)}
                onCardClick={t => setModal(t)}
                activeId={activeId}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <Card task={activeTask} onClick={() => {}} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          task={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
