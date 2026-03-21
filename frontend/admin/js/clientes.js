/* ── LUXORIA — clientes.js ──────────────────────────────────── */
'use strict';
const KEY_C='luxoria_clientes';
const SEED_C=[
  {id:1,nombre:'María García López',    email:'mgarcia@email.com',   telefono:'+34 612 345 678',direccion:'C/ Gran Vía 10, Madrid, España',tipoId:'DNI',idNum:'12345678A',notas:'Prefiere habitaciones altas con vistas.',creadoEn:'2024-03-15'},
  {id:2,nombre:'Carlos Rodríguez Sanz', email:'crodrz@email.com',    telefono:'+34 698 765 432',direccion:'C/ Serrano 50, Madrid, España',  tipoId:'DNI',idNum:'87654321B',notas:'',creadoEn:'2024-05-20'},
  {id:3,nombre:'Sophie Martin',         email:'smartin@email.fr',    telefono:'+33 612 987 654',direccion:'Rue de la Paix 8, París, Francia',tipoId:'Pasaporte',idNum:'FR123456',notas:'Habla español y francés.',creadoEn:'2024-07-10'},
  {id:4,nombre:'Ahmed Al-Rashid',       email:'ahmed@email.ae',      telefono:'+971 50 123 4567',direccion:'Sheikh Zayed Road, Dubái, EAU', tipoId:'Pasaporte',idNum:'AE789012',notas:'VIP. Suite presidencial habitual.',creadoEn:'2024-08-01'},
  {id:5,nombre:'Elena Petrova',         email:'epetrova@email.ru',   telefono:'+7 916 234 5678', direccion:'Arbat St. 25, Moscú, Rusia',    tipoId:'Pasaporte',idNum:'RU345678',notas:'',creadoEn:'2024-11-05'},
  {id:6,nombre:'Marco Bianchi',         email:'mbianchi@email.it',   telefono:'+39 339 123 4567',direccion:'Via Roma 15, Roma, Italia',     tipoId:'DNI',idNum:'IT654321',notas:'Viajero frecuente. Bronce en el programa de fidelidad.',creadoEn:'2025-01-12'},
];

let clientes=[],editingId=null,deletingId=null,selectedId=null,searchQ='';

function load(){try{clientes=JSON.parse(localStorage.getItem(KEY_C))||JSON.parse(JSON.stringify(SEED_C));}catch{clientes=JSON.parse(JSON.stringify(SEED_C));}}
function save(){try{localStorage.setItem(KEY_C,JSON.stringify(clientes));}catch{}}
function nextId(){return clientes.length?Math.max(...clientes.map(c=>c.id))+1:1;}

function initSeedEstancias(){
  /* Seed estancias if not yet created, using our client IDs */
  if(!localStorage.getItem('luxoria_estancias')){
    const estancias=[
      {id:1,clienteId:1,hotelId:1,habitacion:'Suite 501',tipoHabId:4,entrada:'2025-06-10',salida:'2025-06-15',estado:'Finalizada',creadoEn:'2025-06-01'},
      {id:2,clienteId:2,hotelId:3,habitacion:'Doble 302',tipoHabId:2,entrada:'2025-07-01',salida:'2025-07-08',estado:'Finalizada',creadoEn:'2025-06-20'},
      {id:3,clienteId:3,hotelId:2,habitacion:'Doble 201',tipoHabId:2,entrada:'2025-08-15',salida:'2025-08-20',estado:'Finalizada',creadoEn:'2025-08-01'},
      {id:4,clienteId:1,hotelId:4,habitacion:'Suite Pres. 401',tipoHabId:6,entrada:'2025-09-01',salida:'2025-09-05',estado:'Finalizada',creadoEn:'2025-08-15'},
      {id:5,clienteId:4,hotelId:1,habitacion:'Individual 101',tipoHabId:1,entrada:'2025-10-01',salida:'2025-10-10',estado:'En curso',creadoEn:'2025-09-15'},
      {id:6,clienteId:5,hotelId:5,habitacion:'Suite 201',tipoHabId:4,entrada:'2025-12-20',salida:'2025-12-27',estado:'Próxima',creadoEn:'2025-10-01'},
    ];
    localStorage.setItem('luxoria_estancias',JSON.stringify(estancias));
  }
}

function fmtDate(d){if(!d)return'—';const [y,m,dd]=d.split('-');const mn=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];return`${parseInt(dd)} ${mn[parseInt(m)-1]} ${y}`;}

function renderTable(){
  let list=[...clientes];
  if(searchQ){const q=searchQ.toLowerCase();list=list.filter(c=>c.nombre.toLowerCase().includes(q)||c.email.toLowerCase().includes(q)||(c.idNum||'').toLowerCase().includes(q));}
  document.getElementById('tableCount').textContent=`Mostrando ${list.length} cliente${list.length!==1?'s':''}`;
  const estancias=LuxData.getEstancias();
  document.getElementById('clienteBody').innerHTML=list.map(c=>{
    const nEst=estancias.filter(e=>e.clienteId===c.id).length;
    const activo=estancias.some(e=>e.clienteId===c.id&&e.estado==='En curso');
    return`<tr data-id="${c.id}" class="${selectedId===c.id?'row--selected':''}">
      <td class="td-id">#${c.id}</td>
      <td><div style="display:flex;align-items:center;gap:.6rem">
        <div style="width:28px;height:28px;border-radius:50%;background:var(--gold-dim);border:1px solid rgba(201,168,76,.3);display:flex;align-items:center;justify-content:center;font-size:.7rem;color:var(--gold);flex-shrink:0">${c.nombre[0]}</div>
        <span class="td-name">${c.nombre}</span>${activo?'<span style="width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;box-shadow:0 0 6px var(--green)"></span>':''}
      </div></td>
      <td class="td-muted">${c.email}</td>
      <td class="td-muted">${c.telefono}</td>
      <td class="td-muted">${c.tipoId}: ${c.idNum}</td>
      <td><span style="color:var(--blue);font-size:.75rem">${nEst} estancia${nEst!==1?'s':''}</span></td>
      <td><div class="td-actions">
        <button class="btn-admin btn-admin--icon" data-action="view" data-id="${c.id}" title="Ver">◎</button>
        <button class="btn-admin btn-admin--icon" data-action="edit" data-id="${c.id}" title="Editar">✎</button>
        <button class="btn-admin btn-admin--icon-danger" data-action="delete" data-id="${c.id}" title="Eliminar">✕</button>
      </div></td>
    </tr>`;
  }).join('');
  document.querySelectorAll('#clienteBody tr').forEach(tr=>{
    tr.addEventListener('click',e=>{if(e.target.closest('[data-action]'))return;selectCliente(parseInt(tr.dataset.id));});
  });
  document.querySelectorAll('#clienteBody [data-action]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();const id=parseInt(b.dataset.id);
    if(b.dataset.action==='view')selectCliente(id);
    if(b.dataset.action==='edit')openEdit(id);
    if(b.dataset.action==='delete')openDelete(id);
  }));
  renderKpis();
}

function renderKpis(){
  const estancias=LuxData.getEstancias();
  const now=new Date().toISOString().slice(0,10);
  const thisMonthStart=now.slice(0,7)+'-01';
  document.getElementById('kpiTotal').textContent=clientes.length;
  document.getElementById('kpiActivos').textContent=clientes.filter(c=>estancias.some(e=>e.clienteId===c.id&&e.estado==='En curso')).length;
  document.getElementById('kpiEstancias').textContent=estancias.length;
  document.getElementById('kpiNuevos').textContent=clientes.filter(c=>c.creadoEn&&c.creadoEn>=thisMonthStart).length;
}

function selectCliente(id){
  selectedId=id;renderTable();
  const c=clientes.find(x=>x.id===id);
  const ph=document.getElementById('detailPh'),dc=document.getElementById('detailContent');
  if(!c){ph.style.display='';dc.style.display='none';return;}
  const estancias=LuxData.getEstancias().filter(e=>e.clienteId===id);
  ph.style.display='none';dc.style.display='';
  dc.innerHTML=`<div style="padding:1.5rem">
    <div style="display:flex;align-items:center;gap:.8rem;margin-bottom:1rem">
      <div style="width:42px;height:42px;border-radius:50%;background:var(--gold-dim);border:1px solid rgba(201,168,76,.3);display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--gold);flex-shrink:0">${c.nombre[0]}</div>
      <div><div class="detail-hotel-name" style="font-size:1.1rem">${c.nombre}</div><div style="font-size:.65rem;color:var(--muted)">${c.tipoId}: ${c.idNum}</div></div>
    </div>
    <div class="detail-rows">
      <div class="detail-row"><span class="detail-row-label">Email</span><span class="detail-row-value">${c.email}</span></div>
      <div class="detail-row"><span class="detail-row-label">Teléfono</span><span class="detail-row-value">${c.telefono}</span></div>
      <div class="detail-row"><span class="detail-row-label">Dirección</span><span class="detail-row-value">${c.direccion||'—'}</span></div>
      ${c.notas?`<div class="detail-divider"></div><div class="detail-row"><span class="detail-row-label">Notas</span><span class="detail-row-value">${c.notas}</span></div>`:''}
    </div>
    <div class="detail-divider"></div>
    <div style="font-size:.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.8rem">Historial de estancias</div>
    ${estancias.length?estancias.map(e=>{
      const h=LuxData.hotelById(e.hotelId);
      const colors={Finalizada:'var(--muted)',EnCurso:'var(--green)','En curso':'var(--green)',Próxima:'var(--gold)'};
      const c2=colors[e.estado]||'var(--muted)';
      return`<div style="background:var(--bg-3);border:1px solid var(--card-border);border-radius:var(--radius-sm);padding:.7rem;margin-bottom:.5rem">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:.72rem;color:var(--white)">${h?.nombre||'—'}</span>
          <span style="font-size:.6rem;color:${c2}">${e.estado}</span>
        </div>
        <div style="font-size:.62rem;color:var(--muted);margin-top:.3rem">${fmtDate(e.entrada)} → ${fmtDate(e.salida)} · ${e.habitacion}</div>
      </div>`;
    }).join(''):`<p style="font-size:.7rem;color:var(--muted)">Sin estancias registradas.</p>`}
    <div class="detail-actions"><button class="btn-admin btn-admin--primary" data-edit="${id}">Editar</button></div>
  </div>`;
  dc.querySelector('[data-edit]')?.addEventListener('click',()=>openEdit(id));
}

/* CRUD */
function clearErr(){document.querySelectorAll('.field-err').forEach(e=>e.textContent='');document.querySelectorAll('.field--error').forEach(e=>e.classList.remove('field--error'));}
function setErr(f,e,m){document.getElementById(f)?.classList.add('field--error');const el=document.getElementById(e);if(el)el.textContent=m;}
function validate(){
  clearErr();let ok=true;
  if(!document.getElementById('fNombre').value.trim()){setErr('fNombre','errNombre','Nombre obligatorio.');ok=false;}
  if(!document.getElementById('fEmail').value.trim()){setErr('fEmail','errEmail','Email obligatorio.');ok=false;}
  if(!document.getElementById('fTelefono').value.trim()){setErr('fTelefono','errTelefono','Teléfono obligatorio.');ok=false;}
  if(!document.getElementById('fIdNum').value.trim()){setErr('fIdNum','errIdNum','N.º de identificación obligatorio.');ok=false;}
  return ok;
}
function clearForm(){
  ['fId','fNombre','fEmail','fTelefono','fDireccion','fIdNum','fNotas'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('fTipoId').value='DNI';clearErr();
}
function openCreate(){editingId=null;clearForm();document.getElementById('modalTitle').textContent='Nuevo Cliente';AdminUtils.openModal('modalBackdrop');}
function openEdit(id){
  editingId=id;const c=clientes.find(x=>x.id===id);if(!c)return;clearForm();
  document.getElementById('fId').value=c.id;document.getElementById('fNombre').value=c.nombre;
  document.getElementById('fEmail').value=c.email;document.getElementById('fTelefono').value=c.telefono;
  document.getElementById('fDireccion').value=c.direccion||'';document.getElementById('fTipoId').value=c.tipoId;
  document.getElementById('fIdNum').value=c.idNum;document.getElementById('fNotas').value=c.notas||'';
  document.getElementById('modalTitle').textContent='Editar Cliente';AdminUtils.openModal('modalBackdrop');
}
function saveCliente(){
  if(!validate())return;
  const data={nombre:document.getElementById('fNombre').value.trim(),email:document.getElementById('fEmail').value.trim(),telefono:document.getElementById('fTelefono').value.trim(),direccion:document.getElementById('fDireccion').value.trim()||null,tipoId:document.getElementById('fTipoId').value,idNum:document.getElementById('fIdNum').value.trim(),notas:document.getElementById('fNotas').value.trim()||null};
  if(editingId){const i=clientes.findIndex(c=>c.id===editingId);if(i!==-1)clientes[i]={...clientes[i],...data};AdminUtils.showToast('Cliente actualizado.','success');}
  else{data.id=nextId();data.creadoEn=new Date().toISOString().slice(0,10);clientes.push(data);AdminUtils.showToast('Cliente registrado.','success');}
  save();AdminUtils.closeModal('modalBackdrop');renderTable();
  if(selectedId===editingId)selectCliente(editingId);
}
function openDelete(id){deletingId=id;const c=clientes.find(x=>x.id===id);document.getElementById('deleteClienteName').textContent=c?.nombre||'';AdminUtils.openModal('deleteBackdrop');}
function doDelete(){clientes=clientes.filter(c=>c.id!==deletingId);save();AdminUtils.closeModal('deleteBackdrop');AdminUtils.showToast('Cliente eliminado.','error');if(selectedId===deletingId){selectedId=null;document.getElementById('detailPh').style.display='';document.getElementById('detailContent').style.display='none';}renderTable();}

document.getElementById('searchInput')?.addEventListener('input',e=>{searchQ=e.target.value;renderTable();});
document.getElementById('btnNuevo')?.addEventListener('click',openCreate);
document.getElementById('btnGuardar')?.addEventListener('click',saveCliente);
document.getElementById('btnCancelar')?.addEventListener('click',()=>AdminUtils.closeModal('modalBackdrop'));
document.getElementById('modalClose')?.addEventListener('click',()=>AdminUtils.closeModal('modalBackdrop'));
document.getElementById('deleteConfirm')?.addEventListener('click',doDelete);
document.getElementById('deleteCancelar')?.addEventListener('click',()=>AdminUtils.closeModal('deleteBackdrop'));
document.getElementById('deleteClose')?.addEventListener('click',()=>AdminUtils.closeModal('deleteBackdrop'));

load();initSeedEstancias();renderTable();
