import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MEMBERS } from '../data.js'

const P_LABEL = { critical: 'Do Now', high: 'Delegate', medium: 'Schedule', low: 'Do Last' }
const P_CLASS = { critical: 'p-critical', high: 'p-high', medium: 'p-medium', low: 'p-low' }
const P_CARD  = { critical: 'priority-critical', high: 'priority-high', medium: 'priority-medium', low: 'priority-low' }

export default function Card({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    cursor: isDragging ? 'grabbing' : 'pointer',
  }

  const member = MEMBERS.find(m => m.id === task.assignedTo)
  const pClass = P_CLASS[task.priority] || 'p-medium'
  const cardCls = P_CARD[task.priority] || 'priority-medium'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`task-card ${cardCls}`}
    >
      {/* Title */}
      <div className="task-title">{task.title}</div>

      {/* Description */}
      {task.description && (
        <div className="task-desc">{task.description.length > 80 ? task.description.slice(0, 80) + '…' : task.description}</div>
      )}

      {/* Footer */}
      <div className="task-footer">
        {/* Priority pill */}
        <span className={`pill ${pClass}`}>
          <span className="pill-dot" />
          {P_LABEL[task.priority] || task.priority}
        </span>

        {/* Member */}
        {member && (
          <div
            className="member-avatar"
            style={{ background: `${member.color}22`, border: `1.5px solid ${member.color}55`, color: member.color }}
          >
            {member.id}
          </div>
        )}

        {/* Due date */}
        {task.dueDate && (
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, color: '#555e72', marginLeft: 'auto',
          }}>
            {new Date(task.dueDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    </div>
  )
}
