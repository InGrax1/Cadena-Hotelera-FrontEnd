/* ── LUXORIA — reservaciones.js ─────────────────────────────── */
'use strict';
const KEY_R='luxoria_reservas';
const SEED_R=[
  {id:1,tipo:'Particular',nombre:'María García',telefono:'+34 612 345 678',direccion:'C/ Gran Vía 10, Madrid',agencia:null,huesped:null,hotelId:1,categoriaId:5,tipoHabId:4,entrada:'2025-10-15',salida:'2025-10-20',estado:'Confirmada',notas:'Prefiere habitación con vistas.'},
  {id:2,tipo:'Agencia',nombre:'TourPlus S.A.',telefono:'+34 91 777 8899',direccion:'Av. Diagonal 400, Barcelona',agencia:'TourPlus S.A.',huesped:'Robert Johnson',hotelId:2,categoriaId:5,tipoHabId:2,entrada:'2025-11-01',salida:'2025-11-07',estado:'Pendiente',notas:''},
  {id:3,tipo:'Particular',nombre:'Carlos Rodríguez',telefono:'+34 698 765 432',direccion:'C/ Serrano 50, Madrid',agencia:null,huesped:null,hotelId:5,categoriaId:4,tipoHabId:1,entrada:'2025-10-20',salida:'2025-10-22',estado:'Confirmada',notas:''},
  {id:4,tipo:'Particular',nombre:'Ahmed Al-Rashid',telefono:'+971 50 123 4567',direccion:'Sheikh Zayed Road, Dubái',agencia:null,huesped:null,hotelId:4,categoriaId:5,tipoHabId:6,entrada:'2025-12-24',salida:'2025-12-28',estado:'Pendiente',notas:'Suite con jacuzzi.'},
  {id:5,tipo:'Agencia',nombre:'TravelCo International',telefono:'+44 20 7123 4567',direccion:'Oxford St. 100, London',agencia:'TravelCo International',huesped:'Emma Wilson',hotelId:3,categoriaId:4,tipoHabId:2,entrada:'2026-01-10',salida:'2026-01-17',estado:'Cancelada',notas:'Cancelada por cliente.'},
  {id:6,tipo:'Particular',nombre:'Elena Petrova',telefono:'+7 916 234 5678',direccion:'Arbat St. 25, Moscú',agencia:null,huesped:null,hotelId:1,categoriaId:5,tipoHabId:5,entrada:'2025-12-20',salida:'2025-12-27',estado:'Confirmada',notas:''},
];

let reservas=[],editingId=null,deletingId=null,selectedId=null,searchQ='',filtEst='',filtTipo='';

function load(){try{reservas=JSON.parse(localStorage.getItem(KEY_R))||JSON.parse(JSON.stringify(SEED_R));}catch{reservas=JSON.parse(JSON.stringify(SEED_R));}}
function save(){try{localStorage.setItem(KEY_R,JSON.stringify(reservas));}catch{}}
function nextId(){return reservas.length?Math.max(...reservas.map(r=>r.id))+1:1;}

function fmtDate(d){if(!d)return'—';const [y,m,dd]=d.split('-');const mn=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];return`${parseInt(dd)} ${mn[parseInt(m)-1]} ${y}`;}
function daysBetween(a,b){return Math.max(0,Math.round((new Date(b)-new Date(a))/86400000));}

function estadoBadge(e){
  const cfg={Pendiente:{c:'var(--gold)',bg:'rgba(201,168,76,.12)',b:'rgba(201,168,76,.3)',i:'◈'},Confirmada:{c:'var(--green)',bg:'rgba(92,186,140,.12)',b:'rgba(92,186,140,.3)',i:'◎'},Cancelada:{c:'#e05c5c',bg:'rgba(224,92,92,.12)',b:'rgba(224,92,92,.3)',i:'✕'}};
  const s=cfg[e]||cfg.Pendiente;
  return`<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.2rem .6rem;border-radius:999px;font-size:.62rem;background:${s.bg};border:1px solid ${s.b};color:${s.c}">${s.i} ${e}</span>`;
}
function tipoBadge(t){
  return t==='Agencia'
    ?`<span style="color:var(--blue);font-size:.68rem">⬡ Agencia</span>`
    :`<span style="color:var(--muted);font-size:.68rem">◎ Particular</span>`;
}

/* Populate selects */
function populateSelects(){
  const hotels=LuxData.getHotels(),tipos=LuxData.getRoomTypes();
  document.getElementById('fHotel').innerHTML=`<option value="">Sin preferencia</option>`+hotels.map(h=>`<option value="${h.id}">${h.nombre}</option>`).join('');
  document.getElementById('fTipoHab').innerHTML=`<option value="">Seleccionar…</option>`+tipos.map(t=>`<option value="${t.id}">${t.nombre}</option>`).join('');
}

function renderTable(){
  let list=[...reservas];
  if(searchQ){const q=searchQ.toLowerCase();list=list.filter(r=>r.nombre.toLowerCase().includes(q)||(r.huesped||'').toLowerCase().includes(q)||(r.agencia||'').toLowerCase().includes(q));}
  if(filtEst)  list=list.filter(r=>r.estado===filtEst);
  if(filtTipo) list=list.filter(r=>r.tipo===filtTipo);
  document.getElementById('tableCount').textContent=`Mostrando ${list.length} reserva${list.length!==1?'s':''}`;
  document.getElementById('reservaBody').innerHTML=list.map(r=>{
    const h=LuxData.hotelById(r.hotelId),tp=LuxData.tipoById(r.tipoHabId);
    const displayName=r.tipo==='Agencia'?`${r.agencia} <span style="color:var(--muted);font-size:.65rem">para ${r.huesped}</span>`:r.nombre;
    return`<tr data-id="${r.id}" class="${selectedId===r.id?'row--selected':''}">
      <td class="td-id">#${r.id}</td>
      <td>${tipoBadge(r.tipo)}</td>
      <td class="td-name">${displayName}</td>
      <td class="td-muted">${h?.nombre||'Sin pref.'}</td>
      <td class="td-muted">${tp?.nombre||'—'}</td>
      <td class="td-muted">${fmtDate(r.entrada)}</td>
      <td class="td-muted">${fmtDate(r.salida)}</td>
      <td>${estadoBadge(r.estado)}</td>
      <td><div class="td-actions">
        <button class="btn-admin btn-admin--icon" data-action="view" data-id="${r.id}" title="Ver">◎</button>
        <button class="btn-admin btn-admin--icon" data-action="edit" data-id="${r.id}" title="Editar">✎</button>
        ${r.estado!=='Cancelada'?`<button class="btn-admin btn-admin--icon-danger" data-action="cancel" data-id="${r.id}" title="Cancelar">✕</button>`:''}
      </div></td>
    </tr>`;
  }).join('');
  document.querySelectorAll('#reservaBody tr').forEach(tr=>{
    tr.addEventListener('click',e=>{if(e.target.closest('[data-action]'))return;selectReserva(parseInt(tr.dataset.id));});
  });
  document.querySelectorAll('#reservaBody [data-action]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();const id=parseInt(b.dataset.id);
    if(b.dataset.action==='view')   selectReserva(id);
    if(b.dataset.action==='edit')   openEdit(id);
    if(b.dataset.action==='cancel') openDelete(id);
  }));
  renderKpis();
}

function renderKpis(){
  document.getElementById('kpiTotal').textContent=reservas.length;
  document.getElementById('kpiPend').textContent=reservas.filter(r=>r.estado==='Pendiente').length;
  document.getElementById('kpiConf').textContent=reservas.filter(r=>r.estado==='Confirmada').length;
  document.getElementById('kpiCanc').textContent=reservas.filter(r=>r.estado==='Cancelada').length;
}

function selectReserva(id){
  selectedId=id;renderTable();
  const r=reservas.find(x=>x.id===id);
  const ph=document.getElementById('detailPh'),dc=document.getElementById('detailContent');
  if(!r){ph.style.display='';dc.style.display='none';return;}
  const h=LuxData.hotelById(r.hotelId),tp=LuxData.tipoById(r.tipoHabId);
  const days=daysBetween(r.entrada,r.salida);
  ph.style.display='none';dc.style.display='';
  dc.innerHTML=`<div style="padding:1.5rem">
    <div class="detail-hotel-name">${r.tipo==='Agencia'?r.agencia:r.nombre}</div>
    <div style="margin:.5rem 0 1.2rem">${tipoBadge(r.tipo)} ${estadoBadge(r.estado)}</div>
    <div class="detail-rows">
      ${r.tipo==='Agencia'?`<div class="detail-row"><span class="detail-row-label">Huésped final</span><span class="detail-row-value">${r.huesped}</span></div>`:''}
      <div class="detail-row"><span class="detail-row-label">Teléfono</span><span class="detail-row-value">${r.telefono}</span></div>
      <div class="detail-row"><span class="detail-row-label">Dirección</span><span class="detail-row-value">${r.direccion||'—'}</span></div>
      <div class="detail-divider"></div>
      <div class="detail-row"><span class="detail-row-label">Hotel</span><span class="detail-row-value">${h?.nombre||'Sin preferencia'}</span></div>
      <div class="detail-row"><span class="detail-row-label">Habitación</span><span class="detail-row-value">${tp?.nombre||'—'}</span></div>
      <div class="detail-row"><span class="detail-row-label">Entrada</span><span class="detail-row-value">${fmtDate(r.entrada)}</span></div>
      <div class="detail-row"><span class="detail-row-label">Salida</span><span class="detail-row-value">${fmtDate(r.salida)}</span></div>
      <div class="detail-row"><span class="detail-row-label">Duración</span><span class="detail-row-value" style="color:var(--gold)">${days} noches</span></div>
      ${r.notas?`<div class="detail-divider"></div><div class="detail-row"><span class="detail-row-label">Notas</span><span class="detail-row-value">${r.notas}</span></div>`:''}
    </div>
    <div class="detail-actions">
      <button class="btn-admin btn-admin--primary" id="dEditBtn">Editar</button>
      ${r.estado!=='Cancelada'?`<button class="btn-admin btn-admin--icon-danger" id="dCancelBtn">✕ Cancelar</button>`:''}
    </div>
  </div>`;
  document.getElementById('dEditBtn')?.addEventListener('click',()=>openEdit(id));
  document.getElementById('dCancelBtn')?.addEventListener('click',()=>openDelete(id));
}

/* Toggle tipo */
document.querySelectorAll('.toggle-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('toggle-btn--active'));
    btn.classList.add('toggle-btn--active');
    document.getElementById('fTipoReserva').value=btn.dataset.val;
    document.getElementById('agenciaSection').style.display=btn.dataset.val==='Agencia'?'block':'none';
  });
});

/* Form */
function clearErr(){document.querySelectorAll('.field-err').forEach(e=>e.textContent='');document.querySelectorAll('.field--error').forEach(e=>e.classList.remove('field--error'));}
function setErr(f,e,m){document.getElementById(f)?.classList.add('field--error');const el=document.getElementById(e);if(el)el.textContent=m;}
function validate(){
  clearErr();let ok=true;
  const tipo=document.getElementById('fTipoReserva').value;
  if(!document.getElementById('fNombre').value.trim()){setErr('fNombre','errNombre','Nombre obligatorio.');ok=false;}
  if(!document.getElementById('fTelefono').value.trim()){setErr('fTelefono','errTelefono','Teléfono obligatorio.');ok=false;}
  if(tipo==='Agencia'){
    if(!document.getElementById('fAgencia').value.trim()){setErr('fAgencia','errAgencia','Nombre de agencia obligatorio.');ok=false;}
    if(!document.getElementById('fHuesped').value.trim()){setErr('fHuesped','errHuesped','Nombre del huésped obligatorio.');ok=false;}
  }
  if(!document.getElementById('fTipoHab').value){setErr('fTipoHab','errTipoHab','Selecciona tipo de habitación.');ok=false;}
  if(!document.getElementById('fEntrada').value){setErr('fEntrada','errEntrada','Fecha de entrada obligatoria.');ok=false;}
  if(!document.getElementById('fSalida').value){setErr('fSalida','errSalida','Fecha de salida obligatoria.');ok=false;}
  if(document.getElementById('fEntrada').value&&document.getElementById('fSalida').value&&document.getElementById('fSalida').value<=document.getElementById('fEntrada').value){setErr('fSalida','errSalida','La salida debe ser posterior a la entrada.');ok=false;}
  return ok;
}
function clearForm(){
  ['fId','fNombre','fTelefono','fDireccion','fAgencia','fHuesped','fNotas','fEntrada','fSalida'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  ['fHotel','fCategoria','fTipoHab'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('fEstado').value='Pendiente';
  document.getElementById('fTipoReserva').value='Particular';
  document.querySelectorAll('.toggle-btn').forEach((b,i)=>{b.classList[i===0?'add':'remove']('toggle-btn--active');});
  document.getElementById('agenciaSection').style.display='none';
  clearErr();
}
function openCreate(){editingId=null;clearForm();document.getElementById('modalTitle').textContent='Nueva Reservación';AdminUtils.openModal('modalBackdrop');}
function openEdit(id){
  editingId=id;const r=reservas.find(x=>x.id===id);if(!r)return;
  clearForm();
  document.getElementById('fId').value=r.id;
  document.getElementById('fTipoReserva').value=r.tipo;
  document.querySelectorAll('.toggle-btn').forEach(b=>{b.classList[b.dataset.val===r.tipo?'add':'remove']('toggle-btn--active');});
  if(r.tipo==='Agencia')document.getElementById('agenciaSection').style.display='block';
  document.getElementById('fNombre').value=r.nombre;
  document.getElementById('fTelefono').value=r.telefono;
  document.getElementById('fDireccion').value=r.direccion||'';
  document.getElementById('fAgencia').value=r.agencia||'';
  document.getElementById('fHuesped').value=r.huesped||'';
  document.getElementById('fHotel').value=r.hotelId||'';
  document.getElementById('fCategoria').value=r.categoriaId||'';
  document.getElementById('fTipoHab').value=r.tipoHabId||'';
  document.getElementById('fEntrada').value=r.entrada;
  document.getElementById('fSalida').value=r.salida;
  document.getElementById('fEstado').value=r.estado;
  document.getElementById('fNotas').value=r.notas||'';
  document.getElementById('modalTitle').textContent='Editar Reservación';
  AdminUtils.openModal('modalBackdrop');
}
function saveReserva(){
  if(!validate())return;
  const tipo=document.getElementById('fTipoReserva').value;
  const data={tipo,nombre:document.getElementById('fNombre').value.trim(),telefono:document.getElementById('fTelefono').value.trim(),direccion:document.getElementById('fDireccion').value.trim()||null,agencia:tipo==='Agencia'?document.getElementById('fAgencia').value.trim():null,huesped:tipo==='Agencia'?document.getElementById('fHuesped').value.trim():null,hotelId:parseInt(document.getElementById('fHotel').value)||null,categoriaId:parseInt(document.getElementById('fCategoria').value)||null,tipoHabId:parseInt(document.getElementById('fTipoHab').value),entrada:document.getElementById('fEntrada').value,salida:document.getElementById('fSalida').value,estado:document.getElementById('fEstado').value,notas:document.getElementById('fNotas').value.trim()||null};
  if(editingId){const i=reservas.findIndex(r=>r.id===editingId);if(i!==-1)reservas[i]={...reservas[i],...data};AdminUtils.showToast('Reserva actualizada.','success');}
  else{data.id=nextId();reservas.push(data);AdminUtils.showToast('Reserva creada.','success');}
  save();AdminUtils.closeModal('modalBackdrop');renderTable();
  if(selectedId===editingId)selectReserva(editingId);
}
function openDelete(id){deletingId=id;const r=reservas.find(x=>x.id===id);document.getElementById('deleteReservaName').textContent=r?.tipo==='Agencia'?r?.agencia:r?.nombre||'';AdminUtils.openModal('deleteBackdrop');}
function doCancelReserva(){
  const i=reservas.findIndex(r=>r.id===deletingId);
  if(i!==-1)reservas[i].estado='Cancelada';
  save();AdminUtils.closeModal('deleteBackdrop');AdminUtils.showToast('Reserva cancelada.','info');
  if(selectedId===deletingId)selectReserva(deletingId);
  renderTable();
}

/* Bindings */
document.getElementById('searchInput')?.addEventListener('input',e=>{searchQ=e.target.value;renderTable();});
document.getElementById('filterEstado')?.addEventListener('change',e=>{filtEst=e.target.value;renderTable();});
document.getElementById('filterTipo')?.addEventListener('change',e=>{filtTipo=e.target.value;renderTable();});
document.getElementById('btnNuevo')?.addEventListener('click',openCreate);
document.getElementById('btnGuardar')?.addEventListener('click',saveReserva);
document.getElementById('btnCancelar')?.addEventListener('click',()=>AdminUtils.closeModal('modalBackdrop'));
document.getElementById('modalClose')?.addEventListener('click',()=>AdminUtils.closeModal('modalBackdrop'));
document.getElementById('deleteConfirm')?.addEventListener('click',doCancelReserva);
document.getElementById('deleteCancelar')?.addEventListener('click',()=>AdminUtils.closeModal('deleteBackdrop'));
document.getElementById('deleteClose')?.addEventListener('click',()=>AdminUtils.closeModal('deleteBackdrop'));

load();populateSelects();renderTable();
