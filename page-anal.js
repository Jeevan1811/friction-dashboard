/* ═══════════════════════════════════════════
   PAGE-ANAL.JS — KPI Analytics
   SHS master formula, 4 individual charts
═══════════════════════════════════════════ */

let chartMaster=null, chartM=null, chartJ=null, chartB=null, chartTeam=null;

function renderAnal(){
  const kpiData = DB.get(SK.kpi)||[];
  updateSHSHero(kpiData);
  renderAnalCharts(kpiData);
  renderKPILog(kpiData);
}

function updateSHSHero(kpiData){
  const ring=document.getElementById('shs-ring');
  const num=document.getElementById('shs-num');
  const zone=document.getElementById('shs-zone-label');
  if(!ring||!num) return;
  if(kpiData.length){
    const last=kpiData[kpiData.length-1];
    const z=shsZone(last.shs);
    ring.style.borderColor=z.color;
    num.textContent=last.shs; num.style.color=z.color;
    if(zone){zone.textContent=z.label;zone.style.background=z.bg;zone.style.color=z.color;}
    const ids=['score-m','score-j','score-b','score-team'];
    const vals=[last.m,last.j,last.b,last.team];
    ids.forEach((id,i)=>{ const el=document.getElementById(id); if(el) el.textContent=vals[i]??'—'; });
  } else {
    num.textContent='—';
    if(zone) zone.textContent='No data yet';
  }
}

const ANAL_ZONES=[
  {min:86,max:100,color:'rgba(26,122,60,0.07)'},
  {min:66,max:86, color:'rgba(26,95,168,0.07)'},
  {min:41,max:66, color:'rgba(183,119,13,0.07)'},
  {min:0, max:41, color:'rgba(192,57,43,0.07)'},
];

const zonePlugin={id:'zones',beforeDraw(chart){
  const{ctx,chartArea:{left,right,top,bottom},scales:{y}}=chart;
  ANAL_ZONES.forEach(z=>{
    const yT=y.getPixelForValue(z.max),yB=y.getPixelForValue(z.min);
    ctx.fillStyle=z.color; ctx.fillRect(left,yT,right-left,yB-yT);
  });
}};

const BASE_OPTS={
  responsive:true,maintainAspectRatio:false,
  plugins:{legend:{display:false},tooltip:{backgroundColor:'#1a1a1a',titleColor:'#f5f0e8',bodyColor:'#aaa',padding:10,cornerRadius:6}},
  scales:{
    x:{grid:{color:'rgba(0,0,0,0.05)'},ticks:{color:'#6b6357',font:{family:'DM Mono',size:10}}},
    y:{min:0,max:100,grid:{color:'rgba(0,0,0,0.05)'},ticks:{color:'#6b6357',font:{family:'DM Mono',size:10}}},
  }
};

function mkDataset(data,color,label){
  return{label,data,borderColor:color,
    backgroundColor:color.replace('rgb(','rgba(').replace(')',',0.10)'),
    borderWidth:2.5,pointRadius:4,pointBackgroundColor:color,fill:true,tension:0.35};
}

function renderAnalCharts(kpiData){
  const labels=kpiData.map(e=>e.date);
  const empty=kpiData.length===0;
  const safeLabels=empty?['No data']:labels;

  function mk(canvasId, dataKey, color, existing){
    if(existing){existing.destroy();existing=null;}
    const ctx=document.getElementById(canvasId); if(!ctx) return null;
    const data=kpiData.map(e=>e[dataKey]);
    return new Chart(ctx,{
      type:'line',
      data:{labels:safeLabels,datasets:[mkDataset(empty?[null]:data,color,dataKey)]},
      options:BASE_OPTS,plugins:[zonePlugin]
    });
  }

  if(chartMaster){chartMaster.destroy();chartMaster=null;}
  const ctxM=document.getElementById('chart-master');
  if(ctxM){
    chartMaster=new Chart(ctxM,{
      type:'line',
      data:{labels:safeLabels,datasets:[mkDataset(empty?[null]:kpiData.map(e=>e.shs),'rgb(26,95,168)','SHS')]},
      options:{...BASE_OPTS,plugins:{...BASE_OPTS.plugins,tooltip:{...BASE_OPTS.plugins.tooltip,
        callbacks:{label:c=>`SHS: ${c.parsed.y} — ${shsZone(c.parsed.y).label}`}
      }}},
      plugins:[zonePlugin]
    });
  }

  chartM    = mk('chart-m',   'm',    'rgb(109,63,192)', chartM);
  chartJ    = mk('chart-j',   'j',    'rgb(14,111,168)', chartJ);
  chartB    = mk('chart-b',   'b',    'rgb(184,79,16)',  chartB);
  chartTeam = mk('chart-team','team', 'rgb(26,122,60)',  chartTeam);
}

function analAddEntry(){
  const g=id=>parseFloat(document.getElementById(id)?.value)||0;
  const revA=g('inp-rev-actual'), revT=g('inp-rev-target')||1;
  const ds  =g('inp-ds')||1;
  const oeN =g('inp-oe-new'), oeO=g('inp-oe-old')||1;
  const aiN =g('inp-ai-new'), aiO=g('inp-ai-old')||1;
  const mS  =g('inp-m'), jS=g('inp-j'), bS=g('inp-b');

  const re=calcRE(revA,revT), dsS=calcDS(ds), oe=calcOE(oeN,oeO), ai=calcAI(aiN,aiO);
  const shs=calcSHS(re,dsS,oe,ai);
  const team=Math.round((mS+jS+bS)/3);

  const entry={
    id:genId('kpi'),
    date:new Date().toLocaleDateString('en-MY',{day:'numeric',month:'short'}),
    ts:isoNow(), shs,
    re:Math.round(re), ds:Math.round(dsS), oe:Math.round(oe), ai:Math.round(ai),
    m:Math.round(mS), j:Math.round(jS), b:Math.round(bS), team,
  };

  const kpiData = DB.get(SK.kpi)||[];
  kpiData.push(entry);
  DB.set(SK.kpi,kpiData);

  ['inp-rev-actual','inp-rev-target','inp-ds','inp-oe-new','inp-oe-old','inp-ai-new','inp-ai-old','inp-m','inp-j','inp-b']
    .forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });

  renderAnal();
  toast(`Period recorded — SHS: ${shs} (${shsZone(shs).label})`);
}

function analDeleteEntry(idx){
  const kpiData=DB.get(SK.kpi)||[];
  kpiData.splice(idx,1);
  DB.set(SK.kpi,kpiData);
  renderAnal();
}

function renderKPILog(kpiData){
  const log=document.getElementById('kpi-log-wrap');
  const list=document.getElementById('kpi-log');
  if(!log||!list) return;
  if(!kpiData.length){log.style.display='none';return;}
  log.style.display='block';
  list.innerHTML=kpiData.map((e,i)=>`
    <div class="entry-row">
      <span class="entry-date mono text-xs muted">${e.date}</span>
      <div style="display:flex;gap:10px;flex-wrap:wrap;font-family:var(--font-mono);font-size:12px;">
        <span style="font-weight:700;color:${shsZone(e.shs).color}">SHS ${e.shs}</span>
        <span class="muted">RE ${e.re}</span><span class="muted">DS ${e.ds}</span>
        <span class="muted">OE ${e.oe}</span><span class="muted">AI ${e.ai}</span>
        <span style="color:var(--m-ana)">M ${e.m}</span>
        <span style="color:var(--j-ana)">J ${e.j}</span>
        <span style="color:var(--b-ana)">B ${e.b}</span>
      </div>
      <button class="task-btn del" onclick="analDeleteEntry(${i})">✕</button>
    </div>`).join('');
}
