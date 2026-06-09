/* ═══════════════════════════════════════════════════════
   CORE.JS — Shared data, storage, auto-assign engine
   Migration note: replace localStorage calls with
   API calls to your backend (Supabase/Firebase/etc.)
   All data structures use IDs + timestamps for easy lift.
═══════════════════════════════════════════════════════ */

/* ── STORAGE KEYS ── */
const SK = {
  tasks:      'sd_tasks_v1',
  kpi:        'sd_kpi_v1',
  clients:    'sd_clients_v1',
  clientTasks:'sd_ctasks_v1',
  invoices:   'sd_invoices_v1',
  members:    'sd_members_v1',
  roles:      'sd_roles_v1',
  keywords:   'sd_keywords_v1',
  templates:  'sd_templates_v1',
  docTypes:   'sd_doctypes_v1',
  backendTasks:'sd_btasks_v1',
  company:    'sd_company_v1',
};

/* ── STORAGE HELPERS ──
   Write-through cache: localStorage = sync read cache, Supabase = persistent store.
   pushToSupabase / deleteFromSupabase are defined in supabase-db.js (loaded after this file). */
const DB = {
  get(key){ try{ return JSON.parse(localStorage.getItem(key)); }catch(e){ return null; } },
  set(key,val){ try{ localStorage.setItem(key,JSON.stringify(val)); }catch(e){} if(typeof pushToSupabase==='function') pushToSupabase(key,val); },
  del(key){ try{ localStorage.removeItem(key); }catch(e){} if(typeof deleteFromSupabase==='function') deleteFromSupabase(key); },
};

/* ── ID GENERATOR ── */
function genId(prefix='id'){
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
}

/* ── DATE HELPERS ── */
const START_DATE = new Date('2026-06-01');
function today(){ return new Date().toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'}); }
function daysSinceStart(){ return Math.floor((new Date()-START_DATE)/86400000); }
function dueDate(daysFromStart){
  const d=new Date(START_DATE); d.setDate(d.getDate()+daysFromStart); return d;
}
function daysLeft(dueD){ return Math.ceil((new Date(dueD)-new Date())/86400000); }
function formatDate(d){ return new Date(d).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'}); }
function isoNow(){ return new Date().toISOString(); }
function autoInvoiceNo(){
  const invs = DB.get(SK.invoices)||[];
  const yr = new Date().getFullYear();
  const num = String(invs.length+1).padStart(3,'0');
  return `INV-${yr}-${num}`;
}

/* ── DEFAULT COMPANY ── */
const DEFAULT_COMPANY = {
  name:'Your Company Sdn Bhd',
  reg:'SSM-XXXXXXXX',
  address:'Petaling Jaya, Selangor',
  email:'hello@yourcompany.com',
  phone:'+60 1X-XXXXXXX',
  bank:'',
  accountNo:'',
};

/* ── DEFAULT MEMBERS ── */
const DEFAULT_MEMBERS = [
  { id:'M', initial:'M', name:'M', role:'CEO / Operations', email:'', phone:'', active:true, isFounder:true },
  { id:'J', initial:'J', name:'J', role:'CTO / Technology', email:'', phone:'', active:true, isFounder:true },
  { id:'B', initial:'B', name:'B', role:'CIO / Information', email:'', phone:'', active:true, isFounder:true },
];

/* ── DEFAULT KEYWORD→ROLE MAPPING ── */
const DEFAULT_KEYWORDS = [
  { keyword:'invoice',      member:'M', reason:'Revenue / finance owned by M' },
  { keyword:'revenue',      member:'M', reason:'Revenue owned by M' },
  { keyword:'client',       member:'M', reason:'Client relations owned by M' },
  { keyword:'sales',        member:'M', reason:'Sales owned by M' },
  { keyword:'tax',          member:'M', reason:'Finance owned by M' },
  { keyword:'ssm',          member:'M', reason:'Company admin owned by M' },
  { keyword:'grant',        member:'M', reason:'Funding owned by M' },
  { keyword:'quotation',    member:'M', reason:'Sales docs owned by M' },
  { keyword:'contract',     member:'M', reason:'Agreements owned by M' },
  { keyword:'payment',      member:'M', reason:'Finance owned by M' },
  { keyword:'deploy',       member:'J', reason:'Deployment owned by CTO J' },
  { keyword:'api',          member:'J', reason:'Technical owned by J' },
  { keyword:'code',         member:'J', reason:'Engineering owned by J' },
  { keyword:'server',       member:'J', reason:'Infrastructure owned by J' },
  { keyword:'bug',          member:'J', reason:'Tech issues owned by J' },
  { keyword:'pipeline',     member:'J', reason:'CI/CD owned by J' },
  { keyword:'database',     member:'J', reason:'Data infra owned by J' },
  { keyword:'ai',           member:'J', reason:'AI systems owned by J' },
  { keyword:'cloud',        member:'J', reason:'Cloud infra owned by J' },
  { keyword:'wifi',         member:'J', reason:'Tech setup owned by J' },
  { keyword:'security',     member:'J', reason:'Cybersecurity owned by J' },
  { keyword:'data',         member:'B', reason:'Data management owned by CIO B' },
  { keyword:'report',       member:'B', reason:'Reporting owned by B' },
  { keyword:'analytics',    member:'B', reason:'Analytics owned by B' },
  { keyword:'compliance',   member:'B', reason:'Compliance owned by B' },
  { keyword:'document',     member:'B', reason:'Document management owned by B' },
  { keyword:'records',      member:'B', reason:'Record keeping owned by B' },
  { keyword:'minutes',      member:'B', reason:'Meeting minutes owned by B' },
  { keyword:'gantt',        member:'B', reason:'Project tracking owned by B' },
  { keyword:'kpi',          member:'B', reason:'KPI tracking owned by B' },
  { keyword:'pdpa',         member:'B', reason:'Data protection owned by B' },
];

/* ── DEFAULT DOC TYPES ── */
const DEFAULT_DOC_TYPES = [
  { id:'dt_inv',  name:'Invoice',          icon:'🧾', active:true },
  { id:'dt_quo',  name:'Quotation',        icon:'📋', active:true },
  { id:'dt_po',   name:'Purchase Order',   icon:'🛒', active:true },
  { id:'dt_do',   name:'Delivery Order',   icon:'📦', active:true },
  { id:'dt_rec',  name:'Receipt',          icon:'🏷️', active:true },
  { id:'dt_let',  name:'Official Letter',  icon:'✉️', active:true },
  { id:'dt_mou',  name:'MoU / Agreement',  icon:'🤝', active:true },
  { id:'dt_min',  name:'Meeting Minutes',  icon:'📝', active:true },
  { id:'dt_exp',  name:'Expense Claim',    icon:'💳', active:true },
  { id:'dt_pay',  name:'Payslip',          icon:'💰', active:true },
  { id:'dt_nda',  name:'NDA',              icon:'🔒', active:true },
  { id:'dt_pr',   name:'Progress Report',  icon:'📊', active:true },
  { id:'dt_sow',  name:'Scope of Work',    icon:'🔧', active:true },
  { id:'dt_cr',   name:'Credit Note',      icon:'📉', active:true },
  { id:'dt_dn',   name:'Debit Note',       icon:'📈', active:true },
];

/* ── INIT DEFAULTS (run on first load) ── */
function initDefaults(){
  if(!DB.get(SK.members))     DB.set(SK.members, DEFAULT_MEMBERS);
  if(!DB.get(SK.keywords))    DB.set(SK.keywords, DEFAULT_KEYWORDS);
  if(!DB.get(SK.docTypes))    DB.set(SK.docTypes, DEFAULT_DOC_TYPES);
  if(!DB.get(SK.company))     DB.set(SK.company, DEFAULT_COMPANY);
  if(!DB.get(SK.tasks))       DB.set(SK.tasks, DEFAULT_TASKS);
  if(!DB.get(SK.clients))     DB.set(SK.clients, DEFAULT_CLIENTS);
  if(!DB.get(SK.clientTasks)) DB.set(SK.clientTasks, []);
  if(!DB.get(SK.invoices))    DB.set(SK.invoices, []);
  if(!DB.get(SK.kpi))         DB.set(SK.kpi, []);
  if(!DB.get(SK.templates))   DB.set(SK.templates, {});
  if(!DB.get(SK.backendTasks))DB.set(SK.backendTasks, generateBackendTasks());
  if(!DB.get(SK.roles))       DB.set(SK.roles, DEFAULT_ROLES);
}

/* ── DEFAULT ROLES (empty slots for manual input) ── */
const DEFAULT_ROLES = [
  { memberId:'M', responsibilities:'' },
  { memberId:'J', responsibilities:'' },
  { memberId:'B', responsibilities:'' },
];

/* ── AUTO-ASSIGN ENGINE ──
   Migration: this function can call an LLM API
   instead of keyword matching for better accuracy */
function autoAssign(title='', description=''){
  const text = (title+' '+description).toLowerCase();
  const keywords = DB.get(SK.keywords) || DEFAULT_KEYWORDS;
  const members  = DB.get(SK.members)  || DEFAULT_MEMBERS;

  // Score each member
  const scores = {};
  members.filter(m=>m.active).forEach(m=>{ scores[m.id]=0; });

  keywords.forEach(kw=>{
    if(text.includes(kw.keyword.toLowerCase())){
      scores[kw.member] = (scores[kw.member]||0) + 1;
    }
  });

  // Also check role descriptions
  const roles = DB.get(SK.roles)||DEFAULT_ROLES;
  roles.forEach(r=>{
    if(!r.responsibilities) return;
    const words = r.responsibilities.toLowerCase().split(/\W+/);
    words.forEach(w=>{ if(w.length>3 && text.includes(w)) scores[r.memberId]=(scores[r.memberId]||0)+0.5; });
  });

  // Find winner
  let best = members.filter(m=>m.active)[0]?.id || 'M';
  let bestScore = -1;
  Object.entries(scores).forEach(([id,s])=>{ if(s>bestScore){bestScore=s;best=id;} });

  return { assignedTo: best, confidence: bestScore };
}

/* ── AUTO-PRIORITY ENGINE ──
   Ries principle: client tasks override, speed matters */
function autoPriority(title='', description='', context='main'){
  if(context==='client') {
    const text=(title+' '+description).toLowerCase();
    const urgentWords=['urgent','asap','today','tomorrow','overdue','payment','deadline','sign','approval','block'];
    const isUrgent = urgentWords.some(w=>text.includes(w));
    return isUrgent ? 'high' : 'med';
  }
  const text=(title+' '+description).toLowerCase();
  const redWords  =['urgent','critical','block','fail','today','asap','payment','sign','legal','deadline','overdue'];
  const blueWords =['plan','strategy','setup','register','design','review','draft','prepare','research'];
  const yellowWords=['send','reply','follow','update','remind','check','confirm'];
  if(redWords.some(w=>text.includes(w)))    return 'red';
  if(yellowWords.some(w=>text.includes(w))) return 'yellow';
  if(blueWords.some(w=>text.includes(w)))   return 'blue';
  return 'green';
}

/* ── PRIORITY DISPLAY HELPERS ── */
const PRIORITY_LABELS = {
  high:   { label:'Top Priority',    dot:'high',   class:'ptag high'  },
  med:    { label:'Important',       dot:'med',    class:'ptag med'   },
  red:    { label:'Do Now',          dot:'red',    class:'ptag red'   },
  yellow: { label:'Delegate',        dot:'yellow', class:'ptag yellow'},
  blue:   { label:'Schedule',        dot:'blue',   class:'ptag blue'  },
  green:  { label:'Do Last',         dot:'green',  class:'ptag green' },
};

function priorityTag(p){
  const info = PRIORITY_LABELS[p]||PRIORITY_LABELS.green;
  return `<span class="${info.class}"><span class="pdot ${info.dot}"></span>${info.label}</span>`;
}

function memberTag(id, analMode=false){
  const members = DB.get(SK.members)||DEFAULT_MEMBERS;
  const m = members.find(x=>x.id===id)||{initial:id,name:id};
  const cls = analMode ? `tag ana-${id}` : 'tag';
  return `<span class="${cls}">${m.initial||id}</span>`;
}

function getMember(id){
  const members = DB.get(SK.members)||DEFAULT_MEMBERS;
  return members.find(m=>m.id===id)||{id,initial:id,name:id,role:''};
}
function getActiveMembers(){
  return (DB.get(SK.members)||DEFAULT_MEMBERS).filter(m=>m.active);
}

/* ── PLAN BADGE ── */
function planBadge(plan){
  if(!plan) return '';
  return `<span class="plan-badge ${plan}">${plan.charAt(0).toUpperCase()+plan.slice(1)}</span>`;
}

/* ── GENERATE BACKEND SYSTEM TASKS ── */
function generateBackendTasks(){
  return [
    { id:genId('bt'), title:'Upload invoice template for your company', note:'Required for invoice generation on the Docs page.', type:'template', targetId:'own', done:false, created:isoNow() },
    { id:genId('bt'), title:'Fill in company information (name, reg, address, bank)', note:'Used in all generated documents.', type:'company', done:false, created:isoNow() },
    { id:genId('bt'), title:'Define team roles and responsibilities', note:'Used by auto-assign engine to route tasks correctly.', type:'roles', done:false, created:isoNow() },
    { id:genId('bt'), title:'Review and edit keyword-to-role mapping', note:'Teaches the system which keywords belong to which team member.', type:'keywords', done:false, created:isoNow() },
    { id:genId('bt'), title:'Add first client and upload their invoice template', note:'Client templates are needed before invoices can be generated.', type:'client_template', done:false, created:isoNow() },
  ];
}

/* ── REFRESH BACKEND TASKS (called when templates uploaded etc.) ── */
function refreshBackendTasks(){
  const existing = DB.get(SK.backendTasks)||[];
  const templates = DB.get(SK.templates)||{};
  const clients = DB.get(SK.clients)||[];
  const company = DB.get(SK.company)||{};

  // Check for missing client templates
  clients.forEach(c=>{
    if(!templates[c.id]){
      const alreadyExists = existing.find(t=>t.type==='client_template'&&t.targetId===c.id);
      if(!alreadyExists){
        existing.push({ id:genId('bt'), title:`Upload invoice template for ${c.name}`, note:`No template found for ${c.name}. Needed for invoice generation.`, type:'client_template', targetId:c.id, done:false, created:isoNow() });
      }
    } else {
      // Mark done if template exists
      const bt = existing.find(t=>t.type==='client_template'&&t.targetId===c.id);
      if(bt) bt.done=true;
    }
  });

  // Check company info completeness
  const companyTask = existing.find(t=>t.type==='company');
  if(companyTask && company.name && company.name!=='Your Company Sdn Bhd') companyTask.done=true;

  DB.set(SK.backendTasks, existing);
}

/* ── DEFAULT CLIENTS ── */
const DEFAULT_CLIENTS = [
  {
    id:'own', name:"D'Maleaf Grand Sdn Bhd", reg:'', pic:"M", picContact:'',
    industry:'Construction / Landscaping', address:'', plan:'gold',
    notes:'Own company — pinned at top', pinned:true, created:isoNow()
  },
];

/* ── DEFAULT TASKS (existing task board data) ── */
const DEFAULT_TASKS = [
  {id:'t1', phase:'NOW — Validate',title:'Define what the startup is about',note:'One sentence: who is the customer, what problem, what solution.',lean:"Ries: write your leap-of-faith assumptions first",assignedTo:'M',priority:'red',dueDate:dueDate(3).toISOString(),stage:'validate',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t2', phase:'NOW — Validate',title:'Identify riskiest assumption',note:'What must be true for this to succeed?',lean:"Ries: Build-Measure-Learn starts here",assignedTo:'M',priority:'red',dueDate:dueDate(3).toISOString(),stage:'validate',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t3', phase:'NOW — Validate',title:'Design your MVP experiment',note:'Cheapest way to test the riskiest assumption.',lean:"Ries: MVP is a learning tool, not the product",assignedTo:'J',priority:'red',dueDate:dueDate(7).toISOString(),stage:'validate',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t4', phase:'NOW — Validate',title:'First client outreach — DK',note:'Get in front of a real potential user before writing code.',lean:"Ries: get out of the building",assignedTo:'M',priority:'red',dueDate:dueDate(5).toISOString(),stage:'client',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t5', phase:'NOW — Validate',title:'MVP vertical niche decision',note:'Which segment do you serve first? Narrow = faster feedback.',lean:"Ries: pick one beachhead market",assignedTo:'M',priority:'red',dueDate:dueDate(5).toISOString(),stage:'validate',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t6', phase:'NOW — Validate',title:'Role assignment — all three founders',note:'Who owns product, sales, ops, tech, finance?',lean:"Ries: clear accountability prevents pivot paralysis",assignedTo:'M',priority:'red',dueDate:dueDate(3).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t7', phase:'COMPANY FORMATION',title:'Company name decision',note:'Check availability on SSM MyCoID portal.',assignedTo:'M',priority:'red',dueDate:dueDate(7).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t8', phase:'COMPANY FORMATION',title:'Shareholder percentage & SHA',note:'Decide equity split. Sign SHA before SSM registration.',lean:"Ries: clear agreements prevent co-founder conflict",assignedTo:'M',priority:'red',dueDate:dueDate(10).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t9', phase:'COMPANY FORMATION',title:'Sdn Bhd vs Enterprise — pick secretary company',note:'Get 2–3 quotes. Sdn Bhd recommended for investment.',assignedTo:'M',priority:'red',dueDate:dueDate(7).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t10',phase:'COMPANY FORMATION',title:'SSM registration',note:'Submit via MyCoID or secretary company.',assignedTo:'M',priority:'red',dueDate:dueDate(14).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t11',phase:'COMPANY FORMATION',title:'Capital raise decision',note:'RM1,000 minimum paid-up. Bootstrapped or grants?',assignedTo:'M',priority:'yellow',dueDate:dueDate(10).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t12',phase:'COMPANY FORMATION',title:'Office listing — registered address',note:'Apartment can serve as registered address.',assignedTo:'M',priority:'yellow',dueDate:dueDate(10).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t13',phase:'COMPANY FORMATION',title:'Rental unit — name under company for tax',note:'Confirm with tax agent after incorporation.',assignedTo:'M',priority:'yellow',dueDate:dueDate(21).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t14',phase:'COMPANY FORMATION',title:'Team personal tax setup',note:'PCB / income tax for each founder.',assignedTo:'M',priority:'blue',dueDate:dueDate(30).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t15',phase:'COMPANY FORMATION',title:'E-invoice setup (LHDN MyInvois)',note:"Malaysia's e-invoicing mandate.",assignedTo:'M',priority:'blue',dueDate:dueDate(21).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t16',phase:'PRODUCT & TECH',title:'App discussion — tech stack & architecture',note:'Align before writing any code.',lean:"Ries: technical decisions follow validated learning",assignedTo:'J',priority:'red',dueDate:dueDate(7).toISOString(),stage:'mvp',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t17',phase:'PRODUCT & TECH',title:'MVP Gantt chart',note:'6–10 weeks max for first testable version.',lean:"Ries: shorter cycles = faster learning",assignedTo:'B',priority:'red',dueDate:dueDate(7).toISOString(),stage:'mvp',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t18',phase:'PRODUCT & TECH',title:'Beta Gantt chart',note:'Plan only after MVP feedback absorbed.',lean:"Ries: plan beta after pivot-or-persevere decision",assignedTo:'B',priority:'blue',dueDate:dueDate(45).toISOString(),stage:'beta',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t19',phase:'PRODUCT & TECH',title:'CI/CD pipeline setup',note:'GitHub Actions for Python. Automate from first commit.',assignedTo:'J',priority:'blue',dueDate:dueDate(14).toISOString(),stage:'mvp',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t20',phase:'PRODUCT & TECH',title:'Office tools — standardise the stack',note:'One set of tools for all three founders.',assignedTo:'M',priority:'yellow',dueDate:dueDate(7).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t21',phase:'PRODUCT & TECH',title:'Wifi setup at apartment office',note:'Fibre — Unifi or TIME. Redundancy for demos.',assignedTo:'J',priority:'yellow',dueDate:dueDate(5).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t22',phase:'PRODUCT & TECH',title:'Company / idea / workflow stress test',note:'Pre-mortem: what kills this startup in 90 days?',lean:"Ries: identify failure modes before they happen",assignedTo:'M',priority:'red',dueDate:dueDate(10).toISOString(),stage:'validate',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t23',phase:'COMPLIANCE & FUNDING',title:'Grant preparation (MDEC / Cradle / MRANTI)',note:'Need SSM cert + business plan + projections.',assignedTo:'M',priority:'blue',dueDate:dueDate(45).toISOString(),stage:'comply',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t24',phase:'COMPLIANCE & FUNDING',title:'Sovereign AI cloud registration',note:"Malaysia's national AI cloud — subsidised compute.",assignedTo:'J',priority:'blue',dueDate:dueDate(30).toISOString(),stage:'comply',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t25',phase:'COMPLIANCE & FUNDING',title:'National Data Sharing Committee',note:'NDSC compliance if handling government data.',assignedTo:'J',priority:'blue',dueDate:dueDate(40).toISOString(),stage:'comply',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t26',phase:'COMPLIANCE & FUNDING',title:'AI Sandbox — NAIO use',note:"NAIO sandbox programme for regulatory testing.",assignedTo:'J',priority:'blue',dueDate:dueDate(40).toISOString(),stage:'comply',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t27',phase:'COMPLIANCE & FUNDING',title:'MD registration status',note:'Formal MD appointment in company constitution.',assignedTo:'B',priority:'yellow',dueDate:dueDate(14).toISOString(),stage:'form',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t28',phase:'COMPLIANCE & FUNDING',title:'Data Protection Officer — PDPA (WGIB)',note:'DPO under Malaysia PDPA 2010.',assignedTo:'B',priority:'blue',dueDate:dueDate(30).toISOString(),stage:'comply',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t29',phase:'COMPLIANCE & FUNDING',title:'my-AI Trust Mark standard audit',note:"Malaysia AI trustworthiness certification.",assignedTo:'M',priority:'green',dueDate:dueDate(90).toISOString(),stage:'comply',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t30',phase:'KNOWLEDGE MANAGEMENT',title:'Idea / brainstorming bookkeeping',note:'Document all ideas and pivots. Use Notion or Obsidian.',lean:"Ries: unrecorded learning is lost learning",assignedTo:'B',priority:'green',dueDate:dueDate(7).toISOString(),stage:'validate',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
  {id:'t31',phase:'KNOWLEDGE MANAGEMENT',title:'Future predictions — industry bookkeeping',note:'Track competitor moves and market shifts.',lean:"Ries: innovation accounting needs this data",assignedTo:'B',priority:'green',dueDate:dueDate(14).toISOString(),stage:'validate',done:false,remark:'Auto assigned by system',created:isoNow(),delegatedBy:null},
];

/* ── TASK CRUD ── */
function getTasks(){ return DB.get(SK.tasks)||DEFAULT_TASKS; }
function saveTask(task){
  const tasks = getTasks();
  const idx = tasks.findIndex(t=>t.id===task.id);
  if(idx>=0) tasks[idx]=task; else tasks.push(task);
  DB.set(SK.tasks,tasks);
}
function deleteTask(id){
  const tasks = getTasks().filter(t=>t.id!==id);
  DB.set(SK.tasks,tasks);
}
function toggleTaskDone(id){
  const tasks = getTasks();
  const t = tasks.find(x=>x.id===id);
  if(t){ t.done=!t.done; DB.set(SK.tasks,tasks); }
  return t;
}

/* ── CLIENT TASK CRUD ── */
function getClientTasks(clientId){ return (DB.get(SK.clientTasks)||[]).filter(t=>t.clientId===clientId); }
function saveClientTask(task){
  const tasks = DB.get(SK.clientTasks)||[];
  const idx = tasks.findIndex(t=>t.id===task.id);
  if(idx>=0) tasks[idx]=task; else tasks.push(task);
  DB.set(SK.clientTasks,tasks);
}
function deleteClientTask(id){
  DB.set(SK.clientTasks,(DB.get(SK.clientTasks)||[]).filter(t=>t.id!==id));
}

/* ── CLIENT CRUD ── */
function getClients(){ return DB.get(SK.clients)||DEFAULT_CLIENTS; }
function saveClient(c){
  const clients = getClients();
  const idx = clients.findIndex(x=>x.id===c.id);
  if(idx>=0) clients[idx]=c; else clients.push(c);
  DB.set(SK.clients,clients);
  refreshBackendTasks();
}
function deleteClient(id){
  DB.set(SK.clients,getClients().filter(c=>c.id!==id));
}

/* ── INVOICE CRUD ── */
function getInvoices(clientId){
  const all = DB.get(SK.invoices)||[];
  return clientId ? all.filter(i=>i.clientId===clientId) : all;
}
function saveInvoice(inv){
  const all = DB.get(SK.invoices)||[];
  const idx = all.findIndex(i=>i.id===inv.id);
  if(idx>=0) all[idx]=inv; else all.push(inv);
  DB.set(SK.invoices,all);
}

/* ── SHS CALCULATION ── */
function calcSHS(re,ds,oe,ai){
  return Math.round((0.35*clamp(re))+(0.25*clamp(ds))+(0.25*clamp(oe))+(0.15*clamp(ai)));
}
function clamp(v){ return Math.min(100,Math.max(0,isNaN(v)?0:Number(v))); }
function calcRE(actual,target){ return target>0?(actual/target)*100:0; }
function calcDS(avgDays,maxBench=14){ return Math.max(0,100-((avgDays/maxBench)*100)); }
function calcOE(newOut,oldOut){ if(oldOut<=0) return 50; return clamp(50+((newOut-oldOut)/oldOut)*100); }
function calcAI(newAI,oldAI){ if(oldAI<=0) return 50; return clamp(50+((newAI-oldAI)/oldAI)*100); }
function shsZone(s){
  if(s>=86) return{label:'Thriving', color:'#1a7a3c', bg:'rgba(26,122,60,0.1)'};
  if(s>=66) return{label:'Healthy',  color:'#1a5fa8', bg:'rgba(26,95,168,0.1)'};
  if(s>=41) return{label:'Building', color:'#b7770d', bg:'rgba(183,119,13,0.1)'};
  return{label:'Critical',color:'#c0392b',bg:'rgba(192,57,43,0.1)'};
}

/* ── GLOBAL MODAL HELPER ── */
let _activeModal = null;
function openModal(html, onConfirm, confirmLabel='Save'){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className='modal-overlay';
  overlay.id='_modal_overlay';
  overlay.innerHTML=`<div class="modal">${html}<div class="modal-footer"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" id="_modal_confirm">${confirmLabel}</button></div></div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{ if(e.target===overlay) closeModal(); });
  if(onConfirm) document.getElementById('_modal_confirm').onclick=onConfirm;
  _activeModal=overlay;
}
function closeModal(){
  if(_activeModal){ _activeModal.remove(); _activeModal=null; }
  const el=document.getElementById('_modal_overlay');
  if(el) el.remove();
}

/* ── TOAST NOTIFICATIONS ── */
function toast(msg, type='ok'){
  const t=document.createElement('div');
  t.style.cssText=`position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:8px;font-family:var(--font-mono);font-size:13px;font-weight:500;box-shadow:0 4px 20px rgba(0,0,0,0.15);background:${type==='ok'?'#1a7a3c':type==='err'?'#c0392b':'#1a1a1a'};color:#fff;transition:opacity 0.3s;`;
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=>t.remove(),400); },2200);
}

/* ── PAGE NAVIGATION ── */
function showPage(p){
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
  const pg = document.getElementById('page-'+p);
  if(pg) pg.classList.add('active');
  document.querySelectorAll('.nav-btn[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===p));
  window.scrollTo(0,0);
  // Trigger page render
  if(p==='taskboard' && typeof renderTaskboard==='function') renderTaskboard();
  if(p==='anal'      && typeof renderAnal==='function')      { setTimeout(renderAnal,80); }
  if(p==='clients'   && typeof renderClients==='function')   renderClients();
  if(p==='docs'      && typeof renderDocs==='function')      renderDocs();
  if(p==='backend'   && typeof renderBackend==='function')   renderBackend();
}
