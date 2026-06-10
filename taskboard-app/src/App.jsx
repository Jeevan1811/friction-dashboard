import { useState, useCallback } from 'react'
import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { INITIAL_TASKS, COLS } from './data.js'
import Sidebar from './components/Sidebar.jsx'
import Board from './components/Board.jsx'
import Card from './components/Card.jsx'
import Modal from './components/Modal.jsx'

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [activeId, setActiveId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filterMember, setFilterMember] = useState(null)
  const [filterPriority, setFilterPriority] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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

  function handleDragEnd({ active, over }) {
    setActiveId(null)
    if (!over) return
    const at = tasks.find(t => t.id === active.id)
    if (!at) return
    const isCol = COLS.some(c => c.id === over.id)
    const dest = isCol ? over.id : tasks.find(t => t.id === over.id)?.status
    if (dest && at.status !== dest)
      setTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: dest } : t))
  }

  const openAdd  = useCallback(() => { setEditingTask(null); setModalOpen(true) }, [])
  const openEdit = useCallback((task) => { setEditingTask(task); setModalOpen(true) }, [])
  const closeModal = useCallback(() => { setModalOpen(false); setEditingTask(null) }, [])

  const saveTask = useCallback((data) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...data } : t))
    } else {
      setTasks(prev => [...prev, { id: `t${Date.now()}`, status: 'todo', ...data }])
    }
    closeModal()
  }, [editingTask, closeModal])

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
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
          tasks={filtered} allTasks={tasks}
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
