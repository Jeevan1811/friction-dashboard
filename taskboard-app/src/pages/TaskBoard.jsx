import { useState, useCallback, useEffect, useRef } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor,
  useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { INITIAL_TASKS } from '../data.js'
import Board from '../components/Board.jsx'
import Card, { CardOverlay } from '../components/Card.jsx'
import Modal from '../components/Modal.jsx'
import CommandPalette from '../components/CommandPalette.jsx'
import { fetchTasks, upsertTask, deleteTask as dbDeleteTask, subscribeToTasks } from '../lib/db.js'

const COL_IDS = ['todo','inprog','blocked','done']

function UndoToast({ message, onUndo, onDismiss }) {
  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:2000,
      display:'flex', alignItems:'center', gap:10,
      background:'#0E0908', color:'rgba(255,255,255,0.85)',
      borderRadius:10, padding:'10px 14px', fontSize:13, fontWeight:500,
      boxShadow:'0 8px 24px rgba(14,2,4,0.22)',
      animation:'toastIn 0.22s cubic-bezier(0.22,1,0.36,1)',
      border:'1px solid rgba(255,255,255,0.08)',
    }}>
      <span>{message}</span>
      <button onClick={onUndo} style={{
        border:'none', background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.9)',
        borderRadius:6, padding:'3px 10px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
      }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.20)'}
        onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
      >Undo</button>
      <button onClick={onDismiss} style={{ border:'none', background:'transparent', color:'rgba(255,255,255,0.35)', cursor:'pointer', fontSize:14, padding:'0 2px', lineHeight:1, fontFamily:'inherit' }}>×</button>
    </div>
  )
}

function LoadingBar() {
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, height:2, zIndex:9999, background:'rgba(93,13,24,0.12)' }}>
      <div style={{ height:'100%', width:'60%', background:'#5D0D18', animation:'slideRight 1.2s ease infinite', borderRadius:2 }}/>
    </div>
  )
}

export default function TaskBoard() {
  const [tasks,          setTasks]          = useState(INITIAL_TASKS)
  const [loading,        setLoading]        = useState(true)
  const [activeId,       setActiveId]       = useState(null)
  const [modalOpen,      setModalOpen]      = useState(false)
  const [editingTask,    setEditingTask]     = useState(null)
  const [defaultStatus,  setDefaultStatus]  = useState('todo')
  const [filterMember,   setFilterMember]   = useState(null)
  const [filterPriority, setFilterPriority] = useState(null)
  const [cmdOpen,        setCmdOpen]        = useState(false)
  const [toast,          setToast]          = useState(null)
  const toastTimer = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  // ── Load from Supabase on mount + real-time subscription ──
  useEffect(() => {
    fetchTasks().then(data => {
      if (data && data.length > 0) setTasks(data)
      setLoading(false)
    }).catch(() => setLoading(false))

    const unsubscribe = subscribeToTasks((liveTasks) => {
      setTasks(liveTasks)
    })

    return unsubscribe
  }, [])

  // ── Cmd+K ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(prev => !prev) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Toast ──
  const showToast = useCallback((message, snapshot) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, snapshot })
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }, [])

  const handleUndo = useCallback(() => {
    if (toast?.snapshot) {
      setTasks(toast.snapshot)
      // Re-sync undo to Supabase
      toast.snapshot.forEach(t => upsertTask(t))
    }
    setToast(null)
    if (toastTimer.current) clearTimeout(toastTimer.current)
  }, [toast])

  // ── Drag ──
  function handleDragStart({ active }) { setActiveId(active.id) }

  function handleDragOver({ active, over }) {
    if (!over) return
    const at = tasks.find(t => t.id === active.id)
    if (!at) return
    const isCol = COL_IDS.includes(over.id)
    const dest  = isCol ? over.id : tasks.find(t => t.id === over.id)?.status
    if (dest && at.status !== dest)
      setTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: dest } : t))
  }

  function handleDragEnd({ active, over }) {
    const snapshot = tasks.slice()
    setActiveId(null)
    if (!over) return
    const at = tasks.find(t => t.id === active.id)
    if (!at) return
    const isCol = COL_IDS.includes(over.id)
    const dest  = isCol ? over.id : tasks.find(t => t.id === over.id)?.status
    if (dest && at.status !== dest) {
      const updated = { ...at, status: dest }
      setTasks(prev => prev.map(t => t.id === active.id ? updated : t))
      upsertTask(updated)  // persist to Supabase
      const labels = { todo:'To Do', inprog:'In Progress', blocked:'Blocked', done:'Done' }
      showToast(`Moved to ${labels[dest]}`, snapshot)
    }
  }

  // ── Modal ──
  const openAdd  = useCallback((status) => { setEditingTask(null); setDefaultStatus(status || 'todo'); setModalOpen(true) }, [])
  const openEdit = useCallback((task) => { setEditingTask(task); setModalOpen(true) }, [])
  const closeModal = useCallback(() => { setModalOpen(false); setEditingTask(null) }, [])

  const saveTask = useCallback(async (data) => {
    if (editingTask) {
      const updated = { ...editingTask, ...data }
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t))
      await upsertTask(updated)
    } else {
      const newTask = { id: `t${Date.now()}`, ...data, created_at: new Date().toISOString() }
      setTasks(prev => [...prev, newTask])
      await upsertTask(newTask)
    }
    closeModal()
  }, [editingTask, closeModal])

  const handleDeleteTask = useCallback(async (id) => {
    const snapshot = tasks.slice()
    setTasks(prev => prev.filter(t => t.id !== id))
    await dbDeleteTask(id)
    showToast('Task deleted', snapshot)
    closeModal()
  }, [tasks, closeModal, showToast])

  return (
    <>
      {loading && <LoadingBar />}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Board
          tasks={tasks}
          filterMember={filterMember}     setFilterMember={setFilterMember}
          filterPriority={filterPriority} setFilterPriority={setFilterPriority}
          onAdd={openAdd}
          onEdit={openEdit}
          onOpenCmd={() => setCmdOpen(true)}
        />
        <DragOverlay dropAnimation={{ duration:160, easing:'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
          {activeTask ? <CardOverlay task={activeTask}/> : null}
        </DragOverlay>
      </DndContext>

      <Modal open={modalOpen} task={editingTask} defaultStatus={defaultStatus}
        onSave={saveTask} onDelete={handleDeleteTask} onClose={closeModal} />

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)}
        tasks={tasks} onAdd={openAdd} onEdit={openEdit}
        onFilterMember={(id) => setFilterMember(id)}
        onFilterPriority={(p) => setFilterPriority(p)}
        onClear={() => { setFilterMember(null); setFilterPriority(null) }} />

      {toast && <UndoToast message={toast.message} onUndo={handleUndo} onDismiss={() => setToast(null)} />}
    </>
  )
}
