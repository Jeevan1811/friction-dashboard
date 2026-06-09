/* ═══════════════════════════════════════════
   PAGE-CLIENTS.JS
   Client list > Client detail > Tasks
   Auto-assign + auto-priority (client overrides)
   Delegate + Edit + colour+member combined filter
═══════════════════════════════════════════ */

let clientView = 'list';   // 'list' | 'detail'
let activeClientId = null;
let clMemberFilter = 'ALL';
let clColourFilter = 'ALL';

function renderClients(){
  if(clientView==='list')   renderClientList();
  else if(clientView==='detail') renderClientDetail(activeClientId);
}

/* ── CLIENT LIST ── */
function renderClientList(){
  clientView='list';
  const wrap=document.getElementById('cl-content'); if(!wrap) return;
  const clients=getClients();
  const pinned=clients.filter(c=>c.pinned);
  const others=clients.filter(c=>!c.pinned);
  const sorted=[...pinned,...others];

  wrap.innerHTML=`
    <div class="page-header" style="border:none;padding-top:20px;">
      <div>
        <div class="page-title">Clients</div>
        <div class="page-sub">Select a client to view tasks and documents</div>
      </div>
      <button class="btn primary" onclick="openAddClientModal()">+ Add Client</button>
    </div>
    <div class="section">
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${sorted.map(c=>`
          <div class="client-row${c.pinned?' pinned':''}" onclick="openClientDetail('${c.id}')">
            <div>
              <div class="client-name">${c.pinned?'★ ':''}${c.name}</div>
              <div class="client-pic mono text-xs muted">PIC: ${c.pic||'—'} · ${c.industry||'—'}</div>
            </div>
            <div class="client-meta">
              ${planBadge(c.plan)}
              <span class="mono text-xs muted">${getClientTasks(c.id).length} tasks</span>
              <button class="btn sm" onclick="event.stopPropagation();openEditClientModal('${c.id}')">Edit</button>
              ${!c.pinned?`<button class="btn sm danger" onclick="event.stopPropagation();removeClient('${c.id}')">Delete</button>`:''}
            </div>
          </div>`).join('')}
        ${sorted.length===0?'<div class="muted mono text-sm" style="padding:20px 0">No clients yet. Add your first client above.</div>':''}
      </div>
    </div>`;
}

/* ── CLIENT DETAIL ── */
function openClientDetail(clientId){
  clientView='detail';
  activeClientId=clientId;
  clMemberFilter='ALL';
  clColourFilter='ALL';
  renderClientDetail(clientId);
}

function renderClientDetail(clientId){
  const wrap=document.getElementById('cl-content'); if(!wrap) return;
  const client=getClients().find(c=>c.id===clientId);
  if(!client){renderClientList();return;}
  const tasks=getClientTasks(clientId);

  // Sort: high first, then med, then others
  const order={high:0,med:1,red:2,yellow:3,blue:4,green:5};
  const sorted=[...tasks].sort((a,b)=>(order[a.priority]||9)-(order[b.priority]||9));

  wrap.innerHTML=`
    <div class="breadcrumb">
      <span onclick="renderClientList()">Clients</span>
      <span class="breadcrumb-sep">›</span>
      <span class="active">${client.name}</span>
    </div>
    <div class="page-header" style="border:none;padding-top:16px;">
      <div>
        <div class="page-title">${client.name}</div>
        <div class="page-sub">PIC: ${client.pic||'—'} · ${client.industry||'—'} · ${planBadge(client.plan)}</div>
      </div>
      <button class="btn primary" onclick="openAddClientTaskModal('${clientId}')">+ Add Task</button>
    </div>
    <div class="stats-row" id="cl-stats"></div>

    <div class="filters-row" id="cl-filters">
      <button class="filt-btn active" data-mf="ALL" onclick="setCLMember('ALL')">All</button>
      ${getActiveMembers().map(m=>`<button class="filt-btn" data-mf="${m.id}" onclick="setCLMember('${m.id}')">${m.initial}</button>`).join('')}
      <div class="filter-sep"></div>
      <button class="filt-btn" data-cf="high" onclick="setCLColour('high')"><span class="pdot high" style="display:inline-block;margin-right:4px"></span>Top</button>
      <button class="filt-btn" data-cf="med"  onclick="setCLColour('med')"><span class="pdot med"  style="display:inline-block;margin-right:4px"></span>Important</button>
    </div>

    <div class="section" id="cl-tasks-wrap">
      <div class="grid-auto" id="cl-task-grid"></div>
    </div>`;

  buildCLStats(tasks);
  buildCLTaskGrid(sorted, clientId);
}

function buildCLStats(tasks){
  const wrap=document.getElementById('cl-stats'); if(!wrap) return;
  const done=tasks.filter(t=>t.done).length;
  const high=tasks.filter(t=>t.priority==='high').length;
  const med =tasks.filter(t=>t.priority==='med').length;
  wrap.innerHTML=`
    <div class="stat-card"><div class="stat-num">${tasks.length}</div><div class="stat-label">total tasks</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--green)">${done}</div><div class="stat-label">done</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--p-high)">${high}</div><div class="stat-label">top priority</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--p-med)">${med}</div><div class="stat-label">important</div></div>`;
}

function buildCLTaskGrid(tasks, clientId){
  const grid=document.getElementById('cl-task-grid'); if(!grid) return;
  if(!tasks.length){
    grid.innerHTML='<div class="muted mono text-sm" style="padding:20px 0">No tasks yet. Add the first task above.</div>';
    return;
  }
  grid.innerHTML='';
  tasks.forEach(task=>{
    const card=buildCLTaskCard(task, clientId);
    grid.appendChild(card);
  });
  applyCLFilters();
}

function buildCLTaskCard(task, clientId){
  const dl=daysLeft(task.dueDate);
  let dlClass='ok',dlText=`${dl}d left`;
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
      <div class="task-check${task.done?' checked':''}" onclick="clToggleDone('${task.id}','${clientId}',this)"></div>
      <div class="task-title">${task.title}</div>
      ${priorityTag(task.priority)}
    </div>
    <div class="task-note">${task.note||''}</div>
    <div class="task-meta">
      <div class="task-tags">${memberTag(task.assignedTo)}</div>
      <div class="task-time">Due ${formatDate(task.dueDate)} <span class="dl ${dlClass}">${dlText}</span></div>
    </div>
    <div class="task-actions">
      <button class="task-btn edit" onclick="clEditTask('${task.id}','${clientId}')">✏️ Edit</button>
      <button class="task-btn delegate" onclick="clDelegateTask('${task.id}','${clientId}')">↗ Delegate</button>
      <button class="task-btn del" onclick="clDeleteTask('${task.id}','${clientId}')">✕</button>
    </div>
    ${task.remark?`<div class="task-remark">${task.remark}${task.delegatedBy?' · Delegated by '+task.delegatedBy:''}</div>`:''}`;
  return card;
}

/* ── CLIENT FILTERS ── */
function setCLMember(m){
  clMemberFilter=m;
  document.querySelectorAll('#cl-filters .filt-btn[data-mf]').forEach(b=>b.classList.toggle('active',b.dataset.mf===m));
  applyCLFilters();
}
function setCLColour(c){
  clColourFilter = clColourFilter===c ? 'ALL' : c;
  document.querySelectorAll('#cl-filters .filt-btn[data-cf]').forEach(b=>b.classList.toggle('active',b.dataset.cf===clColourFilter));
  applyCLFilters();
}
function applyCLFilters(){
  document.querySelectorAll('#cl-task-grid .task-card').forEach(card=>{
    const mm = clMemberFilter==='ALL' || card.dataset.assigned===clMemberFilter;
    const mc = clColourFilter==='ALL'  || card.dataset.p===clColourFilter;
    card.classList.toggle('hidden',!(mm&&mc));
  });
}

/* ── TOGGLE DONE ── */
function clToggleDone(taskId, clientId, el){
  const tasks=DB.get(SK.clientTasks)||[];
  const t=tasks.find(x=>x.id===taskId); if(!t) return;
  t.done=!t.done; DB.set(SK.clientTasks,tasks);
  el.classList.toggle('checked');
  el.closest('.task-card')?.classList.toggle('done');
  buildCLStats(getClientTasks(clientId));
}

/* ── ADD CLIENT TASK ── */
function openAddClientTaskModal(clientId){
  const members=getActiveMembers();
  const memberOpts=members.map(m=>`<option value="${m.id}">${m.initial} — ${m.role}</option>`).join('');
  openModal(`
    <div class="modal-title">Add Client Task</div>
    <div class="modal-sub">System auto-assigns to best member. Client tasks always top priority.</div>
    <div class="form-grid" style="gap:12px">
      <div class="form-group" style="grid-column:1/-1">
        <label>Task title *</label>
        <input id="ct-title" placeholder="e.g. Send invoice for March" />
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label>Description</label>
        <textarea id="ct-note" placeholder="Detail helps the system assign correctly..."></textarea>
      </div>
      <div class="form-group">
        <label>Due in (days)</label>
        <input id="ct-days" type="number" placeholder="3" min="1" />
      </div>
      <div class="form-group">
        <label>Override assignee</label>
        <select id="ct-assign"><option value="">Auto-assign</option>${memberOpts}</select>
      </div>
      <div class="form-group">
        <label>Priority</label>
        <select id="ct-priority">
          <option value="">Auto (client = top)</option>
          <option value="high">Top Priority</option>
          <option value="med">Important</option>
        </select>
      </div>
    </div>`,()=>clSaveNewTask(clientId),'Add Task');
}

function clSaveNewTask(clientId){
  const title=document.getElementById('ct-title')?.value?.trim();
  if(!title){toast('Title required','err');return;}
  const note     =document.getElementById('ct-note')?.value?.trim()||'';
  const days     =parseInt(document.getElementById('ct-days')?.value)||3;
  const overA    =document.getElementById('ct-assign')?.value;
  const overP    =document.getElementById('ct-priority')?.value;
  const {assignedTo,confidence}=autoAssign(title,note);
  const finalAssign   =overA||assignedTo;
  const finalPriority =overP||autoPriority(title,note,'client');
  const remark=overA?`Manually assigned to ${overA}`:`Auto assigned by system${confidence===0?' (defaulted)':''}`;
  const task={
    id:genId('ct'),clientId,title,note,
    assignedTo:finalAssign,priority:finalPriority,
    dueDate:new Date(Date.now()+days*86400000).toISOString(),
    done:false,remark,created:isoNow(),delegatedBy:null,
  };
  saveClientTask(task);
  closeModal();
  renderClientDetail(clientId);
  toast(`Task added → ${finalAssign}`);
}

/* ── EDIT CLIENT TASK ── */
function clEditTask(taskId, clientId){
  const tasks=DB.get(SK.clientTasks)||[];
  const task=tasks.find(t=>t.id===taskId); if(!task) return;
  const members=getActiveMembers();
  const memberOpts=members.map(m=>`<option value="${m.id}" ${task.assignedTo===m.id?'selected':''}>${m.initial} — ${m.role}</option>`).join('');
  const pOpts=['high','med'].map(p=>`<option value="${p}" ${task.priority===p?'selected':''}>${p}</option>`).join('');
  const daysVal=Math.max(1,Math.ceil((new Date(task.dueDate)-new Date())/86400000));
  openModal(`
    <div class="modal-title">Edit Client Task</div>
    <div class="form-grid" style="gap:12px">
      <div class="form-group" style="grid-column:1/-1">
        <label>Title</label><input id="ect-title" value="${task.title}" />
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label>Description</label><textarea id="ect-note">${task.note||''}</textarea>
      </div>
      <div class="form-group">
        <label>Due in days</label><input id="ect-days" type="number" value="${daysVal}" min="1" />
      </div>
      <div class="form-group">
        <label>Assigned to</label><select id="ect-assign">${memberOpts}</select>
      </div>
      <div class="form-group">
        <label>Priority</label><select id="ect-priority">${pOpts}</select>
      </div>
    </div>`,()=>clSaveEditTask(taskId,clientId),'Save');
}

function clSaveEditTask(taskId,clientId){
  const tasks=DB.get(SK.clientTasks)||[];
  const task=tasks.find(t=>t.id===taskId); if(!task) return;
  task.title     =document.getElementById('ect-title')?.value?.trim()||task.title;
  task.note      =document.getElementById('ect-note')?.value?.trim()||'';
  task.assignedTo=document.getElementById('ect-assign')?.value||task.assignedTo;
  task.priority  =document.getElementById('ect-priority')?.value||task.priority;
  const days=parseInt(document.getElementById('ect-days')?.value)||3;
  task.dueDate=new Date(Date.now()+days*86400000).toISOString();
  DB.set(SK.clientTasks,tasks);
  closeModal();
  renderClientDetail(clientId);
  toast('Task updated');
}

/* ── DELETE CLIENT TASK ── */
function clDeleteTask(taskId,clientId){
  if(!confirm('Delete this task?')) return;
  deleteClientTask(taskId);
  renderClientDetail(clientId);
  toast('Task deleted');
}

/* ── DELEGATE CLIENT TASK ── */
function clDelegateTask(taskId,clientId){
  const tasks=DB.get(SK.clientTasks)||[];
  const task=tasks.find(t=>t.id===taskId); if(!task) return;
  const members=getActiveMembers().filter(m=>m.id!==task.assignedTo);
  const memberOpts=members.map(m=>`<option value="${m.id}">${m.initial} — ${m.role}</option>`).join('');
  openModal(`
    <div class="modal-title">Delegate Task</div>
    <div class="modal-sub">"${task.title}"</div>
    <div class="form-grid" style="gap:12px">
      <div class="form-group"><label>Delegate to</label><select id="cdel-to">${memberOpts}</select></div>
      <div class="form-group"><label>Reason</label>
        <select id="cdel-reason">
          <option>More suitable to them</option>
          <option>I have too much work overload</option>
          <option value="other">Other (specify below)</option>
        </select>
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label>Custom reason</label><input id="cdel-custom" placeholder="Optional" />
      </div>
    </div>`,()=>clSaveDelegate(taskId,clientId),'Delegate');
}

function clSaveDelegate(taskId,clientId){
  const tasks=DB.get(SK.clientTasks)||[];
  const task=tasks.find(t=>t.id===taskId); if(!task) return;
  const from=task.assignedTo;
  const to=document.getElementById('cdel-to')?.value;
  const rs=document.getElementById('cdel-reason')?.value;
  const custom=document.getElementById('cdel-custom')?.value?.trim();
  const reason=rs==='other'&&custom?custom:rs;
  task.remark=`Delegated by ${from} — ${reason}`;
  task.delegatedBy=from; task.assignedTo=to;
  DB.set(SK.clientTasks,tasks);
  closeModal();
  renderClientDetail(clientId);
  toast(`Delegated to ${to}`);
}

/* ── ADD CLIENT MODAL ── */
function openAddClientModal(){
  openModal(`
    <div class="modal-title">Add Client</div>
    <div class="form-grid wide" style="gap:12px">
      <div class="form-group" style="grid-column:1/-1"><label>Company name *</label><input id="ac-name" placeholder="e.g. Premala ERA Com Construction" /></div>
      <div class="form-group"><label>SSM Registration No.</label><input id="ac-reg" placeholder="SSM-XXXXXXXX" /></div>
      <div class="form-group"><label>PIC Name</label><input id="ac-pic" placeholder="Person in charge" /></div>
      <div class="form-group"><label>PIC Contact</label><input id="ac-contact" placeholder="Phone or email" /></div>
      <div class="form-group"><label>Industry</label><input id="ac-ind" placeholder="e.g. Construction" /></div>
      <div class="form-group"><label>Billing Address</label><input id="ac-addr" placeholder="Address" /></div>
      <div class="form-group"><label>Pricing Plan</label>
        <select id="ac-plan">
          <option value="">Select plan</option>
          <option value="aluminium">Aluminium</option>
          <option value="copper">Copper</option>
          <option value="gold">Gold</option>
          <option value="obsidian">Obsidian</option>
        </select>
      </div>
      <div class="form-group" style="grid-column:1/-1"><label>Notes</label><textarea id="ac-notes" placeholder="Any notes about this client..."></textarea></div>
    </div>`,saveNewClient,'Add Client');
}

function saveNewClient(){
  const name=document.getElementById('ac-name')?.value?.trim();
  if(!name){toast('Company name required','err');return;}
  const client={
    id:genId('cl'), name,
    reg:document.getElementById('ac-reg')?.value?.trim()||'',
    pic:document.getElementById('ac-pic')?.value?.trim()||'',
    picContact:document.getElementById('ac-contact')?.value?.trim()||'',
    industry:document.getElementById('ac-ind')?.value?.trim()||'',
    address:document.getElementById('ac-addr')?.value?.trim()||'',
    plan:document.getElementById('ac-plan')?.value||'',
    notes:document.getElementById('ac-notes')?.value?.trim()||'',
    pinned:false, created:isoNow(),
  };
  saveClient(client);
  closeModal();
  renderClientList();
  toast(`Client "${name}" added`);
}

/* ── EDIT CLIENT MODAL ── */
function openEditClientModal(clientId){
  const client=getClients().find(c=>c.id===clientId); if(!client) return;
  openModal(`
    <div class="modal-title">Edit Client</div>
    <div class="form-grid wide" style="gap:12px">
      <div class="form-group" style="grid-column:1/-1"><label>Company name</label><input id="ec-name" value="${client.name}" /></div>
      <div class="form-group"><label>SSM Reg.</label><input id="ec-reg" value="${client.reg||''}" /></div>
      <div class="form-group"><label>PIC Name</label><input id="ec-pic" value="${client.pic||''}" /></div>
      <div class="form-group"><label>PIC Contact</label><input id="ec-contact" value="${client.picContact||''}" /></div>
      <div class="form-group"><label>Industry</label><input id="ec-ind" value="${client.industry||''}" /></div>
      <div class="form-group"><label>Address</label><input id="ec-addr" value="${client.address||''}" /></div>
      <div class="form-group"><label>Plan</label>
        <select id="ec-plan">
          <option value="">None</option>
          ${['aluminium','copper','gold','obsidian'].map(p=>`<option value="${p}" ${client.plan===p?'selected':''}>${p.charAt(0).toUpperCase()+p.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="grid-column:1/-1"><label>Notes</label><textarea id="ec-notes">${client.notes||''}</textarea></div>
    </div>`,()=>saveEditClient(clientId),'Save');
}

function saveEditClient(clientId){
  const client=getClients().find(c=>c.id===clientId); if(!client) return;
  client.name    =document.getElementById('ec-name')?.value?.trim()||client.name;
  client.reg     =document.getElementById('ec-reg')?.value?.trim()||'';
  client.pic     =document.getElementById('ec-pic')?.value?.trim()||'';
  client.picContact=document.getElementById('ec-contact')?.value?.trim()||'';
  client.industry=document.getElementById('ec-ind')?.value?.trim()||'';
  client.address =document.getElementById('ec-addr')?.value?.trim()||'';
  client.plan    =document.getElementById('ec-plan')?.value||'';
  client.notes   =document.getElementById('ec-notes')?.value?.trim()||'';
  saveClient(client);
  closeModal();
  renderClientList();
  toast('Client updated');
}

function removeClient(clientId){
  if(!confirm('Delete this client and all their tasks?')) return;
  deleteClient(clientId);
  DB.set(SK.clientTasks,(DB.get(SK.clientTasks)||[]).filter(t=>t.clientId!==clientId));
  renderClientList();
  toast('Client removed');
}
