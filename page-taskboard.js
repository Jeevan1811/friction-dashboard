/* ═══════════════════════════════════════════
   PAGE-TASKBOARD.JS
   Task board with combined member+colour filters
   Delegate, edit, add task, pipeline, stats
═══════════════════════════════════════════ */

const PIPELINE_STAGES_TB = [
  {name:'Validate', key:'validate', color:'#c0392b'},
  {name:'Form Co.',  key:'form',    color:'#b7770d'},
  {name:'Build MVP', key:'mvp',     color:'#1a5fa8'},
  {name:'1st Client',key:'client',  color:'#1a5fa8'},
  {name:'Beta',      key:'beta',    color:'#1a7a3c'},
  {name:'Comply',    key:'comply',  color:'#1a7a3c'},
  {name:'Scale',     key:'scale',   color:'#1a7a3c'},
];

// Active filters: member filter + colour filter (AND logic)
let tbMemberFilter = 'ALL';
let tbColourFilter = 'ALL';

function renderTaskboard(){
  buildPipelineTB();
  buildStatsTB();
  buildBoardTB();
}

/* ── PIPELINE ── */
function buildPipelineTB(){
  const track = document.getElementById('tb-pipeline-track');
  if(!track) return;
  const tasks = getTasks();
  const tot={}, done={};
  tasks.forEach(t=>{
    if(!tot[t.stage]){tot[t.stage]=0;done[t.stage]=0;}
    tot[t.stage]++;
    if(t.done) done[t.stage]++;
  });
  const stages = PIPELINE_STAGES_TB.map(s=>({
    ...s,
    pct: tot[s.key]?Math.round((done[s.key]||0)/tot[s.key]*100):0,
    total:tot[s.key]||0, done:done[s.key]||0
  }));
  track.innerHTML='';
  stages.forEach((s,i)=>{
    const isDone=s.pct===100, isActive=!isDone&&(i===0||stages[i-1].pct>0);
    const el=document.createElement('div'); el.className='p-stage';
    el.innerHTML=`
      <div class="p-dot ${isDone?'done':isActive?'active':''}"
           style="background:${isDone?s.color:isActive?s.color+'22':'#ece8df'};border-color:${isDone||isActive?s.color:'#d0c9bb'};color:${isDone?'#fff':isActive?s.color:'#999'}">
        ${isDone?'✓':`<span style="font-size:9px;font-family:var(--font-mono)">${s.pct}%</span>`}
      </div>
      <div class="p-name" style="color:${isActive||isDone?s.color:'var(--muted)'}">${s.name}</div>
      <div style="font-size:9px;font-family:var(--font-mono);color:${s.color}">${s.done}/${s.total}</div>
      <div class="p-bar-wrap"><div class="p-bar-fill" style="width:${s.pct}%;background:${s.color}"></div></div>`;
    track.appendChild(el);
    if(i<stages.length-1){
      const conn=document.createElement('div'); conn.className='p-connector';
      if(isDone) conn.style.background=s.color;
      else if(isActive){
        const f=document.createElement('div'); f.className='p-conn-fill';
        f.style.background=`linear-gradient(90deg,transparent,${s.color},transparent)`;
        conn.appendChild(f);
      }
      track.appendChild(conn);
    }
  });
}

/* ── STATS ── */
function buildStatsTB(){
  const wrap=document.getElementById('tb-stats'); if(!wrap) return;
  const tasks=getTasks(), total=tasks.length, done=tasks.filter(t=>t.done).length;
  const by={M:0,J:0,B:0,Md:0,Jd:0,Bd:0};
  tasks.forEach(t=>{
    const m=t.assignedTo;
    if(by[m]!==undefined) by[m]++;
    if(t.done && by[m+'d']!==undefined) by[m+'d']++;
  });
  wrap.innerHTML=`
    <div class="stat-card"><div class="stat-num" style="color:var(--green)">${Math.round(done/total*100)||0}%</div><div class="stat-label">done</div></div>
    <div class="stat-card"><div class="stat-num">${done}<span style="font-size:14px;color:var(--muted)">/${total}</span></div><div class="stat-label">complete</div></div>
    <div class="stat-card"><div class="stat-num">${by.Md}<span style="font-size:14px;color:var(--muted)">/${by.M}</span></div><div class="stat-label">M done</div></div>
    <div class="stat-card"><div class="stat-num">${by.Jd}<span style="font-size:14px;color:var(--muted)">/${by.J}</span></div><div class="stat-label">J done</div></div>
    <div class="stat-card"><div class="stat-num">${by.Bd}<span style="font-size:14px;color:var(--muted)">/${by.B}</span></div><div class="stat-label">B done</div></div>`;
}

/* ── BOARD ── */
function buildBoardTB(){
  const board=document.getElementById('tb-board'); if(!board) return;
  board.innerHTML='';
  const tasks=getTasks();
  const phases=[...new Set(tasks.map(t=>t.phase))];
  phases.forEach(phase=>{
    const phTasks=tasks.filter(t=>t.phase===phase);
    const phEl=document.createElement('div');
    phEl.innerHTML=`<div class="section-title">${phase}</div>`;
    const grid=document.createElement('div'); grid.className='grid-auto';
    phTasks.forEach(task=>{
      const el=buildTaskCardTB(task);
      grid.appendChild(el);
    });
    phEl.appendChild(grid);
    board.appendChild(phEl);
  });
  applyTBFilters();
}

function buildTaskCardTB(task){
  const dl = daysLeft(task.dueDate);
  let dlClass='ok', dlText=`${dl}d left`;
  if(task.done){dlClass='done-tag';dlText='Done ✓';}
  else if(dl<0){dlClass='overdue';dlText=`${Math.abs(dl)}d overdue`;}
  else if(dl<=5){dlClass='soon';}

  const card=document.createElement('div');
  card.className=`task-card${task.done?' done':''}`;
  card.dataset.p=task.priority;
  card.dataset.assigned=task.assignedTo;
  card.dataset.id=task.id;

  card.innerHTML=`
    <div class="task-top">
      <div class="task-check${task.done?' checked':''}" onclick="tbToggleDone('${task.id}',this)"></div>
      <div class="task-title">${task.title}</div>
      ${priorityTag(task.priority)}
    </div>
    <div class="task-note">${task.note||''}</div>
    ${task.lean?`<div class="task-lean">↗ ${task.lean}</div>`:''}
    <div class="task-meta">
      <div class="task-tags">${memberTag(task.assignedTo)}</div>
      <div class="task-time">Due ${formatDate(task.dueDate)} <span class="dl ${dlClass}">${dlText}</span></div>
    </div>
    <div class="task-actions">
      <button class="task-btn edit" onclick="tbEditTask('${task.id}')">✏️ Edit</button>
      <button class="task-btn delegate" onclick="tbDelegateTask('${task.id}')">↗ Delegate</button>
      <button class="task-btn del" onclick="tbDeleteTask('${task.id}')">✕</button>
    </div>
    ${task.remark?`<div class="task-remark">${task.remark}${task.delegatedBy?' · Delegated by '+task.delegatedBy:''}</div>`:''}`;
  return card;
}

/* ── FILTER LOGIC (AND) ── */
function setTBMemberFilter(m){
  tbMemberFilter=m;
  document.querySelectorAll('#tb-filters .filt-btn[data-mf]').forEach(b=>b.classList.toggle('active',b.dataset.mf===m));
  applyTBFilters();
}
function setTBColourFilter(c){
  tbColourFilter = tbColourFilter===c ? 'ALL' : c; // toggle
  document.querySelectorAll('#tb-filters .filt-btn[data-cf]').forEach(b=>b.classList.toggle('active',b.dataset.cf===tbColourFilter));
  applyTBFilters();
}
function applyTBFilters(){
  document.querySelectorAll('#tb-board .task-card').forEach(card=>{
    const matchMember = tbMemberFilter==='ALL' || card.dataset.assigned===tbMemberFilter;
    const matchColour = tbColourFilter==='ALL'  || card.dataset.p===tbColourFilter;
    card.classList.toggle('hidden', !(matchMember && matchColour));
  });
}

/* ── TOGGLE DONE ── */
function tbToggleDone(id, el){
  toggleTaskDone(id);
  el.classList.toggle('checked');
  const card=el.closest('.task-card'); if(card) card.classList.toggle('done');
  buildPipelineTB(); buildStatsTB();
}

/* ── ADD TASK ── */
function tbOpenAddTask(){
  const members=getActiveMembers();
  const memberOpts=members.map(m=>`<option value="${m.id}">${m.initial} — ${m.role}</option>`).join('');
  openModal(`
    <div class="modal-title">Add Task</div>
    <div class="modal-sub">System will auto-assign and auto-prioritise based on your input.</div>
    <div class="form-grid" style="gap:12px">
      <div class="form-group" style="grid-column:1/-1">
        <label>Task title *</label>
        <input id="at-title" placeholder="e.g. Follow up invoice with client" />
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label>Description</label>
        <textarea id="at-note" placeholder="More detail helps the system assign correctly..."></textarea>
      </div>
      <div class="form-group">
        <label>Phase</label>
        <input id="at-phase" placeholder="e.g. COMPANY FORMATION" />
      </div>
      <div class="form-group">
        <label>Due in (days from today)</label>
        <input id="at-days" type="number" placeholder="7" min="1" />
      </div>
      <div class="form-group">
        <label>Override assignee (optional)</label>
        <select id="at-assign"><option value="">Auto-assign</option>${memberOpts}</select>
      </div>
      <div class="form-group">
        <label>Override priority (optional)</label>
        <select id="at-priority">
          <option value="">Auto-prioritise</option>
          <option value="red">🔴 Do Now</option>
          <option value="yellow">🟡 Delegate</option>
          <option value="blue">🔵 Schedule</option>
          <option value="green">🟢 Do Last</option>
        </select>
      </div>
    </div>`, tbSaveNewTask, 'Add Task');
}

function tbSaveNewTask(){
  const title = document.getElementById('at-title')?.value?.trim();
  if(!title){ toast('Title is required','err'); return; }
  const note    = document.getElementById('at-note')?.value?.trim()||'';
  const phase   = document.getElementById('at-phase')?.value?.trim()||'TASKS';
  const days    = parseInt(document.getElementById('at-days')?.value)||7;
  const overAssign   = document.getElementById('at-assign')?.value;
  const overPriority = document.getElementById('at-priority')?.value;

  const {assignedTo, confidence} = autoAssign(title, note);
  const finalAssign   = overAssign   || assignedTo;
  const finalPriority = overPriority || autoPriority(title, note, 'main');

  const remark = overAssign
    ? `Manually assigned to ${overAssign}`
    : `Auto assigned by system${confidence===0?' (no keyword match — defaulted)':''}`;

  const task = {
    id: genId('t'), phase, title, note, lean:'',
    assignedTo: finalAssign,
    priority:   finalPriority,
    dueDate:    new Date(Date.now()+days*86400000).toISOString(),
    stage:'validate', done:false,
    remark, created:isoNow(), delegatedBy:null,
  };
  saveTask(task);
  closeModal();
  buildBoardTB();
  buildStatsTB();
  toast(`Task added → assigned to ${finalAssign}`);
}

/* ── EDIT TASK ── */
function tbEditTask(id){
  const tasks=getTasks();
  const task=tasks.find(t=>t.id===id); if(!task) return;
  const members=getActiveMembers();
  const memberOpts=members.map(m=>`<option value="${m.id}" ${task.assignedTo===m.id?'selected':''}>${m.initial} — ${m.role}</option>`).join('');
  const priorities=['red','yellow','blue','green'];
  const priorityOpts=priorities.map(p=>`<option value="${p}" ${task.priority===p?'selected':''}>${p}</option>`).join('');
  const daysVal = Math.max(1,Math.ceil((new Date(task.dueDate)-new Date())/86400000));

  openModal(`
    <div class="modal-title">Edit Task</div>
    <div class="modal-sub">Changes saved immediately.</div>
    <div class="form-grid" style="gap:12px">
      <div class="form-group" style="grid-column:1/-1">
        <label>Title *</label>
        <input id="et-title" value="${task.title}" />
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label>Description</label>
        <textarea id="et-note">${task.note||''}</textarea>
      </div>
      <div class="form-group">
        <label>Phase</label>
        <input id="et-phase" value="${task.phase}" />
      </div>
      <div class="form-group">
        <label>Due in days (from today)</label>
        <input id="et-days" type="number" value="${daysVal}" min="1" />
      </div>
      <div class="form-group">
        <label>Assigned to</label>
        <select id="et-assign">${memberOpts}</select>
      </div>
      <div class="form-group">
        <label>Priority</label>
        <select id="et-priority">${priorityOpts}</select>
      </div>
    </div>`, ()=>tbSaveEditTask(id), 'Save Changes');
}

function tbSaveEditTask(id){
  const tasks=getTasks();
  const task=tasks.find(t=>t.id===id); if(!task) return;
  task.title    = document.getElementById('et-title')?.value?.trim()||task.title;
  task.note     = document.getElementById('et-note')?.value?.trim()||'';
  task.phase    = document.getElementById('et-phase')?.value?.trim()||task.phase;
  task.assignedTo = document.getElementById('et-assign')?.value||task.assignedTo;
  task.priority   = document.getElementById('et-priority')?.value||task.priority;
  const days = parseInt(document.getElementById('et-days')?.value)||7;
  task.dueDate = new Date(Date.now()+days*86400000).toISOString();
  saveTask(task);
  closeModal();
  buildBoardTB();
  toast('Task updated');
}

/* ── DELETE TASK ── */
function tbDeleteTask(id){
  if(!confirm('Delete this task?')) return;
  deleteTask(id);
  buildBoardTB();
  buildStatsTB();
  buildPipelineTB();
  toast('Task deleted');
}

/* ── DELEGATE ── */
function tbDelegateTask(id){
  const task=getTasks().find(t=>t.id===id); if(!task) return;
  const members=getActiveMembers().filter(m=>m.id!==task.assignedTo);
  const memberOpts=members.map(m=>`<option value="${m.id}">${m.initial} — ${m.role}</option>`).join('');
  openModal(`
    <div class="modal-title">Delegate Task</div>
    <div class="modal-sub">"${task.title}"</div>
    <div class="form-grid" style="gap:12px">
      <div class="form-group">
        <label>Delegate to</label>
        <select id="del-to">${memberOpts}</select>
      </div>
      <div class="form-group">
        <label>Reason</label>
        <select id="del-reason">
          <option value="More suitable to them">More suitable to them</option>
          <option value="I have too much work overload">I have too much work overload</option>
          <option value="other">Other (specify below)</option>
        </select>
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label>Custom reason (if Other)</label>
        <input id="del-custom" placeholder="Optional — only if Other selected above" />
      </div>
    </div>`, ()=>tbSaveDelegate(id), 'Delegate');
}

function tbSaveDelegate(id){
  const tasks=getTasks();
  const task=tasks.find(t=>t.id===id); if(!task) return;
  const from=task.assignedTo;
  const to=document.getElementById('del-to')?.value;
  const reasonSel=document.getElementById('del-reason')?.value;
  const custom=document.getElementById('del-custom')?.value?.trim();
  const reason = reasonSel==='other' && custom ? custom : reasonSel;
  task.remark=`Delegated by ${from} — ${reason}`;
  task.delegatedBy=from;
  task.assignedTo=to;
  saveTask(task);
  closeModal();
  buildBoardTB();
  toast(`Task delegated to ${to}`);
}
