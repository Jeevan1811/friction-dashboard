import { useState, useCallback, useEffect } from 'react'
import { MEMBERS } from '../data.js'
import { fetchClients, upsertClient, deleteClient as dbDeleteClient } from '../lib/db.js'

const INDUSTRIES = ['Technology','Finance','Healthcare','Retail','Education','Manufacturing','Consulting','Other']
const STATUSES   = ['Active','Prospect','Inactive','On Hold']

function genId() { return `c_${Date.now()}_${Math.random().toString(36).slice(2,7)}` }

function Avatar({ id, size = 28 }) {
  const m = MEMBERS.find(x => x.id === id)
  if (!m) return null
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: m.color, color: '#fff', fontSize: size * 0.38, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{m.id}</div>
  )
}

function StatusBadge({ status }) {
  const colors = { Active:'#34d399', Prospect:'#38bdf8', Inactive:'#555e72', 'On Hold':'#f59e0b' }
  const c = colors[status] || '#555e72'
  return <span style={{ fontSize: 10.5, fontWeight: 600, color: c, background: `${c}14`, borderRadius: 99, padding: '2px 8px', border: `1px solid ${c}28` }}>{status}</span>
}

function ClientModal({ client, onSave, onClose, onDelete }) {
  const [form, setForm] = useState(client || { name:'', industry:'Technology', status:'Active', contact:'', email:'', phone:'', value:'', notes:'', assignee:'J' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const inputStyle = { width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.10)', background:'#12151f', fontSize:13, color:'#f2f4f8', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }
  const labelStyle = { fontSize:10.5, fontWeight:600, color:'#8b93a7', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4, display:'block' }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(26,20,16,0.40)', backdropFilter:'blur(3px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#1a1e2c', borderRadius:14, width:480, maxHeight:'80vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(26,20,16,0.20)', padding:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#f2f4f8' }}>{client ? 'Edit Client' : 'New Client'}</h3>
          <button onClick={onClose} style={{ border:'none', background:'transparent', fontSize:18, cursor:'pointer', color:'#555e72' }}>×</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={labelStyle}>Company Name *</label>
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Company name" />
          </div>
          <div><label style={labelStyle}>Industry</label><select style={inputStyle} value={form.industry} onChange={e => set('industry', e.target.value)}>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></div>
          <div><label style={labelStyle}>Status</label><select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label style={labelStyle}>Contact Person</label><input style={inputStyle} value={form.contact} onChange={e => set('contact', e.target.value)} /></div>
          <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          <div><label style={labelStyle}>Monthly Value (RM)</label><input style={inputStyle} type="number" value={form.value} onChange={e => set('value', e.target.value)} /></div>
          <div><label style={labelStyle}>Owner</label><select style={inputStyle} value={form.assignee} onChange={e => set('assignee', e.target.value)}>{MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          <div style={{ gridColumn:'1/-1' }}><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, height:72, resize:'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:20, gap:10 }}>
          {client && <button onClick={() => onDelete(client.id)} style={{ border:'1px solid rgba(220,38,38,0.25)', background:'rgba(244,63,94,0.07)', color:'#f43f5e', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>Remove</button>}
          <div style={{ display:'flex', gap:8, marginLeft:'auto' }}>
            <button onClick={onClose} style={{ border:'1px solid rgba(255,255,255,0.10)', background:'transparent', color:'#8b93a7', borderRadius:8, padding:'8px 16px', fontSize:13, cursor:'pointer' }}>Cancel</button>
            <button onClick={() => { if (!form.name.trim()) return; onSave({ ...form, id: form.id || genId(), value: parseFloat(form.value) || 0 }) }} style={{ background:'#6366f1', color:'#ffffff', border:'none', borderRadius:8, padding:'8px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Save Client</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClientDetail({ client, onEdit, onClose }) {
  return (
    <div style={{ position:'absolute', right:0, top:0, bottom:0, width:340, background:'#12151f', borderLeft:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', zIndex:10, boxShadow:'-8px 0 24px rgba(255,255,255,0.05)' }}>
      <div style={{ padding:'18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#f2f4f8' }}>{client.name}</h3>
        <button onClick={onClose} style={{ border:'none', background:'transparent', fontSize:18, cursor:'pointer', color:'#555e72' }}>×</button>
      </div>
      <div style={{ padding:'16px 20px', flex:1, overflowY:'auto' }}>
        <StatusBadge status={client.status} />
        <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:12 }}>
          {[['Industry', client.industry],['Contact', client.contact],['Email', client.email],['Phone', client.phone],['Monthly Value', client.value ? `RM ${Number(client.value).toLocaleString()}` : '—']].map(([k, v]) => v && (
            <div key={k}><div style={{ fontSize:10, fontWeight:600, color:'#555e72', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>{k}</div><div style={{ fontSize:13, color:'#f2f4f8', fontWeight:500 }}>{v}</div></div>
          ))}
          {client.notes && <div><div style={{ fontSize:10, fontWeight:600, color:'#555e72', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>Notes</div><div style={{ fontSize:12, color:'#8b93a7', lineHeight:1.55 }}>{client.notes}</div></div>}
          <div><div style={{ fontSize:10, fontWeight:600, color:'#555e72', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Owner</div><div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar id={client.assignee} size={24} /><span style={{ fontSize:12, color:'#f2f4f8' }}>{MEMBERS.find(m => m.id === client.assignee)?.name || client.assignee}</span></div></div>
        </div>
      </div>
      <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onEdit} style={{ width:'100%', background:'#6366f1', color:'#ffffff', border:'none', borderRadius:8, padding:'9px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Edit Client</button>
      </div>
    </div>
  )
}

export default function Clients() {
  const [clients, setClients]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('All')
  const [selected, setSelected]   = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)

  useEffect(() => {
    fetchClients().then(data => { setClients(data || []); setLoading(false) })
  }, [])

  async function handleSave(data) {
    const saved = await upsertClient(data)
    if (saved) {
      setClients(prev => prev.find(c => c.id === saved.id) ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved])
    }
    setModalOpen(false); setEditing(null)
  }

  async function handleDelete(id) {
    await dbDeleteClient(id)
    setClients(prev => prev.filter(c => c.id !== id))
    setSelected(null); setModalOpen(false); setEditing(null)
  }

  const filtered = clients.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.contact?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || c.status === filter
    return matchSearch && matchFilter
  })

  const totalValue = clients.filter(c => c.status === 'Active').reduce((s, c) => s + (Number(c.value) || 0), 0)

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--bg, #0a0c12)' }}>
      {/* Topbar */}
      <div style={{
        height:58, flexShrink:0, display:'flex', alignItems:'center', gap:12,
        padding:'0 26px', background:'rgba(8,10,16,0.95)',
        borderBottom:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(12px)',
      }}>
        <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:18, fontWeight:700, letterSpacing:'-0.02em', color:'#f2f4f8' }}>Clients</div>
        <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10.5, color:'#555e72', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:99, padding:'3px 10px' }}>
          {loading ? 'Loading…' : `${clients.filter(c => c.status==='Active').length} active · RM ${totalValue.toLocaleString()} /mo`}
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary" style={{ marginLeft:'auto', padding:'8px 16px', fontSize:13 }}>+ New Client</button>
      </div>
      <div style={{ padding:'16px 26px 8px', flexShrink:0, background:'rgba(8,10,16,0.6)' }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…" style={{ flex:1, minWidth:200, padding:'7px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.10)', background:'#12151f', fontSize:13, color:'#f2f4f8', outline:'none', fontFamily:'inherit' }} />
          {['All',...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ border:`1px solid ${filter===s?'#6366f1':'rgba(255,255,255,0.10)'}`, background:filter===s?'rgba(99,102,241,0.14)':'#12151f', color:filter===s?'#6366f1':'#8b93a7', borderRadius:99, padding:'4px 12px', fontSize:12, fontWeight:500, cursor:'pointer' }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 26px 28px', position:'relative' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:8, paddingRight:selected?352:0, transition:'padding-right 0.25s' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#555e72', fontSize:13 }}>
              {loading ? 'Loading from Supabase…' : search ? `No clients matching "${search}"` : 'No clients yet — add one above'}
            </div>
          ) : filtered.map(c => (
            <div key={c.id} onClick={() => setSelected(selected?.id===c.id ? null : c)} style={{ background:'#12151f', borderRadius:10, border:`1px solid ${selected?.id===c.id?'rgba(99,102,241,0.14)':'rgba(255,255,255,0.06)'}`, padding:'14px 18px', cursor:'pointer', transition:'all 0.14s', display:'flex', alignItems:'center', gap:16, boxShadow:selected?.id===c.id?'0 0 0 2px rgba(99,102,241,0.14)':'none' }}
              onMouseEnter={e => { if (selected?.id!==c.id) e.currentTarget.style.borderColor='rgba(26,20,16,0.14)' }}
              onMouseLeave={e => { if (selected?.id!==c.id) e.currentTarget.style.borderColor='rgba(255,255,255,0.06)' }}
            >
              <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#8b93a7' }}>{c.name?.charAt(0)}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'#f2f4f8', marginBottom:3 }}>{c.name}</div>
                <div style={{ fontSize:12, color:'#555e72' }}>{c.contact && <span>{c.contact} · </span>}{c.industry}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                {c.value > 0 && <div style={{ textAlign:'right' }}><div style={{ fontSize:14, fontWeight:600, color:'#f2f4f8', letterSpacing:'-0.02em' }}>RM {Number(c.value).toLocaleString()}</div><div style={{ fontSize:10, color:'#555e72' }}>per month</div></div>}
                <StatusBadge status={c.status} />
                <Avatar id={c.assignee} size={28} />
              </div>
            </div>
          ))}
        </div>
        {selected && <ClientDetail client={selected} onEdit={() => { setEditing(selected); setModalOpen(true) }} onClose={() => setSelected(null)} />}
      </div>

      {modalOpen && <ClientModal client={editing} onSave={handleSave} onDelete={handleDelete} onClose={() => { setModalOpen(false); setEditing(null) }} />}
      </div>
    </div>
  )
}
