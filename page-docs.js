/* ═══════════════════════════════════════════
   PAGE-DOCS.JS
   Document centre: Invoice, Quotation, etc.
   View existing | Create new (add or full edit)
   Auto invoice numbering, send as task to PIC
═══════════════════════════════════════════ */

let docsView='home';   // 'home'|'type'|'view-list'|'create-choose'|'create-form'|'edit-invoice'
let activeDocType=null;
let activeInvoiceId=null;
let invoiceDraftMode='add'; // 'add'|'full'

function renderDocs(){
  docsView='home';
  const wrap=document.getElementById('docs-content'); if(!wrap) return;
  const docTypes=(DB.get(SK.docTypes)||DEFAULT_DOC_TYPES).filter(d=>d.active);

  wrap.innerHTML=`
    <div class="page-header" style="border:none;padding-top:20px;">
      <div>
        <div class="page-title">Docs</div>
        <div class="page-sub">Invoice generation, templates, and all business documents</div>
      </div>
    </div>
    <div class="section">
      <div class="grid-auto">
        ${docTypes.map(dt=>`
          <div class="card" style="cursor:pointer;display:flex;align-items:center;gap:14px;" onclick="openDocType('${dt.id}')">
            <span style="font-size:28px;">${dt.icon}</span>
            <div>
              <div style="font-size:14px;font-weight:700;">${dt.name}</div>
              <div class="muted mono text-xs">${getDocCount(dt.id)} documents</div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function getDocCount(typeId){
  // For now only invoices are tracked; expand per doc type later
  if(typeId==='dt_inv') return (DB.get(SK.invoices)||[]).length;
  return 0;
}

/* ── OPEN DOC TYPE ── */
function openDocType(typeId){
  activeDocType=typeId;
  const wrap=document.getElementById('docs-content'); if(!wrap) return;
  const dt=(DB.get(SK.docTypes)||DEFAULT_DOC_TYPES).find(d=>d.id===typeId);
  if(!dt) return;

  wrap.innerHTML=`
    <div class="breadcrumb">
      <span onclick="renderDocs()">Docs</span>
      <span class="breadcrumb-sep">›</span>
      <span class="active">${dt.name}</span>
    </div>
    <div class="page-header" style="border:none;padding-top:16px;">
      <div>
        <div class="page-title">${dt.icon} ${dt.name}</div>
        <div class="page-sub">View existing or create a new ${dt.name.toLowerCase()}</div>
      </div>
    </div>
    <div class="section">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:500px;">
        <div class="card" style="cursor:pointer;text-align:center;padding:28px 20px;" onclick="docsViewList('${typeId}')">
          <div style="font-size:30px;margin-bottom:8px;">👁️</div>
          <div style="font-size:15px;font-weight:700;">View</div>
          <div class="muted mono text-xs">Browse existing ${dt.name.toLowerCase()}s</div>
        </div>
        <div class="card" style="cursor:pointer;text-align:center;padding:28px 20px;" onclick="docsCreateChoose('${typeId}')">
          <div style="font-size:30px;margin-bottom:8px;">✏️</div>
          <div style="font-size:15px;font-weight:700;">Create</div>
          <div class="muted mono text-xs">Generate a new ${dt.name.toLowerCase()}</div>
        </div>
      </div>
    </div>`;
}

/* ── VIEW LIST ── */
function docsViewList(typeId){
  const wrap=document.getElementById('docs-content'); if(!wrap) return;
  const dt=(DB.get(SK.docTypes)||DEFAULT_DOC_TYPES).find(d=>d.id===typeId);
  const clients=getClients();
  const pinned=clients.filter(c=>c.pinned);
  const others=clients.filter(c=>!c.pinned);
  const sorted=[...pinned,...others];

  wrap.innerHTML=`
    <div class="breadcrumb">
      <span onclick="renderDocs()">Docs</span>
      <span class="breadcrumb-sep">›</span>
      <span onclick="openDocType('${typeId}')">${dt?.name}</span>
      <span class="breadcrumb-sep">›</span>
      <span class="active">View</span>
    </div>
    <div class="page-header" style="border:none;padding-top:16px;">
      <div class="page-title">Select Client</div>
      <div class="page-sub">Choose a client to view their ${dt?.name?.toLowerCase()||'documents'}</div>
    </div>
    <div class="section">
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${sorted.map(c=>`
          <div class="client-row${c.pinned?' pinned':''}" onclick="docsViewClientDocs('${typeId}','${c.id}')">
            <div>
              <div class="client-name">${c.pinned?'★ ':''}${c.name}</div>
              <div class="muted mono text-xs">${getClientDocCount(typeId,c.id)} ${dt?.name?.toLowerCase()||'doc'}s</div>
            </div>
            ${planBadge(c.plan)}
          </div>`).join('')}
      </div>
    </div>`;
}

function getClientDocCount(typeId,clientId){
  if(typeId==='dt_inv') return getInvoices(clientId).length;
  return 0;
}

function docsViewClientDocs(typeId, clientId){
  if(typeId!=='dt_inv'){ toast('Only invoices fully implemented in prototype','err'); return; }
  const wrap=document.getElementById('docs-content'); if(!wrap) return;
  const dt=(DB.get(SK.docTypes)||DEFAULT_DOC_TYPES).find(d=>d.id===typeId);
  const client=getClients().find(c=>c.id===clientId);
  const invoices=getInvoices(clientId).sort((a,b)=>new Date(b.created)-new Date(a.created));

  wrap.innerHTML=`
    <div class="breadcrumb">
      <span onclick="renderDocs()">Docs</span>
      <span class="breadcrumb-sep">›</span>
      <span onclick="openDocType('${typeId}')">${dt?.name}</span>
      <span class="breadcrumb-sep">›</span>
      <span onclick="docsViewList('${typeId}')">View</span>
      <span class="breadcrumb-sep">›</span>
      <span class="active">${client?.name}</span>
    </div>
    <div class="page-header" style="border:none;padding-top:16px;">
      <div><div class="page-title">${client?.name}</div><div class="page-sub">Invoice history</div></div>
      <button class="btn primary" onclick="docsCreateChoose('${typeId}','${clientId}')">+ New Invoice</button>
    </div>
    <div class="section">
      ${invoices.length===0?'<div class="muted mono text-sm">No invoices yet.</div>':
        `<div style="display:flex;flex-direction:column;gap:10px;">
          ${invoices.map(inv=>`
            <div class="client-row" onclick="docsOpenInvoice('${inv.id}')">
              <div>
                <div class="client-name">${inv.invoiceNo}</div>
                <div class="muted mono text-xs">${formatDate(inv.created)} · RM ${(inv.total||0).toFixed(2)}</div>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <span class="mono text-xs" style="padding:3px 10px;border-radius:6px;background:${inv.status==='sent'?'var(--green-bg)':inv.status==='draft'?'var(--yellow-bg)':'var(--blue-bg)'};color:${inv.status==='sent'?'var(--green)':inv.status==='draft'?'var(--yellow)':'var(--blue)'};">${inv.status||'draft'}</span>
                <button class="btn sm" onclick="event.stopPropagation();docsOpenInvoice('${inv.id}')">Open</button>
              </div>
            </div>`).join('')}
        </div>`}
    </div>`;
}

/* ── CREATE — CHOOSE CLIENT ── */
function docsCreateChoose(typeId, preClientId){
  if(typeId!=='dt_inv'){ toast('Only invoices fully implemented in prototype','err'); return; }
  if(preClientId){ docsCreateModeSelect(typeId, preClientId); return; }
  const wrap=document.getElementById('docs-content'); if(!wrap) return;
  const dt=(DB.get(SK.docTypes)||DEFAULT_DOC_TYPES).find(d=>d.id===typeId);
  const clients=getClients();
  const sorted=[...clients.filter(c=>c.pinned),...clients.filter(c=>!c.pinned)];

  wrap.innerHTML=`
    <div class="breadcrumb">
      <span onclick="renderDocs()">Docs</span><span class="breadcrumb-sep">›</span>
      <span onclick="openDocType('${typeId}')">${dt?.name}</span><span class="breadcrumb-sep">›</span>
      <span class="active">Create — Select Client</span>
    </div>
    <div class="page-header" style="border:none;padding-top:16px;">
      <div class="page-title">Select Client</div>
    </div>
    <div class="section">
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${sorted.map(c=>`
          <div class="client-row${c.pinned?' pinned':''}" onclick="docsCreateModeSelect('${typeId}','${c.id}')">
            <div><div class="client-name">${c.pinned?'★ ':''}${c.name}</div></div>
            ${planBadge(c.plan)}
          </div>`).join('')}
      </div>
    </div>`;
}

/* ── CREATE — MODE SELECT (Add / Full Edit) ── */
function docsCreateModeSelect(typeId, clientId){
  const wrap=document.getElementById('docs-content'); if(!wrap) return;
  const dt=(DB.get(SK.docTypes)||DEFAULT_DOC_TYPES).find(d=>d.id===typeId);
  const client=getClients().find(c=>c.id===clientId);
  const templates=DB.get(SK.templates)||{};
  const hasTemplate=!!templates[clientId];

  wrap.innerHTML=`
    <div class="breadcrumb">
      <span onclick="renderDocs()">Docs</span><span class="breadcrumb-sep">›</span>
      <span onclick="openDocType('${typeId}')">${dt?.name}</span><span class="breadcrumb-sep">›</span>
      <span class="active">Create for ${client?.name}</span>
    </div>
    <div class="page-header" style="border:none;padding-top:16px;">
      <div class="page-title">Choose Edit Mode</div>
      <div class="page-sub">${client?.name} ${!hasTemplate?'· ⚠️ No template uploaded — using default layout':''}</div>
    </div>
    <div class="section">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:500px;">
        <div class="card" style="cursor:pointer;padding:24px 20px;" onclick="docsOpenCreateForm('${typeId}','${clientId}','add')">
          <div style="font-size:26px;margin-bottom:8px;">➕</div>
          <div style="font-size:14px;font-weight:700;">Add</div>
          <div class="muted mono text-xs" style="margin-top:4px;line-height:1.6;">Click-to-fill fields. System auto-places content in the right spots.</div>
        </div>
        <div class="card" style="cursor:pointer;padding:24px 20px;" onclick="docsOpenCreateForm('${typeId}','${clientId}','full')">
          <div style="font-size:26px;margin-bottom:8px;">📝</div>
          <div style="font-size:14px;font-weight:700;">Full Edit</div>
          <div class="muted mono text-xs" style="margin-top:4px;line-height:1.6;">Full template shown. Edit everything manually, then download or send.</div>
        </div>
      </div>
    </div>`;
}

/* ── INVOICE FORM (Add mode) ── */
function docsOpenCreateForm(typeId, clientId, mode){
  invoiceDraftMode=mode;
  const wrap=document.getElementById('docs-content'); if(!wrap) return;
  const client=getClients().find(c=>c.id===clientId);
  const company=DB.get(SK.company)||DEFAULT_COMPANY;
  const invNo=autoInvoiceNo();
  const dt=(DB.get(SK.docTypes)||DEFAULT_DOC_TYPES).find(d=>d.id===typeId);

  // Create draft invoice
  const draft={
    id:genId('inv'), clientId, invoiceNo:invNo,
    typeId, mode,
    issueDate:today(), dueDate:'',
    billTo:client?.name||'', billToAddr:client?.address||'',
    billToReg:client?.reg||'', billToPIC:client?.pic||'',
    items:[], notes:'', status:'draft',
    total:0, tax:0, grandTotal:0,
    created:isoNow(), updated:isoNow(),
  };
  DB.set('sd_inv_draft',draft);

  renderInvoiceForm(wrap, draft, client, company, clientId, typeId, mode);
}

function renderInvoiceForm(wrap, draft, client, company, clientId, typeId, mode){
  const isAdd=mode==='add';
  wrap.innerHTML=`
    <div class="breadcrumb">
      <span onclick="renderDocs()">Docs</span><span class="breadcrumb-sep">›</span>
      <span onclick="docsCreateModeSelect('${typeId}','${clientId}')">Invoice</span><span class="breadcrumb-sep">›</span>
      <span class="active">${draft.invoiceNo}</span>
    </div>

    <div style="padding:20px 36px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
      <div>
        <div class="page-title">${draft.invoiceNo}</div>
        <div class="mono text-xs muted">Draft · ${mode==='add'?'Add mode':'Full edit mode'}</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn" onclick="docsDownloadInvoice('pdf')">⬇ PDF</button>
        <button class="btn" onclick="docsDownloadInvoice('excel')">⬇ Excel</button>
        <button class="btn primary" onclick="docsSendInvoice('${draft.id}','${clientId}')">📤 Send to PIC</button>
        <button class="btn primary" onclick="docsFinaliseInvoice('${draft.id}','${clientId}')">✓ Save Invoice</button>
      </div>
    </div>

    <div class="section">
      <div class="invoice-preview" id="invoice-body">
        <!-- HEADER -->
        <div style="display:flex;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="font-size:18px;font-weight:800;font-family:var(--font-head);">${company.name}</div>
            <div class="muted text-xs">${company.reg}</div>
            <div class="muted text-xs">${company.address}</div>
            <div class="muted text-xs">${company.email} · ${company.phone}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:22px;font-weight:800;color:var(--p-high);">INVOICE</div>
            <div class="mono text-xs">${draft.invoiceNo}</div>
          </div>
        </div>

        <!-- FIELDS -->
        ${invField('Bill To',draft.billTo||'Click to fill','inv-billTo')}
        ${invField('Address',draft.billToAddr||'Click to fill','inv-billToAddr')}
        ${invField('Reg No.',draft.billToReg||'Click to fill','inv-billToReg')}
        ${invField('Issue Date',draft.issueDate||today(),'inv-issueDate')}
        ${invField('Due Date',draft.dueDate||'Click to set','inv-dueDate')}
        ${invField('PIC',draft.billToPIC||'Click to fill','inv-billToPIC')}

        <!-- ITEMS TABLE -->
        <div style="margin-top:20px;">
          <div style="font-size:11px;font-family:var(--font-mono);font-weight:700;color:var(--muted);border-bottom:2px solid var(--border);padding-bottom:6px;display:grid;grid-template-columns:3fr 1fr 1fr 1fr;gap:8px;">
            <span>Description</span><span>Qty</span><span>Unit Price (RM)</span><span style="text-align:right">Amount</span>
          </div>
          <div id="inv-items-list"></div>
          <button class="inv-add-btn" style="margin-top:10px;" onclick="invAddItem()">+ Add Line Item</button>
        </div>

        <!-- TOTALS -->
        <div style="margin-top:20px;display:flex;justify-content:flex-end;">
          <div style="min-width:240px;">
            ${invField('Tax %',draft.tax||'0','inv-tax')}
            <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--surface2);border-radius:6px;margin-top:6px;font-weight:700;">
              <span>Total (RM)</span><span id="inv-grand-total">0.00</span>
            </div>
          </div>
        </div>

        ${invField('Notes',draft.notes||'Payment terms, bank details, etc.','inv-notes',true)}
      </div>
    </div>`;

  renderInvItems();
  updateInvTotal();

  // Bind click-to-edit fields
  document.querySelectorAll('.invoice-field').forEach(f=>{
    f.addEventListener('click',()=>invEditField(f.dataset.key));
  });
}

function invField(label,value,key,isTextarea=false){
  const isEmpty=!value||value.includes('Click');
  return `<div class="invoice-field" data-key="${key}">
    <span class="invoice-field-label">${label}</span>
    <span class="invoice-field-value${isEmpty?' empty':''}" id="${key}-display">${value}</span>
    <button class="inv-add-btn">Edit</button>
  </div>`;
}

function invEditField(key){
  const draft=DB.get('sd_inv_draft'); if(!draft) return;
  const display=document.getElementById(key+'-display'); if(!display) return;
  const current=display.textContent;
  openModal(`
    <div class="modal-title">Edit field</div>
    <div class="form-group mt-8">
      <label>${key.replace('inv-','').replace(/([A-Z])/g,' $1')}</label>
      <input id="field-val" value="${current==='Click to fill'||current==='Click to set'?'':current}" placeholder="Enter value" />
    </div>`,()=>{
      const val=document.getElementById('field-val')?.value?.trim();
      if(val!==undefined){
        display.textContent=val||'Click to fill';
        display.classList.toggle('empty',!val);
        // Persist to draft
        const d=DB.get('sd_inv_draft');
        if(d){ const k=key.replace('inv-',''); d[k]=val; DB.set('sd_inv_draft',d); }
      }
      closeModal();
    },'Apply');
}

let invItems=[];
function renderInvItems(){
  const list=document.getElementById('inv-items-list'); if(!list) return;
  if(!invItems.length){ list.innerHTML='<div class="muted mono text-xs" style="padding:10px 0">No items yet. Click + Add Line Item.</div>'; return; }
  list.innerHTML=invItems.map((item,i)=>`
    <div style="display:grid;grid-template-columns:3fr 1fr 1fr 1fr;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);align-items:center;">
      <span class="text-sm">${item.desc}</span>
      <span class="mono text-xs">${item.qty}</span>
      <span class="mono text-xs">${item.price.toFixed(2)}</span>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span class="mono text-xs fw-700">${(item.qty*item.price).toFixed(2)}</span>
        <button class="task-btn del" onclick="invDeleteItem(${i})">✕</button>
      </div>
    </div>`).join('');
  updateInvTotal();
}

function invAddItem(){
  openModal(`
    <div class="modal-title">Add Line Item</div>
    <div class="form-grid" style="gap:12px">
      <div class="form-group" style="grid-column:1/-1"><label>Description *</label><input id="ii-desc" placeholder="e.g. Scaffolding services — April 2026" /></div>
      <div class="form-group"><label>Quantity</label><input id="ii-qty" type="number" value="1" min="0" step="0.01" /></div>
      <div class="form-group"><label>Unit Price (RM)</label><input id="ii-price" type="number" placeholder="0.00" min="0" step="0.01" /></div>
    </div>`,()=>{
      const desc=document.getElementById('ii-desc')?.value?.trim();
      if(!desc){toast('Description required','err');return;}
      const qty=parseFloat(document.getElementById('ii-qty')?.value)||1;
      const price=parseFloat(document.getElementById('ii-price')?.value)||0;
      invItems.push({desc,qty,price});
      const d=DB.get('sd_inv_draft'); if(d){d.items=invItems;DB.set('sd_inv_draft',d);}
      closeModal(); renderInvItems();
    },'Add');
}

function invDeleteItem(i){ invItems.splice(i,1); renderInvItems(); }

function updateInvTotal(){
  const gt=document.getElementById('inv-grand-total'); if(!gt) return;
  const sub=invItems.reduce((s,i)=>s+i.qty*i.price,0);
  const taxEl=document.getElementById('inv-tax-display');
  const taxPct=parseFloat(taxEl?.textContent)||0;
  const total=sub*(1+taxPct/100);
  gt.textContent=total.toFixed(2);
  const d=DB.get('sd_inv_draft'); if(d){d.total=sub;d.tax=taxPct;d.grandTotal=total;DB.set('sd_inv_draft',d);}
}

function docsFinaliseInvoice(draftId, clientId){
  const draft=DB.get('sd_inv_draft'); if(!draft) return;
  draft.status='saved'; draft.updated=isoNow();
  saveInvoice(draft);
  DB.del('sd_inv_draft');
  invItems=[];
  docsViewClientDocs('dt_inv',clientId);
  toast('Invoice saved — '+draft.invoiceNo);
}

function docsDownloadInvoice(format){
  // Migration stub: replace with actual PDF/Excel export library
  toast(`Download as ${format.toUpperCase()} — connect export library on migration`,'err');
}

function docsOpenInvoice(invId){
  const inv=(DB.get(SK.invoices)||[]).find(i=>i.id===invId);
  if(!inv) return;
  toast(`Opening ${inv.invoiceNo} — full view in next sprint`);
}

function docsSendInvoice(draftId, clientId){
  // Save first
  const draft=DB.get('sd_inv_draft'); if(!draft) return;
  const members=getActiveMembers();
  const memberOpts=members.map(m=>`<option value="${m.id}">${m.initial} — ${m.role}</option>`).join('');
  openModal(`
    <div class="modal-title">Send to PIC</div>
    <div class="modal-sub">A task will be created for the chosen person with your instructions as a remark.</div>
    <div class="form-grid" style="gap:12px">
      <div class="form-group"><label>Send to</label><select id="send-to">${memberOpts}</select></div>
      <div class="form-group"><label>Action required</label>
        <select id="send-action">
          <option>Please sign and return</option>
          <option>Please verify and approve</option>
          <option>Please review</option>
          <option>For your records</option>
          <option value="custom">Other (specify below)</option>
        </select>
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label>Additional instructions</label>
        <textarea id="send-note" placeholder="Any extra instructions for the recipient..."></textarea>
      </div>
    </div>`,()=>execSendInvoice(clientId),'Send');
}

function execSendInvoice(clientId){
  const to=document.getElementById('send-to')?.value;
  const actionSel=document.getElementById('send-action')?.value;
  const note=document.getElementById('send-note')?.value?.trim();
  const action=actionSel==='custom'&&note?note:actionSel;
  const draft=DB.get('sd_inv_draft');
  if(!draft){closeModal();return;}

  // Finalise invoice
  draft.status='sent'; draft.updated=isoNow();
  saveInvoice(draft);

  // Create task for PIC
  const {assignedTo}=autoAssign('invoice sign','invoice');
  const task={
    id:genId('ct'), clientId,
    title:`${draft.invoiceNo} — ${action}`,
    note:`Invoice ${draft.invoiceNo} sent by system. Action: ${action}. ${note||''}`.trim(),
    assignedTo:to,
    priority:autoPriority('invoice sign','','client'),
    dueDate:new Date(Date.now()+3*86400000).toISOString(),
    done:false,
    remark:`Task created from invoice send. Action required: ${action}`,
    created:isoNow(), delegatedBy:null,
  };
  saveClientTask(task);
  DB.del('sd_inv_draft'); invItems=[];

  closeModal();
  docsViewClientDocs('dt_inv',clientId);
  toast(`Invoice sent → task created for ${to}`);
}
