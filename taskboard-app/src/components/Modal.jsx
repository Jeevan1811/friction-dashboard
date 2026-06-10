import { useState, useEffect, useRef, forwardRef } from 'react'
import { MEMBERS, PHASES } from '../data.js'

const PRIO_COLORS = { critical:'#C0392B', high:'#C05B30', medium:'#C07D40', low:'#2D8C5A' }
const PRIO_BG     = { critical:'rgba(192,57,43,0.08)', high:'rgba(192,91,48,0.08)', medium:'rgba(192,125,64,0.08)', low:'rgba(45,140,90,0.08)' }
const STAT_COLORS = { todo:'#64748B', inprog:'#C07D40', blocked:'#C0392B', done:'#2D8C5A' }
const STAT_BG     = { todo:'rgba(100,116,139,0.08)', inprog:'rgba(192,125,64,0.08)', blocked:'rgba(192,57,43,0.08)', done:'rgba(45,140,90,0.08)' }
const STAT_LABELS = { todo:'To Do', inprog:'In Progress', blocked:'Blocked', done:'Done' }

const IcoCouncil = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.6">
    <circle cx="8" cy="8" r="6.5"/><circle cx="8" cy="6" r="1.5"/>
    <path d="M5.5 11c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5" strokeLinecap="round"/>
  </svg>
)

const selStyle = {
  width:'100%', padding:'9px 12px',
  borderRadius:9, border:'1.5px solid rgba(26,20,16,0.09)',
  background:'#FDFBF7', color:'#1A1410',
  fontSize:13, outline:'none', cursor:'pointer',
  fontFamily:'inherit', appearance:'none', WebkitAppearance:'none',
  backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23B0A49C' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat:'no-repeat', backgroundPosition:'right 11px center',
  paddingRight:32, transition:'border-color 0.15s, box-shadow 0.15s',
}

const Input = forwardRef(({ value, onChange, placeholder, style, ...rest }, ref) => (
  <input
    ref={ref}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      width:'100%', padding:'9px 13px',
      borderRadius:9, border:'1.5px solid rgba(26,20,16,0.09)',
      background:'#FDFBF7', color:'#1A1410',
      fontSize:13, fontWeight:400, outline:'none',
      transition:'border-color 0.15s, box-shadow 0.15s',
      fontFamily:'inherit',
      ...style,
    }}
    onFocus={e => { e.target.style.borderColor='#5D0D18'; e.target.style.boxShadow='0 0 0 3px rgba(93,13,24,0.08)'; }}
    onBlur={e => { e.target.style.borderColor='rgba(26,20,16,0.09)'; e.target.style.boxShadow='none'; }}
    {...rest}
  />
))

const Label = ({ children }) => (
  <div style={{
    fontSize:10.5, fontWeight:700, color:'#B0A49C',
    textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:6,
  }}>
    {children}
  </div>
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
    setTimeout(() => titleRef.current?.focus(), 80)
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
    const q = `Task: "${form.title}"${form.note ? `\nContext: ${form.note}` : ''}\nPriority: ${form.priority}, Status: ${form.status}${form.due ? `, Due: ${form.due}` : ''}\n\nShould we proceed? Any risks or improvements?`
    window.prompt('Copy into /the-council:', q)
  }

  const assigneeMember = MEMBERS.find(m => m.id === form.assignee)

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position:'fixed', inset:0,
        background:'rgba(16,12,10,0.50)',
        backdropFilter:'blur(6px)',
        WebkitBackdropFilter:'blur(6px)',
        zIndex:200,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:24,
        animation:'fadeIn 0.14s ease',
      }}
    >
      <div style={{
        background:'#FDFBF7',
        borderRadius:18,
        width:'100%', maxWidth:640,
        maxHeight:'90vh',
        display:'flex', flexDirection:'column',
        boxShadow:'0 32px 96px rgba(16,12,10,0.24), 0 0 0 1px rgba(26,20,16,0.07)',
        animation:'scaleIn 0.20s cubic-bezier(0.22,1,0.36,1)',
        overflow:'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'20px 24px 16px',
          borderBottom:'1px solid rgba(26,20,16,0.07)',
          flexShrink:0,
          background:'#FFFFFF',
        }}>
          <div>
            <div style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.025em', color:'#1A1410', lineHeight:1.1 }}>
              {task ? 'Edit Task' : 'New Task'}
            </div>
            {task && (
              <div style={{ fontSize:11, color:'#B0A49C', marginTop:2, fontWeight:400, letterSpacing:'0.01em' }}>
                Last updated {new Date(task.updated_at || task.created_at || Date.now()).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width:30, height:30, borderRadius:8,
              background:'rgba(26,20,16,0.05)', color:'#B0A49C',
              fontSize:15, display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', border:'none', transition:'background 0.13s, color 0.13s',
              fontFamily:'inherit', lineHeight:1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(26,20,16,0.10)'; e.currentTarget.style.color='#1A1410'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(26,20,16,0.05)'; e.currentTarget.style.color='#B0A49C'; }}
          >✕</button>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY:'auto', padding:'20px 24px', flex:1, display:'flex', flexDirection:'column', gap:16 }}>

          {/* Title */}
          <div>
            <Label>Title *</Label>
            <Input
              ref={titleRef}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="What needs to get done?"
              style={{ fontSize:15, padding:'11px 14px', fontWeight:500, background:'#FFFFFF', borderColor:'rgba(26,20,16,0.10)' }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave() } }}
            />
          </div>

          {/* Note */}
          <div>
            <Label>Note</Label>
            <textarea
              value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder="Additional context or details..."
              rows={3}
              style={{
                width:'100%', padding:'10px 13px',
                borderRadius:9, border:'1.5px solid rgba(26,20,16,0.09)',
                background:'#FDFBF7', color:'#1A1410',
                fontSize:13, lineHeight:1.6, outline:'none', resize:'vertical',
                transition:'border-color 0.15s, box-shadow 0.15s',
                fontFamily:'inherit', minHeight:80, boxSizing:'border-box',
              }}
              onFocus={e => { e.target.style.borderColor='#5D0D18'; e.target.style.boxShadow='0 0 0 3px rgba(93,13,24,0.08)'; }}
              onBlur={e => { e.target.style.borderColor='rgba(26,20,16,0.09)'; e.target.style.boxShadow='none'; }}
            />
          </div>

          {/* Row: Phase + Assignee + Due */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div>
              <Label>Phase</Label>
              <select value={form.phase} onChange={e => set('phase', e.target.value)}
                style={{ ...selStyle, color: form.phase ? '#1A1410' : '#B0A49C' }}
                onFocus={e => { e.target.style.borderColor='#5D0D18'; e.target.style.boxShadow='0 0 0 3px rgba(93,13,24,0.08)'; }}
                onBlur={e => { e.target.style.borderColor='rgba(26,20,16,0.09)'; e.target.style.boxShadow='none'; }}
              >
                <option value="">No phase</option>
                {(PHASES||['Discovery','Build','Launch','Operations']).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <Label>Assignee</Label>
              <div style={{ position:'relative' }}>
                <select value={form.assignee} onChange={e => set('assignee', e.target.value)}
                  style={{ ...selStyle, paddingLeft: form.assignee ? 32 : 12, color: form.assignee ? '#1A1410' : '#B0A49C' }}
                  onFocus={e => { e.target.style.borderColor='#5D0D18'; e.target.style.boxShadow='0 0 0 3px rgba(93,13,24,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor='rgba(26,20,16,0.09)'; e.target.style.boxShadow='none'; }}
                >
                  <option value="">Unassigned</option>
                  {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                {assigneeMember && (
                  <div style={{
                    position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
                    width:18, height:18, borderRadius:'50%',
                    background:assigneeMember.color, pointerEvents:'none',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:8.5, fontWeight:700, color:'#fff',
                  }}>{assigneeMember.id}</div>
                )}
              </div>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={form.due} onChange={e => set('due', e.target.value)} />
            </div>
          </div>

          {/* Priority */}
          <div>
            <Label>Priority</Label>
            <div style={{ display:'flex', gap:7 }}>
              {['critical','high','medium','low'].map(p => {
                const active = form.priority === p
                const c = PRIO_COLORS[p]
                return (
                  <button key={p} onClick={() => set('priority', p)}
                    style={{
                      flex:1, padding:'8px 6px', borderRadius:9,
                      border:`1.5px solid ${active ? c : 'rgba(26,20,16,0.09)'}`,
                      background: active ? PRIO_BG[p] : 'transparent',
                      color: active ? c : '#7A6B62',
                      fontSize:11.5, fontWeight: active ? 700 : 500,
                      cursor:'pointer', transition:'all 0.14s', fontFamily:'inherit',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                      boxShadow: active ? `0 0 0 3px ${c}14` : 'none',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor=`${c}50`; e.currentTarget.style.color=c; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor='rgba(26,20,16,0.09)'; e.currentTarget.style.color='#7A6B62'; } }}
                  >
                    <span style={{ width:7, height:7, borderRadius:'50%', background:c, flexShrink:0 }}/>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <div style={{ display:'flex', gap:7 }}>
              {Object.entries(STAT_LABELS).map(([id, label]) => {
                const active = form.status === id
                const c = STAT_COLORS[id]
                return (
                  <button key={id} onClick={() => set('status', id)}
                    style={{
                      flex:1, padding:'8px 6px', borderRadius:9,
                      border:`1.5px solid ${active ? c : 'rgba(26,20,16,0.09)'}`,
                      background: active ? STAT_BG[id] : 'transparent',
                      color: active ? c : '#7A6B62',
                      fontSize:11.5, fontWeight: active ? 700 : 500,
                      cursor:'pointer', transition:'all 0.14s', fontFamily:'inherit', textAlign:'center',
                      boxShadow: active ? `0 0 0 3px ${c}14` : 'none',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor=`${c}50`; e.currentTarget.style.color=c; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor='rgba(26,20,16,0.09)'; e.currentTarget.style.color='#7A6B62'; } }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'14px 24px 18px',
          borderTop:'1px solid rgba(26,20,16,0.07)',
          flexShrink:0,
          background:'#FFFFFF',
        }}>
          <button onClick={openCouncil}
            style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'8px 14px', borderRadius:9,
              border:'1.5px solid rgba(91,140,125,0.30)',
              background:'rgba(91,140,125,0.06)',
              color:'#3D7A6C', fontSize:12, fontWeight:600,
              cursor:'pointer', transition:'all 0.14s', fontFamily:'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(91,140,125,0.12)'; e.currentTarget.style.borderColor='rgba(91,140,125,0.50)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(91,140,125,0.06)'; e.currentTarget.style.borderColor='rgba(91,140,125,0.30)'; }}
          >
            <IcoCouncil/> Ask Council
          </button>

          <div style={{ flex:1 }}/>

          {task && !confirmDelete && (
            <button onClick={() => setConfirmDelete(true)}
              style={{ padding:'8px 14px', borderRadius:9, border:'1.5px solid transparent', background:'transparent', color:'#C0392B', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.14s', fontFamily:'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(192,57,43,0.07)'; e.currentTarget.style.borderColor='rgba(192,57,43,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; }}
            >Delete</button>
          )}
          {task && confirmDelete && (
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ fontSize:12, color:'#7A6B62' }}>Delete this task?</span>
              <button onClick={() => onDelete(task.id)} style={{ padding:'7px 14px', borderRadius:8, background:'#C0392B', color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer', fontFamily:'inherit' }}>Yes, delete</button>
              <button onClick={() => setConfirmDelete(false)} style={{ padding:'7px 14px', borderRadius:8, background:'rgba(26,20,16,0.07)', color:'#4A3930', fontSize:12, fontWeight:600, border:'none', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            </div>
          )}

          <button onClick={onClose}
            style={{ padding:'8px 18px', borderRadius:9, border:'1.5px solid rgba(26,20,16,0.10)', background:'transparent', color:'#7A6B62', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.14s', fontFamily:'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(26,20,16,0.20)'; e.currentTarget.style.background='rgba(26,20,16,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(26,20,16,0.10)'; e.currentTarget.style.background='transparent'; }}
          >Cancel</button>

          <button onClick={handleSave}
            style={{
              padding:'8px 24px', borderRadius:9,
              background:'linear-gradient(135deg, #7A1020, #5D0D18)', color:'#FFF9EB',
              fontSize:13, fontWeight:600, border:'none', cursor:'pointer',
              boxShadow:'0 3px 10px rgba(93,13,24,0.28), inset 0 1px 0 rgba(255,255,255,0.10)',
              transition:'all 0.14s', fontFamily:'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow='0 5px 18px rgba(93,13,24,0.40), inset 0 1px 0 rgba(255,255,255,0.10)'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow='0 3px 10px rgba(93,13,24,0.28), inset 0 1px 0 rgba(255,255,255,0.10)'; e.currentTarget.style.transform=''; }}
          >{task ? 'Save Changes' : 'Create Task'}</button>
        </div>

      </div>
    </div>
  )
}
