import { useState, useEffect, useRef, useCallback } from 'react'
import { MEMBERS } from '../data.js'

const PRIO_COLORS = { critical:'#DC2626', high:'#EA580C', medium:'#D97706', low:'#16A34A' }

const IcoSearch  = () => <svg width="15" height="15" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="5"/><path d="M11 11l2.5 2.5" strokeLinecap="round"/></svg>
const IcoTask    = () => <svg width="13" height="13" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 8l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IcoPlus    = () => <svg width="13" height="13" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><path d="M8 3v10M3 8h10" strokeLinecap="round"/></svg>
const IcoFilter  = () => <svg width="13" height="13" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round"/></svg>
const IcoPerson  = () => <svg width="13" height="13" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="2.5"/><path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" strokeLinecap="round"/></svg>

export default function CommandPalette({ open, onClose, tasks, onAdd, onEdit, onFilterMember, onFilterPriority, onClear }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const buildItems = useCallback(() => {
    const q = query.toLowerCase().trim()
    const items = []

    // Static actions (always show when no query, or if query matches)
    const actions = [
      { type: 'action', label: 'New task', icon: <IcoPlus/>, accent:'#5D0D18', action: () => { onAdd(null); onClose() } },
      { type: 'action', label: 'New critical task', icon: <IcoPlus/>, accent:'#DC2626', action: () => { onAdd(null); onClose() } },
      { type: 'action', label: 'Clear all filters', icon: <IcoFilter/>, accent:'#6B4448', action: () => { onClear(); onClose() } },
    ]

    // Member filter actions
    const memberActions = MEMBERS.map(m => ({
      type: 'filter',
      label: `Show ${m.name}'s tasks`,
      icon: <IcoPerson/>,
      accent: m.color,
      action: () => { onFilterMember(m.id); onClose() },
    }))

    // Priority filter actions
    const prioActions = ['critical','high','medium','low'].map(p => ({
      type: 'filter',
      label: `Show ${p} priority`,
      icon: <IcoFilter/>,
      accent: PRIO_COLORS[p],
      action: () => { onFilterPriority(p); onClose() },
    }))

    // Matching tasks
    const matchedTasks = q
      ? tasks.filter(t =>
          t.title.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q)) ||
          (t.phase && t.phase.toLowerCase().includes(q))
        ).slice(0, 6)
      : []

    const allActions = [...actions, ...memberActions, ...prioActions]
    const filteredActions = q
      ? allActions.filter(a => a.label.toLowerCase().includes(q))
      : actions.slice(0, 3)

    if (matchedTasks.length > 0) {
      items.push({ type:'heading', label: 'Tasks' })
      matchedTasks.forEach(t => {
        items.push({
          type: 'task',
          label: t.title,
          meta: t.status,
          priority: t.priority,
          task: t,
          icon: <IcoTask/>,
          accent: PRIO_COLORS[t.priority] || '#A88285',
          action: () => { onEdit(t); onClose() },
        })
      })
    }

    if (filteredActions.length > 0) {
      items.push({ type:'heading', label: q ? 'Actions' : 'Quick actions' })
      filteredActions.forEach(a => items.push(a))
    }

    return items
  }, [query, tasks, onAdd, onClose, onEdit, onFilterMember, onFilterPriority, onClear])

  const items = buildItems()
  const clickableItems = items.filter(i => i.type !== 'heading')

  useEffect(() => {
    setSelected(0)
  }, [query])

  const handleKey = useCallback((e) => {
    if (!open) return
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, clickableItems.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter') {
      e.preventDefault()
      clickableItems[selected]?.action?.()
    }
  }, [open, onClose, clickableItems, selected])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!open) return null

  const STATUS_LABELS = { todo:'To Do', inprog:'In Progress', blocked:'Blocked', done:'Done' }

  let clickIdx = -1

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(14,2,4,0.40)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 80,
        animation: 'fadeIn 0.12s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          boxShadow: '0 24px 64px rgba(14,2,4,0.20), 0 0 0 1px rgba(14,2,4,0.08)',
          width: '100%',
          maxWidth: 520,
          overflow: 'hidden',
          animation: 'cmdIn 0.16s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Search input */}
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'14px 16px',
          borderBottom:'1px solid rgba(14,2,4,0.07)',
        }}>
          <span style={{ color:'#A88285', flexShrink:0 }}><IcoSearch/></span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks or type a command…"
            style={{
              flex:1, border:'none', outline:'none',
              fontSize:14, fontWeight:400, color:'#0E0204',
              background:'transparent',
              fontFamily:'inherit',
            }}
          />
          <kbd style={{
            fontSize:10, fontWeight:600, color:'#C4AEAE',
            border:'1px solid rgba(14,2,4,0.10)', borderRadius:4,
            padding:'2px 6px', background:'rgba(14,2,4,0.03)',
            flexShrink:0,
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 340, overflowY:'auto', padding:'6px 0' }}>
          {items.length === 0 ? (
            <div style={{ padding:'28px 16px', textAlign:'center', color:'#A88285', fontSize:13 }}>
              No results for "{query}"
            </div>
          ) : items.map((item, i) => {
            if (item.type === 'heading') {
              return (
                <div key={`h${i}`} style={{
                  fontSize:10, fontWeight:600, color:'#C4AEAE',
                  textTransform:'uppercase', letterSpacing:'0.08em',
                  padding:'8px 16px 4px',
                }}>
                  {item.label}
                </div>
              )
            }

            clickIdx++
            const myIdx = clickIdx
            const isSelected = myIdx === selected

            if (item.type === 'task') {
              return (
                <div
                  key={`t${i}`}
                  onClick={item.action}
                  onMouseEnter={() => setSelected(myIdx)}
                  style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'8px 16px', cursor:'pointer',
                    background: isSelected ? '#F0E8D3' : 'transparent',
                    transition:'background 0.10s',
                  }}
                >
                  <span style={{ color: item.accent, flexShrink:0 }}>{item.icon}</span>
                  <span style={{ flex:1, fontSize:13, fontWeight:500, color:'#0E0204', lineHeight:1.3 }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontSize:10.5, fontWeight:500, color:'#A88285',
                    background:'rgba(14,2,4,0.05)', borderRadius:4, padding:'1px 7px',
                  }}>
                    {STATUS_LABELS[item.meta] || item.meta}
                  </span>
                  <span style={{
                    width:5, height:5, borderRadius:'50%', background: item.accent, flexShrink:0,
                  }}/>
                </div>
              )
            }

            return (
              <div
                key={`a${i}`}
                onClick={item.action}
                onMouseEnter={() => setSelected(myIdx)}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'8px 16px', cursor:'pointer',
                  background: isSelected ? '#F0E8D3' : 'transparent',
                  transition:'background 0.10s',
                }}
              >
                <div style={{
                  width:24, height:24, borderRadius:6,
                  background:`${item.accent}14`, color: item.accent,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                }}>
                  {item.icon}
                </div>
                <span style={{ flex:1, fontSize:13, fontWeight:500, color:'#0E0204' }}>
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'8px 16px',
          borderTop:'1px solid rgba(14,2,4,0.06)',
          background:'#FEFCF6',
        }}>
          {[['↑↓','Navigate'],['↵','Select'],['ESC','Close']].map(([key,label]) => (
            <span key={key} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10.5, color:'#C4AEAE' }}>
              <kbd style={{ border:'1px solid rgba(14,2,4,0.10)', borderRadius:3, padding:'1px 5px', background:'#FFFFFF', fontFamily:'inherit', fontSize:10, fontWeight:600, color:'#A88285' }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
