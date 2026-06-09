/* ═══════════════════════════════════════════
   PAGE-TASKBOARD.JS — Friction Warm Theme
   Row/table layout · collapsible phases
   Data layer: core.js (getTasks, saveTask…)
═══════════════════════════════════════════ */

const PIPELINE_STAGES_TB = [
  {key:'validate', name:'Validate',    color:'#C92B2B'},
  {key:'form',     name:'Form Co.',    color:'#B45309'},
  {key:'mvp',      name:'Build MVP',   color:'#1D4ED8'},
  {key:'client',   name:'1st Client',  color:'#C4522A'},
  {key:'beta',     name:'Beta',        color:'#15803D'},
  {key:'comply',   name:'Comply',      color:'#7C3AED'},
  {key:'scale',    name:'Scale',       color:'#0F766E'},
];

const PHASE_COLORS_TB = {
  'NOW — Validate':       '#C92B2B',
  'COMPANY FORMATION':    '#B45309',
  'PRODUCT & TECH':       '#1D4ED8',
  'COMPLIANCE & FUNDING': '#7C3AED',
  'KNOWLEDGE MANAGEMENT': '#15803D',
};

const PRIORITY_MAP_TB = {
  red:    {label:'Do Now',   cls:'fw-status-red'},
  amber:  {label:'Delegate', cls:'fw-status-amber'},
  yellow: {label:'Delegate', cls:'fw-status-amber'},
  blue:   {label:'Schedule', cls:'fw-status-blue'},
  green:  {label:'Do Last',  cls:'fw-status-green'},
};

const MEMBER_AV_TB = {
  M: 'fw-av-m-sm',
  J: 'fw-av-j-sm',
  B: 'fw-av-b-sm',
};

let tbMemberFilter = 'ALL';
let tbColourFilter = 'ALL';
let tbSearchQ = '';
let tbExpandedGroups = {};

/* ══ MAIN RENDER ENTRY ══ */
function renderTaskboard(){
  buildPipelineTB();
  buildStatsTB();
  buildBoardTB();
  updateTBSidebarCounts();
}

/* ══ PIPELINE ══ */
function buildPipelineTB(){
  const track = document.getElementById('tb-pipeline-track');
  if(!track) return;
  const tasks = getTasks();
  const tot = {}, done = {};
  tasks.forEach(t => {
    tot[t.stage]  = (tot[t.stage]  || 0) + 1;
    if(t.done) done[t.stage] = (done[t.stage] || 0) + 1;
  });

  let html = '';
  PIPELINE_STAGES_TB.forEach((s, i) => {
    const t = tot[s.key] || 0, d = done[s.key] || 0;
    const pct = t ? Math.round(d / t * 100) : 0;
    const isDone = pct === 100;
    const isActive = !isDone && (pct > 0 || (i === 0 && t > 0));
    const state = isDone ? 'done' : isActive ? 'active' : 'idle';
    html += '<div class="fw-pipe-step ' + state + '">'
      + '<div class="fw-pipe-dot ' + state + '"></div>'
      + '<div class="fw-pipe-name">' + s.name + '</div>'
      + '<div class="fw-pipe-frac">' + d + '/' + t + '</div>'
      + '</div>';
    if(i < PIPELINE_STAGES_TB.length - 1) html += '<span class="fw-pipe-arrow">›</span>';
  });
  track.innerHTML = html;

  const totalDone = tasks.filter(t => t.done).length;
  const pct = tasks.length ? Math.round(totalDone / tasks.length * 100) : 0;
  const el = document.getElementById('tb-pipe-overall');
  if(el) el.textContent = pct + '% overall · ' + totalDone + '/' + tasks.length + ' done';
}

/* ══ STATS ══ */
function buildStatsTB(){
  const wrap = document.getElementById('tb-stats');
  if(!wrap) return;
  const tasks = getTasks();
  const total = tasks.length, done = tasks.filter(t => t.done).length;
  const byM = tasks.filter(t => t.assignedTo === 'M');
  const byJ = tasks.filter(t => t.assignedTo === 'J');
  const byB = tasks.filter(t => t.assignedTo === 'B');
  const pct = total ? Math.round(done / total * 100) : 0;
  const pM = byM.length ? Math.round(byM.filter(t => t.done).length / byM.length * 100) : 0;
  const pJ = byJ.length ? Math.round(byJ.filter(t => t.done).length / byJ.length * 100) : 0;
  const pB = byB.length ? Math.round(byB.filter(t => t.done).length / byB.length * 100) : 0;

  function sc(num, label, color, p){
    return '<div class="fw-stat-card">'
      + '<div class="fw-stat-num" style="color:' + color + '">' + num + '</div>'
      + '<div class="fw-stat-label">' + label + '</div>'
      + (p > 0 ? '<div class="fw-stat-bar-wrap"><div class="fw-stat-bar-fill" style="width:' + p + '%;background:' + color + '"></div></div>' : '')
      + '</div>';
  }

  wrap.innerHTML =
    sc(pct + '%', 'overall done', 'var(--fw-green)', pct) +
    sc(done + '/' + total, 'tasks complete', 'var(--fw-accent)', pct) +
    sc(byM.filter(t => t.done).length + '/' + byM.length, 'M done', 'var(--fw-red)', pM) +
    sc(byJ.filter(t => t.done).length + '/' + byJ.length, 'J done', 'var(--fw-accent)', pJ) +
    sc(byB.filter(t => t.done).length + '/' + byB.length, 'B done', 'var(--fw-green)', pB) +
    sc(tasks.filter(t => t.priority === 'red' && !t.done).length, 'critical left', 'var(--fw-red)', 0);

  updateTBSidebarCounts();
}

/* ══ BOARD ══ */
function getVisibleTB(){
  return getTasks().filter(t => {
    if(tbMemberFilter !== 'ALL' && t.assignedTo !== tbMemberFilter) return false;
    if(tbColourFilter !== 'ALL' && t.priority !== tbColourFilter &&
       !(tbColourFilter === 'amber' && t.priority === 'yellow')) return false;
    if(tbSearchQ && !t.title.toLowerCase().includes(tbSearchQ) &&
       !(t.note || '').toLowerCase().includes(tbSearchQ)) return false;
    return true;
  });
}

function buildBoardTB(){
  const wrap = document.getElementById('tb-board');
  if(!wrap) return;
  wrap.innerHTML = '';
  const tasks = getTasks();
  const visible = getVisibleTB();
  const phases = [];
  tasks.forEach(t => { if(!phases.includes(t.phase)) phases.push(t.phase); });

  phases.forEach(function(phase){
    const allInPhase = tasks.filter(t => t.phase === phase);
    const visInPhase = visible.filter(t => t.phase === phase);
    if(visInPhase.length === 0 && (tbMemberFilter !== 'ALL' || tbColourFilter !== 'ALL' || tbSearchQ)) return;
    if(!(phase in tbExpandedGroups)) tbExpandedGroups[phase] = true;
    const isOpen = tbExpandedGroups[phase];
    const color = PHASE_COLORS_TB[phase] || 'var(--fw-accent)';
    const doneCt = allInPhase.filter(t => t.done).length;
    const pct = Math.round(doneCt / allInPhase.length * 100);
    const safePhase = phase.replace(/'/g, "\\'");

    const group = document.createElement('div');
    group.className = 'fw-phase-group' + (isOpen ? ' open' : '');

    group.innerHTML =
      '<div class="fw-phase-header" onclick="tbToggleGroup(\'' + safePhase + '\')">'
        + '<span class="fw-phase-chevron">›</span>'
        + '<div class="fw-phase-color-bar" style="background:' + color + '"></div>'
        + '<div class="fw-phase-name">' + phase + '</div>'
        + '<div class="fw-phase-meta">'
          + '<div class="fw-phase-progress-mini"><div class="fw-phase-prog-fill" style="width:' + pct + '%;background:' + color + '"></div></div>'
          + '<div class="fw-phase-count">' + doneCt + '/' + allInPhase.length + '</div>'
        + '</div>'
      + '</div>'
      + (isOpen ? buildPhaseBodyTB(phase, visInPhase) : '');

    wrap.appendChild(group);
  });
}

function buildPhaseBodyTB(phase, tasks){
  if(!tasks.length) return '<div style="padding:12px 14px;color:var(--fw-text-2);font-size:12px;background:var(--fw-surface);border:1px solid var(--fw-border);border-top:none;border-radius:0 0 var(--fw-radius) var(--fw-radius);">No tasks match the current filter in this phase.</div>';
  const safePhase = phase.replace(/'/g, "\\'");
  let rows = '';
  tasks.forEach(t => { rows += buildTaskRowTB(t); });
  return '<div class="fw-col-headers">'
    + '<div class="fw-col-head">Task</div>'
    + '<div class="fw-col-head">Priority</div>'
    + '<div class="fw-col-head">Assigned</div>'
    + '<div class="fw-col-head">Due</div>'
    + '<div class="fw-col-head">Stage</div>'
    + '<div class="fw-col-head">Actions</div>'
    + '</div>'
    + '<div class="fw-task-rows" style="border:1px solid var(--fw-border);border-top:none;border-radius:0 0 var(--fw-radius) var(--fw-radius);overflow:hidden;">'
    + rows
    + '</div>'
    + '<div class="fw-add-row" onclick="tbOpenAddTask(\'' + safePhase + '\')">'
    + '<div class="fw-add-plus">+</div>Add task to ' + phase
    + '</div>';
}

function buildTaskRowTB(task){
  const dl = daysLeft(task.dueDate);
  const due = task.done ? 'done' : dl < 0 ? 'overdue' : dl <= 5 ? 'soon' : 'ok';
  const dueLabel = task.done ? 'Done ✓' : dl < 0 ? Math.abs(dl) + 'd overdue' : dl === 0 ? 'Due today' : dl + 'd left';
  const dueClass = {done:'fw-due-done', overdue:'fw-due-overdue', soon:'fw-due-soon', ok:'fw-due-ok'}[due];
  const pm = PRIORITY_MAP_TB[task.priority] || PRIORITY_MAP_TB.green;
  const avClass = MEMBER_AV_TB[task.assignedTo] || 'fw-av-j-sm';
  const titleSafe = (task.title || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const noteSafe  = (task.note  || '').replace(/</g, '&lt;');

  return '<div class="fw-task-row' + (task.done ? ' done' : '') + '" id="fwtr-' + task.id + '">'
    + '<div class="fw-task-name-cell">'
      + '<div class="fw-task-check' + (task.done ? ' checked' : '') + '" onclick="tbToggleDone(\'' + task.id + '\',this)"></div>'
      + '<div style="min-width:0">'
        + '<div class="fw-task-name" title="' + titleSafe + '">' + (task.title || '') + '</div>'
        + '<div class="fw-task-note-inline">' + noteSafe + '</div>'
      + '</div>'
    + '</div>'
    + '<div><div class="fw-status-chip ' + pm.cls + '"><span class="fw-sdot"></span>' + pm.label + '</div></div>'
    + '<div class="fw-assignee-cell">'
      + '<div class="fw-assignee-av ' + avClass + '">' + (task.assignedTo || '?') + '</div>'
      + '<div class="fw-assignee-name">' + (task.assignedTo || '?') + '</div>'
    + '</div>'
    + '<div class="fw-due-cell">'
      + '<div class="fw-due-date">' + formatDate(task.dueDate) + '</div>'
      + '<div class="fw-due-tag ' + dueClass + '">' + dueLabel + '</div>'
    + '</div>'
    + '<div><div class="fw-stage-badge">' + (task.stage || '—') + '</div></div>'
    + '<div class="fw-row-actions">'
      + '<button class="fw-row-btn" onclick="tbEditTask(\'' + task.id + '\')" title="Edit">✏</button>'
      + '<button class="fw-row-btn" onclick="tbDelegateTask(\'' + task.id + '\')" title="Delegate">↗</button>'
      + '<button class="fw-row-btn del" onclick="tbDeleteTask(\'' + task.id + '\')" title="Delete">✕</button>'
    + '</div>'
  + '</div>';
}

/* ══ SIDEBAR COUNTS ══ */
function updateTBSidebarCounts(){
  const tasks = getTasks();
  var counts = {
    'tb-sb-all': tasks.length,
    'tb-sb-m':   tasks.filter(t => t.assignedTo === 'M').length,
    'tb-sb-j':   tasks.filter(t => t.assignedTo === 'J').length,
    'tb-sb-b':   tasks.filter(t => t.assignedTo === 'B').length,
  };
  Object.keys(counts).forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.textContent = counts[id];
  });
}

/* ══ GROUP COLLAPSE ══ */
function tbToggleGroup(phase){
  tbExpandedGroups[phase] = !tbExpandedGroups[phase];
  buildBoardTB();
}
function tbCollapseAll(){
  Object.keys(tbExpandedGroups).forEach(function(k){ tbExpandedGroups[k] = false; });
  buildBoardTB();
}
function tbExpandAll(){
  getTasks().forEach(function(t){ tbExpandedGroups[t.phase] = true; });
  buildBoardTB();
}

/* ══ FILTERS ══ */
function setTBMemberFilter(m){
  tbMemberFilter = m;
  document.querySelectorAll('[data-mf]').forEach(function(b){ b.classList.toggle('active', b.dataset.mf === m); });
  buildBoardTB();
}
function setTBColourFilter(c){
  tbColourFilter = tbColourFilter === c ? 'ALL' : c;
  document.querySelectorAll('[data-cf]').forEach(function(b){ b.classList.toggle('active', b.dataset.cf === tbColourFilter); });
  buildBoardTB();
}
function tbSearch(q){
  tbSearchQ = q.toLowerCase();
  buildBoardTB();
}

/* ══ TOGGLE DONE ══ */
function tbToggleDone(id, el){
  toggleTaskDone(id);
  buildPipelineTB(); buildStatsTB(); buildBoardTB();
  toast(el.classList.contains('checked') ? 'Task reopened' : 'Task completed ✓');
}

/* ══ ADD TASK ══ */
function tbOpenAddTask(phase){
  phase = phase || '';
  const members = getActiveMembers();
  const memberOpts = members.map(function(m){ return '<option value="' + m.id + '">' + m.initial + ' — ' + m.role + '</option>'; }).join('');
  openModal(
    '<div class="modal-title">Add Task</div>'
    + '<div class="modal-sub">System auto-assigns by keyword · you can override</div>'
    + '<div class="form-grid" style="gap:12px">'
      + '<div class="form-group" style="grid-column:1/-1"><label>Task title *</label><input id="at-title" placeholder="e.g. Follow up invoice with client"/></div>'
      + '<div class="form-group" style="grid-column:1/-1"><label>Description</label><textarea id="at-note" placeholder="More detail helps auto-assign work better…"></textarea></div>'
      + '<div class="form-group"><label>Phase</label><input id="at-phase" value="' + phase.replace(/"/g,'&quot;') + '" placeholder="e.g. PRODUCT &amp; TECH"/></div>'
      + '<div class="form-group"><label>Due in (days)</label><input id="at-days" type="number" placeholder="7" min="1"/></div>'
      + '<div class="form-group"><label>Override assignee</label><select id="at-assign"><option value="">Auto-assign</option>' + memberOpts + '</select></div>'
      + '<div class="form-group"><label>Override priority</label><select id="at-priority"><option value="">Auto-prioritise</option><option value="red">Do Now</option><option value="amber">Delegate</option><option value="blue">Schedule</option><option value="green">Do Last</option></select></div>'
    + '</div>',
    tbSaveNewTask, 'Add Task');
}

function tbSaveNewTask(){
  const title = (document.getElementById('at-title') ? document.getElementById('at-title').value : '').trim();
  if(!title){ toast('Title is required', 'err'); return; }
  const note        = (document.getElementById('at-note')     ? document.getElementById('at-note').value     : '').trim();
  const phase       = (document.getElementById('at-phase')    ? document.getElementById('at-phase').value    : '').trim() || 'TASKS';
  const days        = parseInt(document.getElementById('at-days') ? document.getElementById('at-days').value : '7') || 7;
  const overAssign  = document.getElementById('at-assign')   ? document.getElementById('at-assign').value   : '';
  const overPriority= document.getElementById('at-priority') ? document.getElementById('at-priority').value : '';
  const aa = autoAssign(title, note);
  const task = {
    id: genId('t'), phase, title, note, lean: '',
    assignedTo: overAssign || aa.assignedTo,
    priority:   overPriority || autoPriority(title, note, 'main'),
    dueDate:    new Date(Date.now() + days * 86400000).toISOString(),
    stage:      'validate', done: false,
    remark:     overAssign ? 'Manually assigned to ' + overAssign : 'Auto-assigned' + (aa.confidence === 0 ? ' (no keyword match)' : ''),
    created:    isoNow(), delegatedBy: null,
  };
  saveTask(task);
  closeModal();
  buildBoardTB(); buildStatsTB(); buildPipelineTB();
  toast('Task added → ' + task.assignedTo);
}

/* ══ EDIT TASK ══ */
function tbEditTask(id){
  const task = getTasks().find(function(t){ return t.id === id; });
  if(!task) return;
  const members = getActiveMembers();
  const memberOpts = members.map(function(m){
    return '<option value="' + m.id + '"' + (task.assignedTo === m.id ? ' selected' : '') + '>' + m.initial + ' — ' + m.role + '</option>';
  }).join('');
  const priorities = [{v:'red',l:'Do Now'},{v:'amber',l:'Delegate'},{v:'yellow',l:'Delegate'},{v:'blue',l:'Schedule'},{v:'green',l:'Do Last'}];
  const priorityOpts = priorities.map(function(p){
    return '<option value="' + p.v + '"' + (task.priority === p.v ? ' selected' : '') + '>' + p.l + '</option>';
  }).join('');
  const daysVal = Math.max(1, Math.ceil((new Date(task.dueDate) - new Date()) / 86400000));

  openModal(
    '<div class="modal-title">Edit Task</div>'
    + '<div class="modal-sub">Changes saved immediately.</div>'
    + '<div class="form-grid" style="gap:12px">'
      + '<div class="form-group" style="grid-column:1/-1"><label>Title *</label><input id="et-title" value="' + (task.title||'').replace(/"/g,'&quot;') + '"/></div>'
      + '<div class="form-group" style="grid-column:1/-1"><label>Description</label><textarea id="et-note">' + (task.note||'').replace(/</g,'&lt;') + '</textarea></div>'
      + '<div class="form-group"><label>Phase</label><input id="et-phase" value="' + (task.phase||'') + '"/></div>'
      + '<div class="form-group"><label>Due in days (from today)</label><input id="et-days" type="number" value="' + daysVal + '" min="1"/></div>'
      + '<div class="form-group"><label>Assigned to</label><select id="et-assign">' + memberOpts + '</select></div>'
      + '<div class="form-group"><label>Priority</label><select id="et-priority">' + priorityOpts + '</select></div>'
    + '</div>',
    function(){ tbSaveEditTask(id); }, 'Save Changes');
}

function tbSaveEditTask(id){
  const tasks = getTasks();
  const task = tasks.find(function(t){ return t.id === id; });
  if(!task) return;
  task.title      = (document.getElementById('et-title')  ? document.getElementById('et-title').value  : '').trim() || task.title;
  task.note       = (document.getElementById('et-note')   ? document.getElementById('et-note').value   : '').trim();
  task.phase      = (document.getElementById('et-phase')  ? document.getElementById('et-phase').value  : '').trim() || task.phase;
  task.assignedTo = document.getElementById('et-assign')  ? document.getElementById('et-assign').value  : task.assignedTo;
  task.priority   = document.getElementById('et-priority')? document.getElementById('et-priority').value: task.priority;
  const days = parseInt(document.getElementById('et-days') ? document.getElementById('et-days').value : '7') || 7;
  task.dueDate = new Date(Date.now() + days * 86400000).toISOString();
  saveTask(task);
  closeModal();
  buildBoardTB(); buildStatsTB();
  toast('Task updated');
}

/* ══ DELETE ══ */
function tbDeleteTask(id){
  if(!confirm('Delete this task?')) return;
  deleteTask(id);
  buildBoardTB(); buildStatsTB(); buildPipelineTB();
  toast('Task deleted', 'err');
}

/* ══ DELEGATE ══ */
function tbDelegateTask(id){
  const task = getTasks().find(function(t){ return t.id === id; });
  if(!task) return;
  const members = getActiveMembers().filter(function(m){ return m.id !== task.assignedTo; });
  const memberOpts = members.map(function(m){
    return '<option value="' + m.id + '">' + m.initial + ' — ' + m.role + '</option>';
  }).join('');
  openModal(
    '<div class="modal-title">Delegate Task</div>'
    + '<div class="modal-sub">"' + (task.title||'').replace(/"/g,'&quot;') + '"</div>'
    + '<div class="form-grid" style="gap:12px">'
      + '<div class="form-group"><label>Delegate to</label><select id="del-to">' + memberOpts + '</select></div>'
      + '<div class="form-group"><label>Reason</label><select id="del-reason"><option value="More suitable to them">More suitable to them</option><option value="Overloaded">Overloaded</option><option value="other">Other</option></select></div>'
    + '</div>',
    function(){ tbSaveDelegate(id); }, 'Delegate');
}

function tbSaveDelegate(id){
  const task = getTasks().find(function(t){ return t.id === id; });
  if(!task) return;
  const from   = task.assignedTo;
  const to     = document.getElementById('del-to')     ? document.getElementById('del-to').value     : '';
  const reason = document.getElementById('del-reason') ? document.getElementById('del-reason').value : '';
  task.remark      = 'Delegated by ' + from + ' — ' + reason;
  task.delegatedBy = from;
  task.assignedTo  = to;
  saveTask(task);
  closeModal();
  buildBoardTB();
  toast('Delegated to ' + to, 'info');
}
