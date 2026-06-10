import { useState, useEffect, useRef } from 'react'
import { COLS, MEMBERS, PHASES, PRIORITIES } from '../data.js'

const PC = { critical:'var(--p-critical)', high:'var(--p-high)', medium:'var(--p-medium)', low:'var(--p-low)' }

export default function Modal({ task, onSave, onDelete, onClose }) {
  const isEdit = !!task
  const ref = useRef()
  const [form, setForm] = useState({
    title: task?.title ?? '', note: task?.note ?? '', phase: task?.phase ?? PHASES[0],
    assignee: task?.assignee ?? MEMBERS[0].id, priority: task?.priority ?? 'medium',
    status: task?.status ?? 'todo', due: task?.due ?? '',
  })
  const [errors, setErrors] = useState({})
  const [confirmDel, setConfirmDel] = useState(false)

  useEffect(() => { ref.current?.focus() }, [])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: null })) }

  function submit(e) {
    e?.preventDefault()
    if (!form.title.trim()) { setErrors({ title: 'Title required' }); return }
    onSave({ ...form, title: form.title.trim(), note: form.note.trim() })
  }

  const inp = (err) => ({
    width:'100%', padding:'9px 12px',
    background:'var(--surface-0)', color:'var(--t1)',
    border: `1px solid ${err ? 'var(--p-critical)' : 'var(--border-md)'}`,
    borderRadius:'var(--r)', fontSize:13.5, outline:'none',
    transition:'border-color 0.13s',
  })

  const lbl = { display:'block', fontSize:11.5, fontWeight:600, color:'var(--t3)', marginBottom:5, letterSpacing:'0.2px', textTransform:'uppercase' }

  return (
    <div onKeyDown={e => e.key === 'Escape' && onClose()} style={{
      position:'fixed', inset:0, zIndex:100,
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      animation:'overlayin 0.15s ease',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(4px)' }}/>

      {/* Panel */}
      <div style={{
        position:'relative', zIndex:1, width:'100%', maxWidth:540,
        background:'var(--surface-1)',
        border:'1px solid var(--border-md)',
        borderBottom:'none',
        borderRadius:'var(--r-xl) var(--r-xl) 0 0',
        boxShadow:'var(--sh-modal)',
        animation:'slideup 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        maxHeight:'88vh', display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* Drag handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 2px' }}>
          <div style={{ width:32, height:3.5, borderRadius:99, background:'var(--border-lg)' }}/>
        </div>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 22px 14px', borderBottom:'1px solid var(--border)' }}>
          <div>
            <h2 style={{ fontSize:15, fontWeight:700, color:'var(--t1)', letterSpacing:'-0.3px' }}>{isEdit ? 'Edit Task' : 'New Task'}</h2>
            <p style={{ fontSize:11.5, color:'var(--t4)', marginTop:2 }}>{isEdit ? 'Update task details' : 'Add a task to the board'}</p>
          </div>
          <button onClick={onClose} style={{
            background:'none', border:'none', cursor:'pointer', padding:6, borderRadius:7,
            color:'var(--t3)', display:'flex', alignItems:'center', transition:'color 0.12s, background 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--t1)'; e.currentTarget.style.background='var(--surface-3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--t3)'; e.currentTarget.style.background='none'; }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 2.5l10 10M12.5 2.5l-10 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>
          {/* Title */}
          <div>
            <label style={lbl}>Title *</label>
            <input ref={ref} value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="What needs to be done?" style={inp(errors.title)}
              onFocus={e => e.target.style.borderColor='var(--sage-hi)'}
              onBlur={e => e.target.style.borderColor=errors.title?'var(--p-critical)':'var(--border-md)'}
            />
            {errors.title && <p style={{ fontSize:11, color:'var(--p-critical)', marginTop:4 }}>{errors.title}</p>}
          </div>

          {/* Note */}
          <div>
            <label style={lbl}>Note</label>
            <textarea value={form.note} onChange={e => set('note', e.target.value)} rows={3}
              placeholder="Context, goals, or blockers..."
              style={{ ...inp(false), resize:'vertical', lineHeight:1.55 }}
              onFocus={e => e.target.style.borderColor='var(--sage-hi)'}
              onBlur={e => e.target.style.borderColor='var(--border-md)'}
            />
          </div>

          {/* Phase + Assignee */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={lbl}>Phase</label>
              <select value={form.phase} onChange={e => set('phase', e.target.value)} style={{ ...inp(false), appearance:'none' }}
                onFocus={e => e.target.style.borderColor='var(--sage-hi)'}
                onBlur={e => e.target.style.borderColor='var(--border-md)'}
              >
                {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Assign to</label>
              <select value={form.assignee} onChange={e => set('assignee', e.target.value)} style={{ ...inp(false), appearance:'none' }}
                onFocus={e => e.target.style.borderColor='var(--sage-hi)'}
                onBlur={e => e.target.style.borderColor='var(--border-md)'}
              >
                {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label style={lbl}>Priority</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:7 }}>
              {PRIORITIES.map(p => (
                <button key={p.id} type="button" onClick={() => set('priority', p.id)} style={{
                  padding:'8px 6px', borderRadius:'var(--r)',
                  border: form.priority === p.id ? `1px solid ${PC[p.id]}60` : '1px solid var(--border)',
                  background: form.priority === p.id ? `${PC[p.id]}15` : 'var(--surface-0)',
                  cursor:'pointer', fontSize:12, fontWeight: form.priority === p.id ? 700 : 400,
                  color: form.priority === p.id ? PC[p.id] : 'var(--t3)',
                  transition:'all 0.12s', display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background: PC[p.id] }}/>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={lbl}>Status</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:7 }}>
              {COLS.map(c => (
                <button key={c.id} type="button" onClick={() => set('status', c.id)} style={{
                  padding:'8px 6px', borderRadius:'var(--r)',
                  border: form.status === c.id ? `1px solid ${c.color}50` : '1px solid var(--border)',
                  background: form.status === c.id ? `${c.color}15` : 'var(--surface-0)',
                  cursor:'pointer', fontSize:12, fontWeight: form.status === c.id ? 700 : 400,
                  color: form.status === c.id ? c.color : 'var(--t3)',
                  transition:'all 0.12s', display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background: c.color }}/>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label style={lbl}>Due date</label>
            <input type="date" value={form.due} onChange={e => set('due', e.target.value)} style={{ ...inp(false), colorScheme:'dark' }}
              onFocus={e => e.target.style.borderColor='var(--sage-hi)'}
              onBlur={e => e.target.style.borderColor='var(--border-md)'}
            />
          </div>
        </form>

        {/* Footer */}
        <div style={{ padding:'12px 22px 22px', borderTop:'1px solid var(--border)', display:'flex', gap:8, alignItems:'center' }}>
          {isEdit && onDelete && !confirmDel && (
            <button type="button" onClick={() => setConfirmDel(true)} style={{
              padding:'8px 14px', background:'none', border:'1px solid var(--border-md)',
              borderRadius:'var(--r)', fontSize:13, fontWeight:500, color:'var(--t4)', cursor:'pointer', transition:'all 0.13s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--p-critical)'; e.currentTarget.style.color='var(--p-critical)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-md)'; e.currentTarget.style.color='var(--t4)'; }}
            >Delete</button>
          )}

          {confirmDel && (
            <>
              <span style={{ fontSize:12.5, color:'var(--p-critical)', fontWeight:500, flex:1 }}>Delete this task?</span>
              <button type="button" onClick={() => setConfirmDel(false)} style={{ padding:'8px 14px', background:'none', border:'1px solid var(--border-md)', borderRadius:'var(--r)', fontSize:13, color:'var(--t3)', cursor:'pointer' }}>No</button>
              <button type="button" onClick={() => onDelete(task.id)} style={{ padding:'8px 16px', background:'var(--p-critical)', border:'none', borderRadius:'var(--r)', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer' }}>Yes, delete</button>
            </>
          )}

          {!confirmDel && (
            <>
              <button type="button" onClick={onClose} style={{
                marginLeft: isEdit ? 0 : 'auto',
                padding:'8px 18px', background:'none', border:'1px solid var(--border-md)',
                borderRadius:'var(--r)', fontSize:13, fontWeight:500, color:'var(--t3)', cursor:'pointer', transition:'all 0.13s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-lg)'; e.currentTarget.style.color='var(--t2)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-md)'; e.currentTarget.style.color='var(--t3)'; }}
              >Cancel</button>
              <button type="submit" onClick={submit} style={{
                marginLeft: isEdit ? 'auto' : 0,
                padding:'8px 22px', background:'var(--btn)', border:'none',
                borderRadius:'var(--r)', fontSize:13, fontWeight:700, color:'var(--btn-text)',
                cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.4)', transition:'background 0.13s',
                letterSpacing:'-0.2px',
              }}
              onMouseEnter={e => e.currentTarget.style.background='var(--btn-hover)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--btn)'}
              >{isEdit ? 'Save changes' : 'Create task'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
