import { useState } from 'react'

/* ── Default data ── */
const DEFAULT_COMPANY = {
  name: 'Your Company Sdn Bhd', reg: 'SSM-XXXXXXXX',
  address: 'Petaling Jaya, Selangor', email: 'hello@yourcompany.com',
  phone: '+60 1X-XXXXXXX', bank: '', accountNo: '',
}

const DEFAULT_MEMBERS = [
  { id: 'J', name: 'Jeevan', role: 'Founder / CTO', email: '', phone: '', active: true },
  { id: 'B', name: 'Barat',  role: 'Developer',     email: '', phone: '', active: true },
]

const DEFAULT_KEYWORDS = [
  { keyword: 'deploy',   member: 'J', reason: 'Deployment owned by CTO J' },
  { keyword: 'api',      member: 'J', reason: 'Technical owned by J' },
  { keyword: 'database', member: 'J', reason: 'Data infra owned by J' },
  { keyword: 'ai',       member: 'J', reason: 'AI systems owned by J' },
  { keyword: 'data',     member: 'B', reason: 'Data management owned by B' },
  { keyword: 'report',   member: 'B', reason: 'Reporting owned by B' },
  { keyword: 'analytics',member: 'B', reason: 'Analytics owned by B' },
  { keyword: 'document', member: 'B', reason: 'Document management owned by B' },
]

const TABS = [
  { id: 'company',  label: 'Company' },
  { id: 'members',  label: 'Members' },
  { id: 'keywords', label: 'Auto-Assign Keywords' },
  { id: 'roles',    label: 'Roles & Responsibilities' },
  { id: 'templates',label: 'Templates' },
]

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(14,2,4,0.12)',
  background: '#FEFCF6', fontSize: 13, color: '#0E0204', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
}
const labelStyle = { fontSize: 10.5, fontWeight: 600, color: '#6B4448', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }

/* ── Company Tab ── */
function CompanyTab() {
  const [form, setForm] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sd_company_v1')) || DEFAULT_COMPANY } catch { return DEFAULT_COMPANY }
  })
  const [saved, setSaved] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    try { localStorage.setItem('sd_company_v1', JSON.stringify(form)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <p style={{ fontSize: 13, color: '#A88285', marginTop: 0, marginBottom: 20 }}>
        Company info used in invoices, letters, and document headers.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {[
          { k: 'name', label: 'Company Name', col: '1/-1' },
          { k: 'reg', label: 'SSM / Registration No' },
          { k: 'email', label: 'Email' },
          { k: 'phone', label: 'Phone' },
          { k: 'address', label: 'Address', col: '1/-1' },
          { k: 'bank', label: 'Bank Name' },
          { k: 'accountNo', label: 'Account Number' },
        ].map(({ k, label, col }) => (
          <div key={k} style={{ gridColumn: col }}>
            <label style={labelStyle}>{label}</label>
            <input style={inputStyle} value={form[k] || ''} onChange={e => set(k, e.target.value)} />
          </div>
        ))}
      </div>
      <button onClick={handleSave} style={{
        background: saved ? '#16A34A' : '#5D0D18', color: '#FFF9EB', border: 'none',
        borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        transition: 'background 0.2s',
      }}>{saved ? '✓ Saved' : 'Save Company Info'}</button>
    </div>
  )
}

/* ── Members Tab ── */
function MembersTab() {
  const [members, setMembers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sd_members_v1')) || DEFAULT_MEMBERS } catch { return DEFAULT_MEMBERS }
  })
  const [saved, setSaved] = useState(false)

  function update(idx, k, v) {
    setMembers(m => m.map((x, i) => i === idx ? { ...x, [k]: v } : x))
  }

  function handleSave() {
    try { localStorage.setItem('sd_members_v1', JSON.stringify(members)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <p style={{ fontSize: 13, color: '#A88285', marginTop: 0, marginBottom: 20 }}>
        Team members used for task assignment and document ownership.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        {members.map((m, idx) => (
          <div key={m.id} style={{
            background: 'rgba(14,2,4,0.03)', borderRadius: 10, padding: '14px 16px',
            border: '1px solid rgba(14,2,4,0.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: m.id === 'J' ? '#8B1525' : '#3D8C74',
                color: '#fff', fontWeight: 700, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{m.id}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0E0204' }}>{m.name}</div>
              <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#A88285', cursor: 'pointer' }}>
                <input type="checkbox" checked={m.active} onChange={e => update(idx, 'active', e.target.checked)} />
                Active
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { k: 'role', label: 'Role' },
                { k: 'email', label: 'Email', type: 'email' },
                { k: 'phone', label: 'Phone' },
              ].map(({ k, label, type }) => (
                <div key={k}>
                  <label style={labelStyle}>{label}</label>
                  <input style={inputStyle} type={type || 'text'} value={m[k] || ''} onChange={e => update(idx, k, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSave} style={{
        background: saved ? '#16A34A' : '#5D0D18', color: '#FFF9EB', border: 'none',
        borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        transition: 'background 0.2s',
      }}>{saved ? '✓ Saved' : 'Save Members'}</button>
    </div>
  )
}

/* ── Keywords Tab ── */
function KeywordsTab() {
  const [keywords, setKeywords] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sd_keywords_v1')) || DEFAULT_KEYWORDS } catch { return DEFAULT_KEYWORDS }
  })
  const [saved, setSaved] = useState(false)
  const [newKw, setNewKw] = useState({ keyword: '', member: 'J', reason: '' })

  function addKeyword() {
    if (!newKw.keyword.trim()) return
    setKeywords(k => [...k, { ...newKw }])
    setNewKw({ keyword: '', member: 'J', reason: '' })
  }

  function removeKeyword(idx) { setKeywords(k => k.filter((_, i) => i !== idx)) }

  function handleSave() {
    try { localStorage.setItem('sd_keywords_v1', JSON.stringify(keywords)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const MEMBER_COLORS = { J: '#8B1525', B: '#3D8C74' }

  return (
    <div style={{ maxWidth: 600 }}>
      <p style={{ fontSize: 13, color: '#A88285', marginTop: 0, marginBottom: 16 }}>
        When a task title contains a keyword, it auto-assigns to the mapped member.
      </p>

      {/* Add row */}
      <div style={{ display: 'grid', gridTemplateColumns: '150px 80px 1fr 36px', gap: 8, marginBottom: 16, alignItems: 'end' }}>
        <div>
          <label style={labelStyle}>Keyword</label>
          <input style={inputStyle} placeholder="e.g. deploy" value={newKw.keyword} onChange={e => setNewKw(k => ({ ...k, keyword: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addKeyword()} />
        </div>
        <div>
          <label style={labelStyle}>Assign To</label>
          <select style={inputStyle} value={newKw.member} onChange={e => setNewKw(k => ({ ...k, member: e.target.value }))}>
            <option value="J">Jeevan</option>
            <option value="B">Barat</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Reason</label>
          <input style={inputStyle} placeholder="Why this person?" value={newKw.reason} onChange={e => setNewKw(k => ({ ...k, reason: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addKeyword()} />
        </div>
        <button onClick={addKeyword} style={{
          background: '#5D0D18', color: '#FFF9EB', border: 'none', borderRadius: 8,
          padding: '8px', fontSize: 18, cursor: 'pointer', height: 38,
        }}>+</button>
      </div>

      {/* Keyword list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
        {keywords.map((kw, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(14,2,4,0.02)', border: '1px solid rgba(14,2,4,0.05)',
          }}>
            <code style={{ fontSize: 12, fontWeight: 600, color: '#0E0204', background: 'rgba(14,2,4,0.06)', padding: '2px 8px', borderRadius: 4, minWidth: 80 }}>{kw.keyword}</code>
            <span style={{ fontSize: 12, fontWeight: 700, color: MEMBER_COLORS[kw.member] || '#A88285', width: 60 }}>{kw.member === 'J' ? 'Jeevan' : 'Barat'}</span>
            <span style={{ fontSize: 11, color: '#A88285', flex: 1 }}>{kw.reason}</span>
            <button onClick={() => removeKeyword(idx)} style={{
              border: 'none', background: 'transparent', color: '#C4AEAE', cursor: 'pointer', fontSize: 15, padding: '0 2px',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
              onMouseLeave={e => e.currentTarget.style.color = '#C4AEAE'}
            >×</button>
          </div>
        ))}
      </div>

      <button onClick={handleSave} style={{
        background: saved ? '#16A34A' : '#5D0D18', color: '#FFF9EB', border: 'none',
        borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        transition: 'background 0.2s',
      }}>{saved ? '✓ Saved' : 'Save Keywords'}</button>
    </div>
  )
}

/* ── Roles Tab ── */
function RolesTab() {
  const [roles, setRoles] = useState([
    { member: 'J', name: 'Jeevan', responsibilities: 'Product, engineering, deployments, AI systems, CI/CD' },
    { member: 'B', name: 'Barat', responsibilities: 'Data, analytics, reporting, compliance, documentation' },
  ])
  const [saved, setSaved] = useState(false)

  function update(idx, v) { setRoles(r => r.map((x, i) => i === idx ? { ...x, responsibilities: v } : x)) }

  function handleSave() {
    try { localStorage.setItem('sd_roles_v1', JSON.stringify(roles)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <p style={{ fontSize: 13, color: '#A88285', marginTop: 0, marginBottom: 20 }}>
        Define what each person owns. Used to improve auto-assignment accuracy.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        {roles.map((r, idx) => (
          <div key={r.member} style={{ background: 'rgba(14,2,4,0.03)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(14,2,4,0.07)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0E0204', marginBottom: 8 }}>{r.name}</div>
            <label style={labelStyle}>Responsibilities (comma-separated keywords)</label>
            <textarea
              value={r.responsibilities}
              onChange={e => update(idx, e.target.value)}
              style={{ ...inputStyle, height: 72, resize: 'vertical' }}
              placeholder="e.g. code, deploy, api, security, infrastructure"
            />
          </div>
        ))}
      </div>
      <button onClick={handleSave} style={{
        background: saved ? '#16A34A' : '#5D0D18', color: '#FFF9EB', border: 'none',
        borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        transition: 'background 0.2s',
      }}>{saved ? '✓ Saved' : 'Save Roles'}</button>
    </div>
  )
}

/* ── Templates Tab ── */
function TemplatesTab() {
  const DEFAULT_TEMPLATES = {
    invoiceNotes: 'Payment due within 30 days. Bank transfer to:\nBank: Maybank\nAccount: XXXX-XXXX-XXXX\nRef: Invoice number',
    followUp: 'Hi [Name],\n\nThis is a friendly reminder about Invoice [INV-No] amounting to RM [Amount] which was due on [Date].\n\nPlease let us know if you have any questions.\n\nBest regards,\n[Your Name]',
    proposal: 'Dear [Name],\n\nThank you for the opportunity to propose our services. We would like to present the following scope of work...',
  }

  const [templates, setTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sd_templates_v1')) || DEFAULT_TEMPLATES } catch { return DEFAULT_TEMPLATES }
  })
  const [saved, setSaved] = useState(false)
  const set = (k, v) => setTemplates(t => ({ ...t, [k]: v }))

  function handleSave() {
    try { localStorage.setItem('sd_templates_v1', JSON.stringify(templates)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <p style={{ fontSize: 13, color: '#A88285', marginTop: 0, marginBottom: 20 }}>
        Reusable text templates for invoices, follow-ups, and proposals.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        {[
          { k: 'invoiceNotes', label: 'Invoice Payment Notes' },
          { k: 'followUp',     label: 'Payment Follow-Up Email' },
          { k: 'proposal',     label: 'Proposal Opening' },
        ].map(({ k, label }) => (
          <div key={k}>
            <label style={labelStyle}>{label}</label>
            <textarea
              value={templates[k] || ''}
              onChange={e => set(k, e.target.value)}
              style={{ ...inputStyle, height: 100, resize: 'vertical' }}
            />
          </div>
        ))}
      </div>
      <button onClick={handleSave} style={{
        background: saved ? '#16A34A' : '#5D0D18', color: '#FFF9EB', border: 'none',
        borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        transition: 'background 0.2s',
      }}>{saved ? '✓ Saved' : 'Save Templates'}</button>
    </div>
  )
}

/* ── Main Backend page ── */
export default function Backend() {
  const [active, setActive] = useState('company')

  const tabContent = {
    company:   <CompanyTab />,
    members:   <MembersTab />,
    keywords:  <KeywordsTab />,
    roles:     <RolesTab />,
    templates: <TemplatesTab />,
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg, #F0E8D3)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '24px 28px 0', flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0E0204', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#A88285', margin: '0 0 20px' }}>Configure your workspace, team, and automation rules</p>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(14,2,4,0.10)', marginBottom: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActive(tab.id)} style={{
              border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, fontWeight: active === tab.id ? 600 : 400,
              color: active === tab.id ? '#0E0204' : '#A88285',
              padding: '8px 14px',
              borderBottom: `2px solid ${active === tab.id ? '#5D0D18' : 'transparent'}`,
              marginBottom: -1,
              transition: 'color 0.12s',
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {tabContent[active]}
      </div>
    </div>
  )
}
