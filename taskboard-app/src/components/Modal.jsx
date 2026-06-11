import { useState, useEffect, forwardRef } from 'react'
import { MEMBERS, PHASES } from '../data.js'

const PRIORITIES = [
  { value: 'critical', label: 'Do Now',   color: '#f43f5e' },
  { value: 'high',     label: 'Delegate', color: '#f59e0b' },
  { value: 'medium',   label: 'Schedule', color: '#38bdf8' },
  { value: 'low',      label: 'Do Last',  color: '#34d399' },
]

const inp = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.08)',
  background: '#0e111a', fontSize: 13, color: '#f2f4f8',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color 0.18s',
}

const Modal = forwardRef(function Modal({ task, onSave, onClose, onDelete }, _ref) {
  const editing = !!task?.id

  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    phase: PHASES[0] || 'To Do', assignedTo: MEMBERS[0]?.id || 'J',
    dueDate: '',
  })

  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title       || '',
        description: task.description || '',
        priority:    task.priority    || 'medium',
        phase:       task.phase       || PHASES[0],
        assignedTo:  task.assignedTo  || MEMBERS[0]?.id || 'J',
        dueDate:     task.dueDate     ? task.dueDate.split('T')[0] : '',
      })
    }
  }, [task])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.title.trim()) return
    onSave({ ...task, ...form, title: form.title.trim() })
  }

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div className="modal-title">{editing ? 'Edit Task' : 'New Task'}</div>
            <div className="modal-sub">
              {editing
                ? `${task.phase} · Last updated ${new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}`
                : 'auto-assign and auto-priority available'}
            </div>
          </div>
          <button onClick={onClose} style={{
            border: 'none', background: 'transparent', color: '#555e72',
            fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 4px',
          }}>×</button>
        </div>

        {/* Title */}
        <div className="modal-field">
          <label>Title *</label>
          <input
            autoFocus
            style={inp}
            value={form.title}
            onChange={e => set('title', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Set up Supabase auth"
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* Description */}
        <div className="modal-field">
          <label>Description</label>
          <textarea
            style={{ ...inp, height: 80, resize: 'vertical' }}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Details, context, links…"
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* Row: Phase + Due date */}
        <div className="modal-row modal-field">
          <div>
            <label>Phase</label>
            <select
              style={inp}
              value={form.phase}
              onChange={e => set('phase', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label>Due Date</label>
            <input
              style={inp} type="date"
              value={form.dueDate}
              onChange={e => set('dueDate', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
        </div>

        {/* Row: Assignee + Priority */}
        <div className="modal-row modal-field">
          <div>
            <label>Assigned to</label>
            <select
              style={inp}
              value={form.assignedTo}
              onChange={e => set('assignedTo', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.id} — {m.name}</option>)}
            </select>
          </div>
          <div>
            <label>Priority</label>
            <select
              style={inp}
              value={form.priority}
              onChange={e => set('priority', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label} ({p.value})</option>)}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          {editing && onDelete && (
            <button
              onClick={() => { if (confirm('Delete this task?')) onDelete(task.id) }}
              style={{
                border: '1px solid rgba(244,63,94,0.25)', background: 'rgba(244,63,94,0.07)',
                color: '#f43f5e', borderRadius: 10, padding: '8px 14px', fontSize: 12.5,
                fontWeight: 600, cursor: 'pointer', marginRight: 'auto',
              }}
            >Delete</button>
          )}
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!form.title.trim()}
            style={{ opacity: form.title.trim() ? 1 : 0.5 }}
          >
            {editing ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
})

export default Modal
