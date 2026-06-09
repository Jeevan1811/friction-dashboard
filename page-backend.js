/* ═══════════════════════════════════════════
   PAGE-BACKEND.JS
   System <> Creator interface
   Roles, keywords, members, templates,
   company info, doc types, system tasks
═══════════════════════════════════════════ */

let backendTab='tasks'; // 'tasks'|'company'|'members'|'roles'|'keywords'|'templates'|'doctypes'

function renderBackend(){
  const wrap=document.getElementById('be-content'); if(!wrap) return;
  refreshBackendTasks();

  const tabs=[
    {id:'tasks',    label:'System Tasks',    icon:'⚙️'},
    {id:'company',  label:'Company Info',    icon:'🏢'},
    {id:'members',  label:'Members',         icon:'👥'},
    {id:'roles',    label:'Roles & Responsibilities', icon:'📋'},
    {id:'keywords', label:'Keyword Mapping', icon:'🔑'},
    {id:'templates',label:'Templates',       icon:'📁'},
    {id:'doctypes', label:'Doc Types',       icon:'📄'},
  ];

  wrap.innerHTML=`
    <div class="page-header" style="border:none;padding-top:20px;">
      <div>
        <div class="page-title">Backend</div>
        <div class="page-sub">System interface — give the system what it needs to run automatically</div>
      </div>
    </div>
    <div style="padding:0 36px;display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--border);padding-bottom:0;margin-bottom:0;">
      ${tabs.map(t=>`<button class="nav-btn${backendTab===t.id?' active':''}" style="border-radius:6px 6px 0 0;border-bottom:none;margin-bottom:-1px;" onclick="switchBETab('${t.id}')">${t.icon} ${t.label}</button>`).join('')}
    </div>
    <div style="padding:24px 36px 0;" id="be-tab-content"></div>`;

  renderBETab(backendTab);
}

function switchBETab(tab){
  backendTab=tab;
  document.querySelectorAll('#be-content .nav-btn').forEach(b=>b.classList.toggle('active',b.textContent.includes(
    {tasks:'System',company:'Company',members:'Members',roles:'Roles',keywords:'Keyword',templates:'Templates',doctypes:'Doc Types'}[tab]||''
  )));
  renderBETab(tab);
}

function renderBETab(tab){
  const wrap=document.getElementById('be-tab-content'); if(!wrap) return;
  if(tab==='tasks')     renderBESystemTasks(wrap);
  else if(tab==='company')   renderBECompany(wrap);
  else if(tab==='members')   renderBEMembers(wrap);
  else if(tab==='roles')     renderBERoles(wrap);
  else if(tab==='keywords')  renderBEKeywords(wrap);
  else if(tab==='templates') renderBETemplates(wrap);
  else if(tab==='doctypes')  renderBEDocTypes(wrap);
}

/* ── SYSTEM TASKS ── */
function renderBESystemTasks(wrap){
  const tasks=DB.get(SK.backendTasks)||[];
  const pending=tasks.filter(t=>!t.done);
  const done=tasks.filter(t=>t.done);
  wrap.innerHTML=`
    <div class="section-title">PENDING — System needs your action (${pending.length})</div>
    ${pending.length===0?'<div class="muted mono text-sm">All clear. System has everything it needs.</div>':''}
    ${pending.map(t=>`
      <div class="system-task">
        <div class="system-task-info">
          <div class="system-task-title">${t.title}</div>
          <div class="system-task-note">${t.note}</div>
        </div>
        <button class="btn sm primary" onclick="beDismissSystemTask('${t.id}')">Mark done</button>
      </div>`).join('')}
    ${done.length?`
      <div class="section-title mt-20">COMPLETED (${done.length})</div>
      ${done.map(t=>`
        <div class="system-task" style="opacity:0.5">
          <div class="system-task-info"><div class="system-task-title">✓ ${t.title}</div></div>
        </div>`).join('')}`:''}`;
}

function beDismissSystemTask(id){
  const tasks=DB.get(SK.backendTasks)||[];
  const t=tasks.find(x=>x.id===id); if(t) t.done=true;
  DB.set(SK.backendTasks,tasks);
  renderBETab('tasks');
  toast('Marked as done');
}

/* ── COMPANY INFO ── */
function renderBECompany(wrap){
  const c=DB.get(SK.company)||DEFAULT_COMPANY;
  wrap.innerHTML=`
    <div class="section-title">COMPANY INFORMATION — used in all generated documents</div>
    <div class="card" style="max-width:600px;">
      <div class="form-grid wide" style="gap:14px;">
        ${beField('company-name','Company Name',c.name)}
        ${beField('company-reg','SSM Registration',c.reg)}
        ${beField('company-address','Address',c.address)}
        ${beField('company-email','Email',c.email)}
        ${beField('company-phone','Phone',c.phone)}
        ${beField('company-bank','Bank Name',c.bank||'')}
        ${beField('company-accountNo','Account Number',c.accountNo||'')}
      </div>
      <button class="btn primary mt-20" onclick="beSaveCompany()">Save Company Info</button>
    </div>`;
}

function beField(id,label,value){
  return `<div class="form-group"><label>${label}</label><input id="${id}" value="${value||''}" placeholder="${label}" /></div>`;
}

function beSaveCompany(){
  const get=id=>document.getElementById(id)?.value?.trim()||'';
  const c={
    name:get('company-name'), reg:get('company-reg'), address:get('company-address'),
    email:get('company-email'), phone:get('company-phone'),
    bank:get('company-bank'), accountNo:get('company-accountNo'),
  };
  DB.set(SK.company,c);
  refreshBackendTasks();
  toast('Company info saved');
}

/* ── MEMBERS ── */
function renderBEMembers(wrap){
  const members=DB.get(SK.members)||DEFAULT_MEMBERS;
  wrap.innerHTML=`
    <div class="section-title">TEAM MEMBERS — add new members as the team grows</div>
    <div class="grid-2" id="be-members-list"></div>
    <button class="btn primary mt-20" onclick="beAddMemberModal()">+ Add New Member</button>`;
  const list=document.getElementById('be-members-list');
  members.forEach(m=>{
    const card=document.createElement('div');
    card.className='card';
    card.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="tag" style="font-size:14px;padding:6px 12px;">${m.initial}</span>
          <div>
            <div style="font-weight:700;">${m.name}</div>
            <div class="muted mono text-xs">${m.role}</div>
          </div>
        </div>
        ${m.isFounder?'<span class="mono text-xs muted">Founder</span>':'<button class="btn sm danger" onclick="beRemoveMember(\''+m.id+'\')">Remove</button>'}
      </div>
      <div class="form-grid" style="gap:10px;">
        <div class="form-group"><label>Name</label><input id="bm-name-${m.id}" value="${m.name}" /></div>
        <div class="form-group"><label>Role title</label><input id="bm-role-${m.id}" value="${m.role}" /></div>
        <div class="form-group"><label>Email</label><input id="bm-email-${m.id}" value="${m.email||''}" /></div>
        <div class="form-group"><label>Phone</label><input id="bm-phone-${m.id}" value="${m.phone||''}" /></div>
      </div>
      <button class="btn sm primary mt-12" onclick="beSaveMember('${m.id}')">Save</button>`;
    list.appendChild(card);
  });
}

function beSaveMember(id){
  const members=DB.get(SK.members)||DEFAULT_MEMBERS;
  const m=members.find(x=>x.id===id); if(!m) return;
  m.name  =document.getElementById(`bm-name-${id}`)?.value?.trim()||m.name;
  m.role  =document.getElementById(`bm-role-${id}`)?.value?.trim()||m.role;
  m.email =document.getElementById(`bm-email-${id}`)?.value?.trim()||'';
  m.phone =document.getElementById(`bm-phone-${id}`)?.value?.trim()||'';
  DB.set(SK.members,members);
  toast(`${m.initial} updated`);
}

function beRemoveMember(id){
  if(!confirm('Remove this member?')) return;
  const members=(DB.get(SK.members)||DEFAULT_MEMBERS).filter(m=>m.id!==id);
  DB.set(SK.members,members);
  renderBEMembers(document.getElementById('be-tab-content'));
  toast('Member removed');
}

function beAddMemberModal(){
  openModal(`
    <div class="modal-title">Add New Member</div>
    <div class="modal-sub">New member will be available in all task assignment and analytics.</div>
    <div class="form-grid" style="gap:12px">
      <div class="form-group"><label>Initial / Tag (1-2 chars) *</label><input id="nm-initial" placeholder="e.g. S" maxlength="2" /></div>
      <div class="form-group"><label>Full Name *</label><input id="nm-name" placeholder="e.g. Sarah" /></div>
      <div class="form-group"><label>Role Title *</label><input id="nm-role" placeholder="e.g. Head of Marketing" /></div>
      <div class="form-group"><label>Email</label><input id="nm-email" placeholder="email@company.com" /></div>
      <div class="form-group"><label>Phone</label><input id="nm-phone" placeholder="+60 1X-XXXXXXX" /></div>
    </div>`,beConfirmAddMember,'Add Member');
}

function beConfirmAddMember(){
  const initial=document.getElementById('nm-initial')?.value?.trim().toUpperCase();
  const name=document.getElementById('nm-name')?.value?.trim();
  const role=document.getElementById('nm-role')?.value?.trim();
  if(!initial||!name||!role){toast('Initial, name, and role are required','err');return;}
  const members=DB.get(SK.members)||DEFAULT_MEMBERS;
  if(members.find(m=>m.id===initial)){toast('Initial already in use','err');return;}
  const newMember={id:initial,initial,name,role,
    email:document.getElementById('nm-email')?.value?.trim()||'',
    phone:document.getElementById('nm-phone')?.value?.trim()||'',
    active:true,isFounder:false
  };
  members.push(newMember);
  DB.set(SK.members,members);
  // Add role slot
  const roles=DB.get(SK.roles)||DEFAULT_ROLES;
  roles.push({memberId:initial,responsibilities:''});
  DB.set(SK.roles,roles);
  closeModal();
  renderBEMembers(document.getElementById('be-tab-content'));
  toast(`${name} added to team`);
}

/* ── ROLES & RESPONSIBILITIES ── */
function renderBERoles(wrap){
  const members=DB.get(SK.members)||DEFAULT_MEMBERS;
  const roles=DB.get(SK.roles)||DEFAULT_ROLES;
  wrap.innerHTML=`
    <div class="section-title">ROLES & RESPONSIBILITIES — used by auto-assign engine</div>
    <div class="muted mono text-xs mb-16">Fill in each member's responsibilities. More detail = better auto-assignment accuracy.</div>
    <div class="grid-2">
      ${members.filter(m=>m.active).map(m=>{
        const r=roles.find(x=>x.memberId===m.id)||{responsibilities:''};
        return `<div class="card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <span class="tag">${m.initial}</span>
            <div><div style="font-weight:700">${m.name}</div><div class="muted mono text-xs">${m.role}</div></div>
          </div>
          <div class="form-group">
            <label>Responsibilities (comma-separated or freetext)</label>
            <textarea id="role-${m.id}" placeholder="e.g. invoicing, client relations, tax, contracts, payments, SSM...">${r.responsibilities||''}</textarea>
          </div>
          <button class="btn sm primary mt-8" onclick="beSaveRole('${m.id}')">Save</button>
        </div>`;
      }).join('')}
    </div>`;
}

function beSaveRole(memberId){
  const roles=DB.get(SK.roles)||DEFAULT_ROLES;
  let r=roles.find(x=>x.memberId===memberId);
  if(!r){r={memberId,responsibilities:''};roles.push(r);}
  r.responsibilities=document.getElementById(`role-${memberId}`)?.value?.trim()||'';
  DB.set(SK.roles,roles);
  toast(`Role saved for ${memberId}`);
}

/* ── KEYWORD MAPPING ── */
function renderBEKeywords(wrap){
  const keywords=DB.get(SK.keywords)||DEFAULT_KEYWORDS;
  const members=getActiveMembers();
  const memberOpts=members.map(m=>`<option value="${m.id}">${m.initial}</option>`).join('');
  wrap.innerHTML=`
    <div class="section-title">KEYWORD → MEMBER MAPPING — teaches the auto-assign engine</div>
    <div class="muted mono text-xs mb-16">When a task title or description contains a keyword, it routes to the mapped member.</div>
    <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
      <input id="new-kw" placeholder="New keyword" style="padding:8px 12px;border-radius:7px;border:1px solid var(--border);background:var(--bg);font-family:var(--font-mono);font-size:13px;width:180px;" />
      <select id="new-kw-member" style="padding:8px 12px;border-radius:7px;border:1px solid var(--border);background:var(--bg);font-family:var(--font-mono);font-size:13px;">${memberOpts}</select>
      <input id="new-kw-reason" placeholder="Reason (optional)" style="padding:8px 12px;border-radius:7px;border:1px solid var(--border);background:var(--bg);font-family:var(--font-mono);font-size:13px;flex:1;min-width:160px;" />
      <button class="btn primary" onclick="beAddKeyword()">+ Add</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;" id="kw-list">
      ${keywords.map((kw,i)=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;flex-wrap:wrap;">
          <span class="mono text-sm" style="min-width:120px;font-weight:600;">${kw.keyword}</span>
          <span class="tag">${kw.member}</span>
          <span class="muted mono text-xs flex:1">${kw.reason||''}</span>
          <button class="task-btn del" onclick="beDeleteKeyword(${i})">✕</button>
        </div>`).join('')}
    </div>`;
}

function beAddKeyword(){
  const kw=document.getElementById('new-kw')?.value?.trim().toLowerCase();
  const member=document.getElementById('new-kw-member')?.value;
  const reason=document.getElementById('new-kw-reason')?.value?.trim()||'';
  if(!kw||!member){toast('Keyword and member required','err');return;}
  const keywords=DB.get(SK.keywords)||DEFAULT_KEYWORDS;
  if(keywords.find(k=>k.keyword===kw)){toast('Keyword already exists','err');return;}
  keywords.push({keyword:kw,member,reason});
  DB.set(SK.keywords,keywords);
  renderBEKeywords(document.getElementById('be-tab-content'));
  toast('Keyword added');
}

function beDeleteKeyword(i){
  const keywords=DB.get(SK.keywords)||DEFAULT_KEYWORDS;
  keywords.splice(i,1);
  DB.set(SK.keywords,keywords);
  renderBEKeywords(document.getElementById('be-tab-content'));
  toast('Keyword removed');
}

/* ── TEMPLATES ── */
function renderBETemplates(wrap){
  const templates=DB.get(SK.templates)||{};
  const clients=getClients();
  wrap.innerHTML=`
    <div class="section-title">INVOICE TEMPLATES — one per client, Excel format</div>
    <div class="muted mono text-xs mb-16">Upload an Excel template for each client. The system reads the structure and uses it when generating invoices.</div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${clients.map(c=>{
        const has=!!templates[c.id];
        return `<div class="card" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div>
            <div style="font-weight:700;">${c.pinned?'★ ':''}${c.name}</div>
            <div class="muted mono text-xs">${has?'✓ Template uploaded · '+formatDate(templates[c.id].uploaded):'No template — using default layout'}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            ${has?`<button class="btn sm danger" onclick="beDeleteTemplate('${c.id}')">Remove</button>`:''}
            <label class="btn sm primary" style="cursor:pointer;">
              ${has?'Replace':'Upload Excel'}
              <input type="file" accept=".xlsx,.xls,.csv" style="display:none;" onchange="beUploadTemplate(event,'${c.id}','${c.name}')" />
            </label>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function beUploadTemplate(event, clientId, clientName){
  const file=event.target.files?.[0]; if(!file) return;
  // Migration stub: replace with actual file upload to storage
  // For prototype: store file name and metadata only
  const templates=DB.get(SK.templates)||{};
  templates[clientId]={
    filename:file.name, size:file.size,
    uploaded:isoNow(), clientId, clientName,
    // Migration: store actual file reference/URL here
  };
  DB.set(SK.templates,templates);
  refreshBackendTasks();
  renderBETemplates(document.getElementById('be-tab-content'));
  toast(`Template uploaded for ${clientName}`);
}

function beDeleteTemplate(clientId){
  if(!confirm('Remove this template?')) return;
  const templates=DB.get(SK.templates)||{};
  delete templates[clientId];
  DB.set(SK.templates,templates);
  refreshBackendTasks();
  renderBETemplates(document.getElementById('be-tab-content'));
  toast('Template removed');
}

/* ── DOC TYPES ── */
function renderBEDocTypes(wrap){
  const docTypes=DB.get(SK.docTypes)||DEFAULT_DOC_TYPES;
  wrap.innerHTML=`
    <div class="section-title">DOCUMENT TYPES — shown on the Docs page</div>
    <div class="muted mono text-xs mb-16">Add, remove, or rename document types. Active types appear on the Docs page.</div>
    <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
      <input id="new-dt-icon" placeholder="Emoji icon" style="padding:8px 10px;border-radius:7px;border:1px solid var(--border);background:var(--bg);font-size:18px;width:60px;" maxlength="2" />
      <input id="new-dt-name" placeholder="Document type name" style="padding:8px 12px;border-radius:7px;border:1px solid var(--border);background:var(--bg);font-family:var(--font-mono);font-size:13px;flex:1;min-width:180px;" />
      <button class="btn primary" onclick="beAddDocType()">+ Add</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${docTypes.map((dt,i)=>`
        <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;flex-wrap:wrap;">
          <span style="font-size:20px;">${dt.icon}</span>
          <input value="${dt.name}" id="dt-name-${i}" style="padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:var(--bg);font-family:var(--font-mono);font-size:13px;flex:1;min-width:140px;" />
          <label style="display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:12px;cursor:pointer;">
            <input type="checkbox" ${dt.active?'checked':''} onchange="beToggleDocType(${i},this.checked)" /> Active
          </label>
          <button class="task-btn edit" onclick="beRenameDocType(${i})">Save name</button>
          <button class="task-btn del" onclick="beDeleteDocType(${i})">✕</button>
        </div>`).join('')}
    </div>`;
}

function beAddDocType(){
  const icon=document.getElementById('new-dt-icon')?.value?.trim()||'📄';
  const name=document.getElementById('new-dt-name')?.value?.trim();
  if(!name){toast('Name required','err');return;}
  const docTypes=DB.get(SK.docTypes)||DEFAULT_DOC_TYPES;
  docTypes.push({id:genId('dt'),name,icon,active:true});
  DB.set(SK.docTypes,docTypes);
  renderBEDocTypes(document.getElementById('be-tab-content'));
  toast('Doc type added');
}

function beRenameDocType(i){
  const docTypes=DB.get(SK.docTypes)||DEFAULT_DOC_TYPES;
  const name=document.getElementById(`dt-name-${i}`)?.value?.trim();
  if(name) docTypes[i].name=name;
  DB.set(SK.docTypes,docTypes);
  toast('Name updated');
}

function beToggleDocType(i,val){
  const docTypes=DB.get(SK.docTypes)||DEFAULT_DOC_TYPES;
  docTypes[i].active=val;
  DB.set(SK.docTypes,docTypes);
}

function beDeleteDocType(i){
  if(!confirm('Delete this doc type?')) return;
  const docTypes=DB.get(SK.docTypes)||DEFAULT_DOC_TYPES;
  docTypes.splice(i,1);
  DB.set(SK.docTypes,docTypes);
  renderBEDocTypes(document.getElementById('be-tab-content'));
  toast('Removed');
}
