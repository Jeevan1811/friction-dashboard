import { useState, useEffect, useRef } from 'react'
import { MEMBERS, PHASES } from '../data.js'

const PRIO_COLORS = { critical:'#DC2626', high:'#EA580C', medium:'#D97706', low:'#16A34A' }
const PRIO_BG     = { critical:'rgba(220,38,38,0.10)', high:'rgba(234,88,12,0.10)', medium:'rgba(217,119,6,0.10)', low:'rgba(22,163,74,0.10)' }
const STAT_COLORS = { todo:'#64748B', inprog:'#D97706', blocked:'#DC2626', done:'#16A34A' }
const STAT_BG     = { todo:'rgba(100,116,139,0.10)', inprog:'rgba(217,119,6,0.10)', blocked:'rgba(220,38,38,0.10)', done:'rgba(22,163,74,0.10)' }
const STAT_LABELS = { todo:'To Do', inprog:'In Progress', blocked:'Blocked', done:'Done' }

const IcoCouncil = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.6">
    <circle cx="8" cy="8" r="6.5"/>
    <circle cx="8" cy="6" r="1.5"/>
    <path d="M5.5 11c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5" strokeLinecap="round"/>
  </svg>
)

const Field = ({ label, children }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{
      display:'block', fontSize:11, fontWeight:700,
      color:'#7A5558', textTransform:'uppercase',
      letterSpacing:'0.07em', marginBottom:6,
    }}>
      {label}
    </label>
    {children}
  </div>
)

const Input = ({ value, onChange, placeholder, ...rest }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      width:'100%', padding:'10px 13px',
      borderRadius:10, border:'1.5px solid rgba(93,13,24,0.11)',
      background:'#FFFFFF', color:'#0E0204',
      fontSize:14, fontWeight:400, outline:'none',
      transition:'border-color 0.15s, box-shadow 0.15s',
      fontFamily:'inherit',
    }}
    onFocus={e => { e.target.style.borderColor='#5D0D18'; e.target.style.boxShadow='0 0 0 3px rgba(93,13,24,0.10)'; }}
    onBlur={e => { e.target.style.borderColor='rgba(93,13,24,0.11)'; e.target.style.boxShadow='none'; }}
    {...rest}
  />
)

export default function Modal({ open, task, defaultStatus, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ title:'', note:'', phase:'', assignee:'', priority:'medium', status:'todo', due:'' })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const titleRef = useRef(null)

  useEffect(() => {
    if (!open) return
    if (task) {
      setForm({ title:task.title||'', note:task.note||'', phase:task.phase||'', assignee:task.assignee||'', priority:task.priority||'medium', status:task.status||'todo', due:task.due||'' })
    } else {
      setForm({ title:'', note:'', phase:'', assignee:'', priority:'medium', status:defaultStatus||'todo', due:'' })
    }
    setConfirmDelete(false)
    setTimeout(() => titleRef.current?.focus(), 100)
  }, [open, task, defaultStatus])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!open) return null

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.title.trim()) { titleRef.current?.focus(); return }
    onSave({ ...form, title: form.title.trim() })
  }

  const openCouncil = () => {
    const q = `Task: "${form.title}"${form.note ? `\nContext: ${form.note}` : ''}\nPriority: ${form.priority}, Status: ${form.status}${form.due ? `, Due: ${form.due}` : ''}\n\nShould we proceed with this task as defined? Any risks, improvements, or blockers we should consider before committing?`
    window.prompt('Copy and paste this into /the-council:', q)
  }

  return (
    <div
      style={{
        position:'fixed', inset:0,
        background:'rgba(14,2,4,0.35)',
        backdropFilter:'blur(6px)',
        WebkitBackdropFilter:'blur(6px)',
        zIndex:200,
        display:'flex', alignItems:'flex-end', justifyContent:'center',
        animation:'fadeIn 0.2s ease',
        padding:'0',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background:'#FFFFFF',
        borderRadius:'20px 20px 0 0',
        width:'100%', maxWidth:560,
        maxHeight:'92vh',
        display:'flex', flexDirection:'column',
        animation:'slideUp 0.30s cubic-bezier(0.22,1,0.36,1)',
        boxShadow:'0 -8px 40px rgba(93,13,24,0.18)',
        overflow:'hidden',
      }}>
        {/* Handle */}
        <div style={{ width:36, height:4, borderRadius:100, background:'rgba(93,13,24,0.15)', margin:'14px auto 0', flexShrink:0 }}/>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 22px 0', flexShrink:0 }}>
          <div style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.02em', color:'#0E0204' }}>
            {task ? 'Edit Task' : 'New Task'}
          </div>
          <button
            onClick={onClose}
            style={{
              width:30, height:30, borderRadius:'50%',
              background:'rgba(93,13,24,0.07)', color:'#7A5558',
              fontSize:15, display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', border:'none', transition:'background 0.15s, color 0.15s',
              fontFamily:'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(93,13,24,0.12)'; e.currentTarget.style.color='#0E0204'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(93,13,24,0.07)'; e.currentTarget.style.color='#7A5558'; }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY:'auto', padding:'16px 22px 0', flex:1 }}>

          <Field label="Title *">
            <Input
              ref={titleRef}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="What needs to get done?"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }}}
            />
          </Field>

          <Field label="Note">
            <textarea
              value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder="Additional context or details..."
              rows={3}
              style={{
                width:'100%', padding:'10px 13px',
                borderRadius:10, border:'1.5px solid rgba(93,13,24,0.11)',
                background:'#FFFFFF', color:'#0E0204',
                fontSize:13, lineHeight:1.5, outline:'none', resize:'vertical',
                transition:'border-color 0.15s, box-shadow 0.15s',
                fontFamily:'inherit', minHeight:72,
              }}
              onFocus={e => { e.target.style.borderColor='#5D0D18'; e.target.style.boxShadow='0 0 0 3px rgba(93,13,24,0.10)'; }}
              onBlur={e => { e.target.style.borderColor='rgba(93,13,24,0.11)'; e.target.style.boxShadow='none'; }}
            />
          </Field>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <Field label="Phase">
              <select
                value={form.phase}
                onChange={e => set('phase', e.target.value)}
                style={{
                  width:'100%', padding:'10px 13px',
                  borderRadius:10, border:'1.5px solid rgba(93,13,24,0.11)',
                  background:'#FFFFFF', color: form.phase ? '#0E0204' : '#B8969A',
                  fontSize:13, outline:'none', cursor:'pointer',
                  fontFamily:'inherit', appearance:'none', WebkitAppearance:'none',
                  backgroundImage:`url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23B89498' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center',
                  paddingRight:36,
                  transition:'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor='#5D0D18'; e.target.style.boxShadow='0 0 0 3px rgba(93,13,24,0.10)'; }}
                onBlur={e => { e.target.style.borderColor='rgba(93,13,24,0.11)'; e.target.style.boxShadow='none'; }}
              >
                <option value="">Select phase</option>
                {(PHASES||['Discovery','Build','Launch','Operations']).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>

            <Field label="Assignee">
              <select
                value={form.assignee}
                onChange={e => set('assignee', e.target.value)}
                style={{
                  width:'100%', padding:'10px 13px',
                  borderRadius:10, border:'1.5px solid rgba(93,13,24,0.11)',
                  background:'#FFFFFF', color: form.assignee ? '#0E0204' : '#B8969A',
                  fontSize:13, outline:'none', cursor:'pointer',
                  fontFamily:'inherit', appearance:'none', WebkitAppearance:'none',
                  backgroundImage:`url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23B89498' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center',
                  paddingRight:36,
                  transition:'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor='#5D0D18'; e.target.style.boxShadow='0 0 0 3px rgba(93,13,24,0.10)'; }}
                onBlur={e => { e.target.style.borderColor='rgba(93,13,24,0.11)'; e.target.style.boxShadow='none'; }}
              >
                <option value="">Unassigned</option>
                {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
          </div>

          {/* Priority */}
          <Field label="Priority">
            <div style={{ display:'flex', gap:6 }}>
              {['critical','high','medium','low'].map(p => {
                const active = form.priority === p
                const c = PRIO_COLORS[p]
                return (
                  <button
                    key={p}
                    onClick={() => set('priority', p)}
                    style={{
                      flex:1, padding:'8px 6px',
                      borderRadius:8,
                      border:`1.5px solid ${active ? c : 'rgba(93,13,24,0.11)'}`,
                      background: active ? PRIO_BG[p] : 'transparent',
                      color: active ? c : '#7A5558',
                      fontSize:11, fontWeight:700,
                      cursor:'pointer', transition:'all 0.15s',
                      fontFamily:'inherit', textTransform:'capitalize',
                      display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                      boxShadow: active ? `0 0 0 3px ${c}18` : 'none',
                    }}
                  >
                    <span style={{ width:8, height:8, borderRadius:'50%', background:c }}/>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Status */}
          <Field label="Status">
            <div style={{ display:'flex', gap:6 }}>
              {Object.entries(STAT_LABELS).map(([id, label]) => {
                const active = form.status === id
                const c = STAT_COLORS[id]
                return (
                  <button
                    key={id}
                    onClick={() => set('status', id)}
                    style={{
                      flex:1, padding:'8px 6px',
                      borderRadius:8,
                      border:`1.5px solid ${active ? c : 'rgba(93,13,24,0.11)'}`,
                      background: active ? STAT_BG[id] : 'transparent',
                      color: active ? c : '#7A5558',
                      fontSize:11, fontWeight:700,
                      cursor:'pointer', transition:'all 0.15s',
                      fontFamily:'inherit', textAlign:'center',
                      boxShadow: active ? `0 0 0 3px ${c}18` : 'none',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="Due Date">
            <Input
              type="date"
              value={form.due}
              onChange={e => set('due', e.target.value)}
            />
          </Field>

        </div>

        {/* Footer */}
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'14px 22px 22px',
          borderTop:'1px solid rgba(93,13,24,0.07)',
          flexShrink:0, marginTop:4,
        }}>
          {/* Council button */}
          <button
            onClick={openCouncil}
            title="Pressure-test this task with Claude Council"
            style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'9px 13px', borderRadius:10,
              border:'1.5px solid rgba(159,178,172,0.40)',
              background:'rgba(159,178,172,0.08)',
              color:'#4A7A74', fontSize:12, fontWeight:600,
              cursor:'pointer', transition:'all 0.15s',
              fontFamily:'inherit', whiteSpace:'nowrap', flexShrink:0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(159,178,172,0.16)'; e.currentTarget.style.borderColor='rgba(159,178,172,0.60)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(159,178,172,0.08)'; e.currentTarget.style.borderColor='rgba(159,178,172,0.40)'; }}
          >
            <IcoCouncil/> Ask Council
          </button>

          <div style={{ flex:1 }}/>

          {/* Delete / confirm */}
          {task && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                padding:'9px 14px', borderRadius:10,
                border:'1.5px solid transparent', background:'transparent',
                color:'#DC2626', fontSize:13, fontWeight:600,
                cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='#FEF2F2'; e.currentTarget.style.borderColor='#FECACA'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; }}
            >
              Delete
            </button>
          )}
          {task && confirmDelete && (
            <div style={{ display:'flex', alignItems:'center', gap:6, animation:'fadeIn 0.15s ease' }}>
              <span style={{ fontSize:12, color:'#7A5558' }}>Delete this task?</span>
              <button
                onClick={() => onDelete(task.id)}
                style={{ padding:'7px 12px', borderRadius:8, background:'#DC2626', color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer', fontFamily:'inherit' }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ padding:'7px 12px', borderRadius:8, background:'rgba(93,13,24,0.07)', color:'#3A1016', fontSize:12, fontWeight:600, border:'none', cursor:'pointer', fontFamily:'inherit' }}
              >
                No
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              padding:'9px 16px', borderRadius:10,
              border:'1.5px solid rgba(93,13,24,0.11)', background:'transparent',
              color:'#7A5558', fontSize:13, fontWeight:600,
              cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(93,13,24,0.20)'; e.currentTarget.style.color='#3A1016'; e.currentTarget.style.background='rgba(93,13,24,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(93,13,24,0.11)'; e.currentTarget.style.color='#7A5558'; e.currentTarget.style.background='transparent'; }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            style={{
              padding:'9px 22px', borderRadius:10,
              background:'#5D0D18', color:'#FFF9EB',
              fontSize:13, fontWeight:600, letterSpacing:'-0.01em',
              border:'none', cursor:'pointer',
              boxShadow:'0 2px 10px rgba(93,13,24,0.30)',
              transition:'background 0.15s, box-shadow 0.15s, transform 0.15s',
              fontFamily:'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='#7A1020'; e.currentTarget.style.boxShadow='0 4px 16px rgba(93,13,24,0.40)'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='#5D0D18'; e.currentTarget.style.boxShadow='0 2px 10px rgba(93,13,24,0.30)'; e.currentTarget.style.transform=''; }}
          >
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
