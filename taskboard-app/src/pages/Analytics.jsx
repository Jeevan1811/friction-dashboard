import { useState, useCallback, useEffect } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { fetchKpi, insertKpi, deleteKpi } from '../lib/db.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

/* ── SHS Formula ── */
function calcRE(actual, target)  { return Math.min(100, Math.round((actual / Math.max(target,1)) * 100)) }
function calcDS(score)           { return Math.min(100, Math.round(score)) }
function calcOE(newVal, oldVal)  { return Math.min(100, Math.round((newVal / Math.max(oldVal,1)) * 100)) }
function calcAI(newVal, oldVal)  { return Math.min(100, Math.round((newVal / Math.max(oldVal,1)) * 100)) }
function calcSHS(re, ds, oe, ai) { return Math.round(re*0.30 + ds*0.25 + oe*0.25 + ai*0.20) }

function shsZone(score) {
  if (score >= 86) return { label:'Scaling',     color:'#16A34A', bg:'rgba(22,163,74,0.10)' }
  if (score >= 66) return { label:'Growing',     color:'#2563EB', bg:'rgba(37,99,235,0.10)' }
  if (score >= 41) return { label:'Stabilising', color:'#D97706', bg:'rgba(217,119,6,0.10)' }
  return               { label:'Critical',     color:'#DC2626', bg:'rgba(220,38,38,0.10)' }
}

const ZONES = [
  { min:86, max:100, color:'rgba(22,163,74,0.06)' },
  { min:66, max:86,  color:'rgba(37,99,235,0.06)' },
  { min:41, max:66,  color:'rgba(217,119,6,0.06)' },
  { min:0,  max:41,  color:'rgba(220,38,38,0.06)' },
]

const zonePlugin = {
  id: 'zones',
  beforeDraw(chart) {
    const { ctx, chartArea: { left, right }, scales: { y } } = chart
    ZONES.forEach(z => {
      ctx.fillStyle = z.color
      ctx.fillRect(left, y.getPixelForValue(z.max), right - left, y.getPixelForValue(z.min) - y.getPixelForValue(z.max))
    })
  }
}

const BASE_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#0E0908', titleColor: '#FFF9EB', bodyColor: '#A88285', padding: 10, cornerRadius: 8 },
  },
  scales: {
    x: { grid: { color: 'rgba(14,2,4,0.06)' }, ticks: { color: '#A88285', font: { size: 10 } } },
    y: { min: 0, max: 100, grid: { color: 'rgba(14,2,4,0.06)' }, ticks: { color: '#A88285', font: { size: 10 } } },
  },
}

function mkDataset(data, color, label) {
  return {
    label, data, borderColor: color,
    backgroundColor: color.replace('rgb(', 'rgba(').replace(')', ',0.08)'),
    borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: color, fill: true, tension: 0.35,
  }
}

function KpiInput({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 10.5, fontWeight: 600, color: '#6B4448', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder="0"
        style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid rgba(14,2,4,0.12)', background: '#FEFCF6', fontSize: 13, color: '#0E0204', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
    </div>
  )
}

function ScoreCard({ label, value, color }) {
  return (
    <div style={{ background: '#FEFCF6', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(14,2,4,0.07)', borderTop: `2px solid ${color}` }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: '#A88285', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 300, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value ?? '—'}</div>
    </div>
  )
}

function ChartCard({ title, datasets, labels, height = 160 }) {
  const empty = !labels || labels.length === 0
  return (
    <div style={{ background: '#FEFCF6', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(14,2,4,0.07)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6B4448', marginBottom: 12 }}>{title}</div>
      <div style={{ height }}>
        {empty ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4AEAE', fontSize: 12 }}>
            No data yet — log a KPI period below
          </div>
        ) : (
          <Line data={{ labels, datasets }} options={BASE_OPTS} plugins={[zonePlugin]} />
        )}
      </div>
    </div>
  )
}

export default function Analytics() {
  const [kpiLog, setKpiLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    revActual: '', revTarget: '', ds: '',
    oeNew: '', oeOld: '', aiNew: '', aiOld: '',
    scoreJ: '', scoreB: '',
  })

  useEffect(() => {
    fetchKpi().then(data => { setKpiLog(data || []); setLoading(false) })
  }, [])

  const setField = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), [])

  async function addEntry() {
    const g = k => parseFloat(form[k]) || 0
    const re   = calcRE(g('revActual'), g('revTarget') || 1)
    const ds   = calcDS(g('ds') || 1)
    const oe   = calcOE(g('oeNew'), g('oeOld') || 1)
    const ai   = calcAI(g('aiNew'), g('aiOld') || 1)
    const shs  = calcSHS(re, ds, oe, ai)
    const jS   = g('scoreJ'), bS = g('scoreB')
    const team = Math.round((jS + bS) / 2)

    const entry = {
      id: `kpi_${Date.now()}`,
      date: new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }),
      ts: new Date().toISOString(),
      shs, re: Math.round(re), ds: Math.round(ds), oe: Math.round(oe), ai: Math.round(ai),
      j: Math.round(jS), b: Math.round(bS), team,
    }

    const saved = await insertKpi(entry)
    if (saved) setKpiLog(prev => [...prev, saved])
    setForm({ revActual:'', revTarget:'', ds:'', oeNew:'', oeOld:'', aiNew:'', aiOld:'', scoreJ:'', scoreB:'' })
  }

  async function handleDelete(id) {
    await deleteKpi(id)
    setKpiLog(prev => prev.filter(e => e.id !== id))
  }

  const last   = kpiLog.length ? kpiLog[kpiLog.length - 1] : null
  const zone   = last ? shsZone(last.shs) : null
  const labels = kpiLog.map(e => e.date)

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg, #F0E8D3)', padding: '24px 28px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0E0204', letterSpacing: '-0.03em', margin: 0 }}>Analytics</h1>
        <p style={{ fontSize: 13, color: '#A88285', margin: '4px 0 0' }}>
          {loading ? 'Loading from Supabase…' : `Startup Health Score · ${kpiLog.length} periods logged`}
        </p>
      </div>

      {/* SHS Hero */}
      <div style={{ background: '#FEFCF6', borderRadius: 12, padding: '20px 24px', border: '1px solid rgba(14,2,4,0.07)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', margin: '0 auto 10px', border: `4px solid ${zone?.color || 'rgba(14,2,4,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.4s' }}>
            <span style={{ fontSize: 30, fontWeight: 300, color: zone?.color || '#A88285', letterSpacing: '-0.03em' }}>{last?.shs ?? '—'}</span>
          </div>
          {zone && <span style={{ fontSize: 11, fontWeight: 600, color: zone.color, background: zone.bg, borderRadius: 99, padding: '3px 10px' }}>{zone.label}</span>}
          <div style={{ fontSize: 10, color: '#A88285', marginTop: 6 }}>Startup Health Score</div>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
          <ScoreCard label="Revenue Engine" value={last?.re}   color="#8B1525" />
          <ScoreCard label="Decision Speed" value={last?.ds}   color="#2563EB" />
          <ScoreCard label="Output Engine"  value={last?.oe}   color="#D97706" />
          <ScoreCard label="Adaptability"   value={last?.ai}   color="#16A34A" />
          <ScoreCard label="Jeevan"         value={last?.j}    color="#8B1525" />
          <ScoreCard label="Barat"          value={last?.b}    color="#3D8C74" />
          <ScoreCard label="Team Avg"       value={last?.team} color="#6B4448" />
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <ChartCard title="SHS Trend" height={200} labels={labels} datasets={[mkDataset(kpiLog.map(e => e.shs), 'rgb(37,99,235)', 'SHS')]} />
        <ChartCard title="Revenue Engine" labels={labels} datasets={[mkDataset(kpiLog.map(e => e.re), 'rgb(139,21,37)', 'RE')]} />
        <ChartCard title="Jeevan vs Barat" labels={labels}
          datasets={[
            mkDataset(kpiLog.map(e => e.j), 'rgb(139,21,37)', 'Jeevan'),
            mkDataset(kpiLog.map(e => e.b), 'rgb(61,140,116)', 'Barat'),
          ]}
        />
        <ChartCard title="Team Score" labels={labels} datasets={[mkDataset(kpiLog.map(e => e.team), 'rgb(22,163,74)', 'Team')]} />
      </div>

      {/* Entry form */}
      <div style={{ background: '#FEFCF6', borderRadius: 12, padding: '20px 24px', border: '1px solid rgba(14,2,4,0.07)', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0E0204', marginBottom: 16 }}>Log KPI Period</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
          <KpiInput label="Revenue Actual (RM)" value={form.revActual} onChange={v => setField('revActual', v)} />
          <KpiInput label="Revenue Target (RM)" value={form.revTarget} onChange={v => setField('revTarget', v)} />
          <KpiInput label="Decision Score (1-100)" value={form.ds} onChange={v => setField('ds', v)} />
          <KpiInput label="Output New" value={form.oeNew} onChange={v => setField('oeNew', v)} />
          <KpiInput label="Output Old / Target" value={form.oeOld} onChange={v => setField('oeOld', v)} />
          <KpiInput label="Adapt New" value={form.aiNew} onChange={v => setField('aiNew', v)} />
          <KpiInput label="Adapt Old / Target" value={form.aiOld} onChange={v => setField('aiOld', v)} />
          <KpiInput label="Jeevan Score (0-100)" value={form.scoreJ} onChange={v => setField('scoreJ', v)} />
          <KpiInput label="Barat Score (0-100)" value={form.scoreB} onChange={v => setField('scoreB', v)} />
        </div>
        <button onClick={addEntry} style={{ background: '#5D0D18', color: '#FFF9EB', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background='#7A1020'}
          onMouseLeave={e => e.currentTarget.style.background='#5D0D18'}
        >Record Period</button>
      </div>

      {/* History */}
      {kpiLog.length > 0 && (
        <div style={{ background: '#FEFCF6', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(14,2,4,0.07)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0E0204', marginBottom: 12 }}>History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...kpiLog].reverse().map(e => {
              const z = shsZone(e.shs)
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '8px 12px', borderRadius: 8, background: 'rgba(14,2,4,0.02)', border: '1px solid rgba(14,2,4,0.05)' }}>
                  <span style={{ fontSize: 11, color: '#A88285', width: 70, flexShrink: 0 }}>{e.date}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: z.color, width: 60 }}>SHS {e.shs}</span>
                  <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#A88285', flexWrap: 'wrap' }}>
                    <span>RE {e.re}</span><span>DS {e.ds}</span><span>OE {e.oe}</span><span>AI {e.ai}</span>
                    <span style={{ color:'#8B1525' }}>J {e.j}</span>
                    <span style={{ color:'#3D8C74' }}>B {e.b}</span>
                  </div>
                  <button onClick={() => handleDelete(e.id)} style={{ marginLeft:'auto', border:'none', background:'transparent', color:'#C4AEAE', cursor:'pointer', fontSize:14 }}
                    onMouseEnter={ev => ev.currentTarget.style.color='#DC2626'}
                    onMouseLeave={ev => ev.currentTarget.style.color='#C4AEAE'}
                  >×</button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
