import { useState, useEffect } from 'react'
import { fetchInvoices, insertInvoice, updateInvoiceStatus, deleteInvoice as dbDeleteInvoice } from '../lib/db.js'

function genId() { return `doc_${Date.now()}_${Math.random().toString(36).slice(2,7)}` }
function invNo(count) { return `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}` }

const DOC_TYPES = [
  { id:'inv', name:'Invoice',         icon:'🧾' },
  { id:'quo', name:'Quotation',       icon:'📋' },
  { id:'do',  name:'Delivery Order',  icon:'📦' },
  { id:'rec', name:'Receipt',         icon:'🏷️' },
  { id:'let', name:'Official Letter', icon:'✉️' },
  { id:'mou', name:'MoU / Agreement', icon:'🤝' },
  { id:'min', name:'Meeting Minutes', icon:'📝' },
  { id:'sow', name:'Scope of Work',   icon:'🔧' },
  { id:'nda', name:'NDA',             icon:'🔒' },
]

const STATUS_COLORS = { Draft:'#D97706', Sent:'#2563EB', Paid:'#16A34A', Cancelled:'#DC2626' }

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || '#A88285'
  return <span style={{ fontSize:10.5, fontWeight:600, color:c, background:`${c}14`, borderRadius:99, padding:'2px 8px', border:`1px solid ${c}28` }}>{status}</span>
}

function InvoiceBuilder({ onSave, onClose, count }) {
  const [form, setForm] = useState({
    number: invNo(count), client:'', contact:'', email:'',
    date: new Date().toISOString().split('T')[0], due:'',
    items: [{ id: genId(), desc:'', qty:1, rate:0 }],
    notes:'', tax:6,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function addItem() { set('items', [...form.items, { id: genId(), desc:'', qty:1, rate:0 }]) }
  function removeItem(id) { if (form.items.length > 1) set('items', form.items.filter(i => i.id !== id)) }
  function setItem(id, k, v) { set('items', form.items.map(i => i.id === id ? { ...i, [k]: k==='qty'||k==='rate' ? parseFloat(v)||0 : v } : i)) }

  const subtotal = form.items.reduce((s, i) => s + (i.qty * i.rate), 0)
  const taxAmt   = subtotal * (form.tax / 100)
  const total    = subtotal + taxAmt

  const inp = { width:'100%', padding:'7px 10px', borderRadius:7, border:'1px solid rgba(14,2,4,0.12)', background:'#FEFCF6', fontSize:13, color:'#0E0204', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(14,2,4,0.40)', backdropFilter:'blur(3px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#FFFFFF', borderRadius:14, width:'100%', maxWidth:640, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(14,2,4,0.20)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(14,2,4,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div><h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#0E0204' }}>New Invoice</h3><div style={{ fontSize:12, color:'#A88285', marginTop:2 }}>{form.number}</div></div>
          <button onClick={onClose} style={{ border:'none', background:'transparent', fontSize:20, cursor:'pointer', color:'#A88285' }}>×</button>
        </div>
        <div style={{ padding:'20px 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
            <div style={{ gridColumn:'1/-1' }}><label style={{ fontSize:10.5, fontWeight:600, color:'#6B4448', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:4 }}>Bill To</label><input style={inp} placeholder="Company name" value={form.client} onChange={e => set('client', e.target.value)} /></div>
            <input style={inp} placeholder="Contact person" value={form.contact} onChange={e => set('contact', e.target.value)} />
            <input style={inp} placeholder="email@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
            <div><label style={{ fontSize:10.5, fontWeight:600, color:'#6B4448', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:4 }}>Invoice Date</label><input style={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
            <div><label style={{ fontSize:10.5, fontWeight:600, color:'#6B4448', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:4 }}>Due Date</label><input style={inp} type="date" value={form.due} onChange={e => set('due', e.target.value)} /></div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 70px 90px 80px 28px', gap:6, marginBottom:6 }}>
              {['Description','Qty','Rate (RM)','Amount',''].map(h => <div key={h} style={{ fontSize:10, fontWeight:600, color:'#A88285', textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</div>)}
            </div>
            {form.items.map(item => (
              <div key={item.id} style={{ display:'grid', gridTemplateColumns:'1fr 70px 90px 80px 28px', gap:6, marginBottom:6 }}>
                <input style={inp} placeholder="Item description" value={item.desc} onChange={e => setItem(item.id,'desc',e.target.value)} />
                <input style={inp} type="number" min="1" value={item.qty} onChange={e => setItem(item.id,'qty',e.target.value)} />
                <input style={inp} type="number" min="0" step="0.01" value={item.rate} onChange={e => setItem(item.id,'rate',e.target.value)} />
                <div style={{ display:'flex', alignItems:'center', fontSize:13, fontWeight:600, color:'#0E0204', paddingLeft:4 }}>RM {(item.qty*item.rate).toFixed(2)}</div>
                <button onClick={() => removeItem(item.id)} style={{ border:'none', background:'transparent', color:'#C4AEAE', cursor:'pointer', fontSize:16, padding:0 }} onMouseEnter={e=>e.currentTarget.style.color='#DC2626'} onMouseLeave={e=>e.currentTarget.style.color='#C4AEAE'}>×</button>
              </div>
            ))}
            <button onClick={addItem} style={{ border:'1px dashed rgba(14,2,4,0.15)', background:'transparent', color:'#6B4448', borderRadius:7, padding:'6px 12px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>+ Add Line Item</button>
          </div>

          <div style={{ background:'rgba(14,2,4,0.03)', borderRadius:8, padding:'12px 14px', marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ fontSize:12, color:'#A88285' }}>Subtotal</span><span style={{ fontSize:13, fontWeight:600, color:'#0E0204' }}>RM {subtotal.toFixed(2)}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, alignItems:'center' }}>
              <span style={{ fontSize:12, color:'#A88285', display:'flex', alignItems:'center', gap:6 }}>SST/Tax <input type="number" min="0" max="100" value={form.tax} onChange={e=>set('tax',parseFloat(e.target.value)||0)} style={{ width:44, padding:'2px 6px', borderRadius:5, border:'1px solid rgba(14,2,4,0.12)', background:'#fff', fontSize:12, fontFamily:'inherit', outline:'none' }} />%</span>
              <span style={{ fontSize:13, fontWeight:600, color:'#0E0204' }}>RM {taxAmt.toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid rgba(14,2,4,0.07)', paddingTop:8 }}>
              <span style={{ fontSize:14, fontWeight:700, color:'#0E0204' }}>Total</span>
              <span style={{ fontSize:16, fontWeight:700, color:'#5D0D18', letterSpacing:'-0.02em' }}>RM {total.toFixed(2)}</span>
            </div>
          </div>

          <textarea placeholder="Payment notes, bank details, terms…" value={form.notes} onChange={e => set('notes', e.target.value)} style={{ ...inp, height:64, resize:'vertical', marginBottom:16 }} />

          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button onClick={onClose} style={{ border:'1px solid rgba(14,2,4,0.12)', background:'transparent', color:'#6B4448', borderRadius:8, padding:'8px 16px', fontSize:13, cursor:'pointer' }}>Cancel</button>
            <button onClick={() => onSave({
                id: genId(),
                number: form.number,
                client: form.client,
                contact: form.contact,
                email: form.email,
                inv_date: form.date || null,
                due_date: form.due || null,
                items: form.items,
                notes: form.notes,
                subtotal,
                tax_pct: form.tax,
                tax_amt: taxAmt,
                total,
                status: 'Draft',
                created_at: new Date().toISOString(),
              })} style={{ background:'#5D0D18', color:'#FFF9EB', border:'none', borderRadius:8, padding:'8px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Save as Draft</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Docs() {
  const [invoices, setInvoices]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [creating, setCreating]   = useState(false)
  const [activeType, setActiveType] = useState('inv')

  useEffect(() => {
    fetchInvoices().then(data => { setInvoices(data || []); setLoading(false) })
  }, [])

  async function saveInvoice(data) {
    const saved = await insertInvoice(data)
    if (saved) setInvoices(prev => [saved, ...prev])
    setCreating(false)
  }

  async function handleSetStatus(id, status) {
    await updateInvoiceStatus(id, status)
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  async function handleDelete(id) {
    await dbDeleteInvoice(id)
    setInvoices(prev => prev.filter(i => i.id !== id))
  }

  const totalPaid    = invoices.filter(i => i.status==='Paid').reduce((s, i) => s + (i.total||0), 0)
  const totalPending = invoices.filter(i => ['Draft','Sent'].includes(i.status)).reduce((s, i) => s + (i.total||0), 0)

  return (
    <div style={{ flex:1, overflowY:'auto', background:'var(--bg, #F0E8D3)', padding:'24px 28px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0E0204', letterSpacing:'-0.03em', margin:0 }}>Docs</h1>
          <p style={{ fontSize:13, color:'#A88285', margin:'4px 0 0' }}>
            {loading ? 'Loading…' : `RM ${totalPaid.toLocaleString()} collected · RM ${totalPending.toLocaleString()} pending`}
          </p>
        </div>
        <button onClick={() => setCreating(true)} style={{ background:'#5D0D18', color:'#FFF9EB', border:'none', borderRadius:8, padding:'9px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>+ New Invoice</button>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {DOC_TYPES.map(dt => (
          <button key={dt.id} onClick={() => setActiveType(dt.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:`1px solid ${activeType===dt.id?'rgba(93,13,24,0.25)':'rgba(14,2,4,0.10)'}`, background:activeType===dt.id?'rgba(93,13,24,0.06)':'#FEFCF6', color:activeType===dt.id?'#5D0D18':'#6B4448', fontSize:12.5, fontWeight:activeType===dt.id?600:400, cursor:'pointer' }}>
            <span>{dt.icon}</span>{dt.name}
          </button>
        ))}
      </div>

      {activeType === 'inv' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#A88285', fontSize:13 }}>Loading from Supabase…</div>
          ) : invoices.length === 0 ? (
            <div style={{ background:'#FEFCF6', borderRadius:12, padding:'48px', textAlign:'center', border:'1px dashed rgba(14,2,4,0.12)' }}>
              <div style={{ fontSize:28, marginBottom:10 }}>🧾</div>
              <div style={{ fontSize:14, fontWeight:600, color:'#6B4448', marginBottom:4 }}>No invoices yet</div>
              <div style={{ fontSize:12, color:'#A88285' }}>Create your first invoice to track payments</div>
            </div>
          ) : invoices.map(inv => (
            <div key={inv.id} style={{ background:'#FEFCF6', borderRadius:10, padding:'14px 18px', border:'1px solid rgba(14,2,4,0.07)', display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:36, height:36, borderRadius:8, background:'rgba(14,2,4,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🧾</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'#0E0204', marginBottom:2 }}>{inv.number}</div>
                <div style={{ fontSize:12, color:'#A88285' }}>{inv.client || 'No client'} · {new Date(inv.created_at).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'})}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#0E0204', letterSpacing:'-0.02em' }}>RM {Number(inv.total||0).toFixed(2)}</div>
                {inv.due_date && <div style={{ fontSize:10, color:'#A88285' }}>Due {new Date(inv.due_date).toLocaleDateString('en-MY',{day:'numeric',month:'short'})}</div>}
              </div>
              <StatusBadge status={inv.status||'Draft'} />
              <div style={{ display:'flex', gap:4 }}>
                {inv.status==='Draft' && <button onClick={() => handleSetStatus(inv.id,'Sent')} style={{ border:'1px solid rgba(37,99,235,0.25)', background:'rgba(37,99,235,0.06)', color:'#2563EB', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:600, cursor:'pointer' }}>Mark Sent</button>}
                {inv.status==='Sent'  && <button onClick={() => handleSetStatus(inv.id,'Paid')} style={{ border:'1px solid rgba(22,163,74,0.25)', background:'rgba(22,163,74,0.06)', color:'#16A34A', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:600, cursor:'pointer' }}>Mark Paid</button>}
                <button onClick={() => handleDelete(inv.id)} style={{ border:'none', background:'transparent', color:'#C4AEAE', cursor:'pointer', fontSize:16, padding:'0 4px' }} onMouseEnter={e=>e.currentTarget.style.color='#DC2626'} onMouseLeave={e=>e.currentTarget.style.color='#C4AEAE'}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeType !== 'inv' && (
        <div style={{ background:'#FEFCF6', borderRadius:12, padding:'48px', textAlign:'center', border:'1px dashed rgba(14,2,4,0.12)' }}>
          <div style={{ fontSize:28, marginBottom:10 }}>{DOC_TYPES.find(d=>d.id===activeType)?.icon}</div>
          <div style={{ fontSize:14, fontWeight:600, color:'#6B4448', marginBottom:4 }}>{DOC_TYPES.find(d=>d.id===activeType)?.name} builder</div>
          <div style={{ fontSize:12, color:'#A88285' }}>Coming soon — use Invoice builder as template</div>
        </div>
      )}

      {creating && <InvoiceBuilder count={invoices.length} onSave={saveInvoice} onClose={() => setCreating(false)} />}
    </div>
  )
}
