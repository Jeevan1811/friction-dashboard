import { useState, useEffect, useCallback } from 'react'
import {
  DndContext, DragOverlay,
  PointerSensor, KeyboardSensor, TouchSensor,
  useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { COLS } from './data.js'
import { supabase } from './lib/supabase.js'
import Sidebar from './components/Sidebar.jsx'
import Board from './components/Board.jsx'
import Card from './components/Card.jsx'
import Modal from './components/Modal.jsx'

export default function App() {
  const [tasks, setTasks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeId, setActiveId]   = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask]   = useState(null)
  const [filterMember, setFilterMember]     = useState(null)
  const [filterPriority, setFilterPriority] = useState(null)

  /* ── Supabase: initial fetch + real-time subscription ── */
  useEffect(() => {
    supabase.from('tasks').select('*').order('created_at').then(({ data, error }) => {
      if (!error) setTasks(data ?? [])
      setLoading(false)
    })

    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        supabase.from('tasks').select('*').order('created_at').then(({ data }) => {
          if (data) setTasks(data)
        })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  /* ── Sensors: pointer + touch (mobile) + keyboard ── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  function handleDragStart({ active }) { setActiveId(active.id) }

  function handleDragOver({ active, over }) {
    if (!over) return
    const at = tasks.find(t => t.id === active.id)
    if (!at) return
    const isCol = COLS.some(c => c.id === over.id)
    const dest = isCol ? over.id : tasks.find(t => t.id === over.id)?.status
    if (dest && at.status !== dest)
      setTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: dest } : t))
  }

  async function handleDragEnd({ active, over }) {
    setActiveId(null)
    if (!over) return
    const at = tasks.find(t => t.id === active.id)
    if (!at) return
    const isCol = COLS.some(c => c.id === over.id)
    const dest = isCol ? over.id : tasks.find(t => t.id === over.id)?.status
    if (dest && at.status !== dest) {
      setTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: dest } : t))
      await supabase.from('tasks').update({ status: dest }).eq('id', active.id)
    }
  }

  const openAdd   = useCallback(() => { setEditingTask(null); setModalOpen(true) }, [])
  const openEdit  = useCallback((task) => { setEditingTask(task); setModalOpen(true) }, [])
  const closeModal = useCallback(() => { setModalOpen(false); setEditingTask(null) }, [])

  const saveTask = useCallback(async (data) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...data } : t))
      await supabase.from('tasks').update(data).eq('id', editingTask.id)
    } else {
      const newTask = { id: `t${Date.now()}`, status: 'todo', ...data }
      setTasks(prev => [...prev, newTask])
      await supabase.from('tasks').insert([newTask])
    }
    closeModal()
  }, [editingTask, closeModal])

  const deleteTask = useCallback(async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
    closeModal()
  }, [closeModal])

  const filtered = tasks.filter(t => {
    if (filterMember && t.assignee !== filterMember) return false
    if (filterPriority && t.priority !== filterPriority) return false
    return true
  })

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar />
      <DndContext sensors={sensors} collisionDetection={closestCorners}
        onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <Board
          tasks={filtered} allTasks={tasks} loading={loading}
          filterMember={filterMember} filterPriority={filterPriority}
          onFilterMember={setFilterMember} onFilterPriority={setFilterPriority}
          onAddTask={openAdd} onEditTask={openEdit}
        />
        <DragOverlay dropAnimation={{ duration:180, easing:'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
          {activeTask ? <Card task={activeTask} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>
      {modalOpen && <Modal task={editingTask} onSave={saveTask} onDelete={editingTask ? deleteTask : null} onClose={closeModal}/>}
    </div>
  )
}
