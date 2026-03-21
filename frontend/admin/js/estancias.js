/* ── LUXORIA — estancias.js ─────────────────────────────────── */
'use strict';
const KEY_E='luxoria_estancias';
const SEED_E=[
  {id:1,clienteId:1,hotelId:1,habitacion:'Suite 501',       tipoHabId:4,entrada:'2025-06-10',salida:'2025-06-15',estado:'Finalizada'},
  {id:2,clienteId:2,hotelId:3,habitacion:'Doble 302',       tipoHabId:2,entrada:'2025-07-01',salida:'2025-07-08',estado:'Finalizada'},
  {id:3,clienteId:3,hotelId:2,habitacion:'Doble 201',       tipoHabId:2,entrada:'2025-08-15',salida:'2025-08-20',estado:'Finalizada'},
  {id:4,clienteId:1,hotelId:4,habitacion:'Suite Pres. 401', tipoHabId:6,entrada:'2025-09-01',salida:'2025-09-05',estado:'Finalizada'},
  {id:5,clienteId:4,hotelId:1,habitacion:'Individual 101',  tipoHabId:1,entrada:'2025-10-01',salida:'2025-10-10',estado:'En curso'},
  {id:6,clienteId:5,hotelId:5,habitacion:'Suite Junior 201',tipoHabId:5,entrada:'2025-12-20',salida:'2025-12-27',estado:'Próxima'},
];
let estancias=[],editingId=null,selectedId=null,searchQ='',filtEst='';

function load(){try{estancias=JSON.parse(localStorage.getItem(KEY_E))||JSON.parse(JSON.stringify(SEED_E));}catch{estancias=JSON.parse(JSON.stringify(SEED_E));}}
function save(){try{localStorage.setItem(KEY_E,JSON.stringify(estancias));}catch{}}
function nextId(){return estancias.length?Math.max(...estancias.map(e=>e.id))+1:1;}
function days(a,b){return Math.max(0,Math.round((new Date(b)-new Date(a))/86400000));}
function fmtDate(d){if(!d)return'—';const [y,m,dd]=d.split('-');const mn=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];return`${parseInt(dd)} ${mn[parseInt(m)-1]} ${y}`;}

const CFG={
  'En curso': {c:'var(--green)',bg:'rgba(92,186,140,.12)',b:'rgba(92,186,140,.3)',i:'◉'},
  'Próxima':  {c:'var(--gold)', bg:'rgba(201,168,76,.12)',b:'rgba(201,168,76,.3)', i:'◈'},
  'Finalizada':{c:'var(--muted)',bg:'var(--white-dim)',   b:'var(--card-border)',  i:'◎'},
};
function badge(e){const s=CFG[e]||CFG.Finalizada;return`<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.2rem .6rem;border-radius:999px;font-size:.62rem;background:${s.bg};border:1px solid ${s.b};color:${s.c}">${s.i} ${e}</span>`;}

function populateSelects(){
  const clientes=LuxData.getClientes(),hotels=LuxData.getHotels(),tipos=LuxData.getRoomTypes();
  document.getElementById('fCliente').innerHTML=`<option value="">Seleccionar…</option>`+clientes.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join('');
  document.getElementById('fHotel').innerHTML=`<option value="">Seleccionar…</option>`+hotels.map(h=>`<option value="${h.id}">${h.nombre}</option>`).join('');
  document.getElementById('fTipoHab').innerHTML=`<option value="">Seleccionar…</option>`+tipos.map(t=>`<option value="${t.id}">${t.nombre}</option>`).join('');
}

function renderTable(){
  let list=[...estancias];
  if(searchQ){const q=searchQ.toLowerCase();list=list.filter(e=>{const c=LuxData.clienteById(e.clienteId),h=LuxData.hotelById(e.hotelId);return(c?.nombre||'').toLowerCase().includes(q)||(h?.nombre||'').toLowerCase().includes(q)||e.habitacion.toLowerCase().includes(q);});}
  if(filtEst)list=list.filter(e=>e.estado===filtEst);
  document.getElementById('tableCount').textContent=`Mostrando ${list.length} estancia${list.length!==1?'s':''}`;
  document.getElementById('estanciaBody').innerHTML=list.map(e=>{
    const c=LuxData.clienteById(e.clienteId),h=LuxData.hotelById(e.hotelId);
    const n=days(e.entrada,e.salida);
    return`<tr data-id="${e.id}" class="${selectedId===e.id?'row--selected':''}">
      <td class="td-id">#${e.id}</td>
      <td class="td-name">${c?.nombre||'—'}</td>
      <td class="td-muted">${h?.nombre||'—'}</td>
      <td class="td-muted">${e.habitacion}</td>
      <td class="td-muted">${fmtDate(e.entrada)}</td>
      <td class="td-muted">${fmtDate(e.salida)}</td>
      <td class="td-muted">${n}</td>
      <td>${badge(e.estado)}</td>
      <td><div class="td-actions">
        <button class="btn-admin btn-admin--icon" data-action="view" data-id="${e.id}">◎</button>
        ${e.estado==='Próxima'?`<button class="btn-admin btn-admin--icon" style="color:var(--green);border-color:rgba(92,186,140,.3)" data-action="checkin" data-id="${e.id}" title="Check-in">▶</button>`:''}
        ${e.estado==='En curso'?`<button class="btn-admin btn-admin--icon" style="color:var(--gold);border-color:rgba(201,168,76,.3)" data-action="checkout" data-id="${e.id}" title="Check-out">◼</button>`:''}
        <button class="btn-admin btn-admin--icon" data-action="edit" data-id="${e.id}">✎</button>
      </div></td>
    </tr>`;
  }).join('');
  document.querySelectorAll('#estanciaBody tr').forEach(tr=>{
    tr.addEventListener('click',ev=>{if(ev.target.closest('[data-action]'))return;selectEstancia(parseInt(tr.dataset.id));});
  });
  document.querySelectorAll('#estanciaBody [data-action]').forEach(b=>b.addEventListener('click',ev=>{
    ev.stopPropagation();const id=parseInt(b.dataset.id);
    if(b.dataset.action==='view')    selectEstancia(id);
    if(b.dataset.action==='edit')    openEdit(id);
    if(b.dataset.action==='checkin') doCheckin(id);
    if(b.dataset.action==='checkout')doCheckout(id);
  }));
  renderKpis();
}

function renderKpis(){
  document.getElementById('kpiActivas').textContent=estancias.filter(e=>e.estado==='En curso').length;
  document.getElementById('kpiProximas').textContent=estancias.filter(e=>e.estado==='Próxima').length;
  document.getElementById('kpiFin').textContent=estancias.filter(e=>e.estado==='Finalizada').length;
  document.getElementById('kpiTotal').textContent=estancias.length;
}

function doCheckin(id){const i=estancias.findIndex(e=>e.id===id);if(i!==-1){estancias[i].estado='En curso';save();renderTable();if(selectedId===id)selectEstancia(id);AdminUtils.showToast('Check-in realizado.','success');}}
function doCheckout(id){const i=estancias.findIndex(e=>e.id===id);if(i!==-1){estancias[i].estado='Finalizada';estancias[i].salida=new Date().toISOString().slice(0,10);save();renderTable();if(selectedId===id)selectEstancia(id);AdminUtils.showToast('Check-out realizado.','success');}}

function selectEstancia(id){
  selectedId=id;renderTable();
  const e=estancias.find(x=>x.id===id);const ph=document.getElementById('detailPh'),dc=document.getElementById('detailContent');
  if(!e){ph.style.display='';dc.style.display='none';return;}
  const c=LuxData.clienteById(e.clienteId),h=LuxData.hotelById(e.hotelId),tp=LuxData.tipoById(e.tipoHabId);
  const n=days(e.entrada,e.salida);const gastos=LuxData.getGastos().filter(g=>g.estanciaId===id);
  const totalGastos=gastos.reduce((s,g)=>s+g.monto,0);
  ph.style.display='none';dc.style.display='';
  dc.innerHTML=`<div style="padding:1.5rem">
    ${badge(e.estado)}
    <div class="detail-hotel-name" style="margin:.7rem 0 .3rem">${c?.nombre||'—'}</div>
    <div style="font-size:.7rem;color:var(--muted)">${h?.nombre||'—'} · ${tp?.nombre||'—'}</div>
    <div class="detail-rows" style="margin-top:1.2rem">
      <div class="detail-row"><span class="detail-row-label">Habitación</span><span class="detail-row-value">${e.habitacion}</span></div>
      <div class="detail-row"><span class="detail-row-label">Entrada</span><span class="detail-row-value">${fmtDate(e.entrada)}</span></div>
      <div class="detail-row"><span class="detail-row-label">Salida</span><span class="detail-row-value">${fmtDate(e.salida)}</span></div>
      <div class="detail-row"><span class="detail-row-label">Noches</span><span class="detail-row-value" style="color:var(--gold)">${n}</span></div>
      <div class="detail-divider"></div>
      <div class="detail-row"><span class="detail-row-label">Gastos adicionales</span><span class="detail-row-value" style="color:var(--gold)">€${totalGastos.toFixed(2)}</span></div>
    </div>
    <div class="detail-actions" style="flex-wrap:wrap">
      ${e.estado==='Próxima'?`<button class="btn-admin btn-admin--primary" style="background:var(--green)" data-ci="${id}">▶ Check-in</button>`:''}
      ${e.estado==='En curso'?`<button class="btn-admin btn-admin--primary" style="background:var(--gold)" data-co="${id}">◼ Check-out</button>`:''}
      <button class="btn-admin btn-admin--ghost" data-ed="${id}">✎ Editar</button>
    </div>
  </div>`;
  dc.querySelector('[data-ci]')?.addEventListener('click',()=>doCheckin(id));
  dc.querySelector('[data-co]')?.addEventListener('click',()=>doCheckout(id));
  dc.querySelector('[data-ed]')?.addEventListener('click',()=>openEdit(id));
}

function clearErr(){document.querySelectorAll('.field-err').forEach(e=>e.textContent='');document.querySelectorAll('.field--error').forEach(e=>e.classList.remove('field--error'));}
function setErr(f,eid,m){document.getElementById(f)?.classList.add('field--error');const el=document.getElementById(eid);if(el)el.textContent=m;}
function validate(){
  clearErr();let ok=true;
  if(!document.getElementById('fCliente').value){setErr('fCliente','errCliente','Selecciona un cliente.');ok=false;}
  if(!document.getElementById('fHotel').value){setErr('fHotel','errHotel','Selecciona un hotel.');ok=false;}
  if(!document.getElementById('fTipoHab').value){setErr('fTipoHab','errTipoHab','Selecciona el tipo.');ok=false;}
  if(!document.getElementById('fHabitacion').value.trim()){setErr('fHabitacion','errHabitacion','Número de habitación obligatorio.');ok=false;}
  if(!document.getElementById('fEntrada').value){setErr('fEntrada','errEntrada','Fecha de entrada obligatoria.');ok=false;}
  if(!document.getElementById('fSalida').value){setErr('fSalida','errSalida','Fecha de salida obligatoria.');ok=false;}
  return ok;
}
function clearForm(){
  ['fId','fHabitacion','fEntrada','fSalida'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  ['fCliente','fHotel','fTipoHab'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('fEstado').value='Próxima';clearErr();
}
function openCreate(){editingId=null;clearForm();document.getElementById('modalTitle').textContent='Nueva Estancia';AdminUtils.openModal('modalBackdrop');}
function openEdit(id){
  editingId=id;const e=estancias.find(x=>x.id===id);if(!e)return;clearForm();
  document.getElementById('fId').value=e.id;document.getElementById('fCliente').value=e.clienteId;
  document.getElementById('fHotel').value=e.hotelId;document.getElementById('fTipoHab').value=e.tipoHabId;
  document.getElementById('fHabitacion').value=e.habitacion;document.getElementById('fEntrada').value=e.entrada;
  document.getElementById('fSalida').value=e.salida;document.getElementById('fEstado').value=e.estado;
  document.getElementById('modalTitle').textContent='Editar Estancia';AdminUtils.openModal('modalBackdrop');
}
function saveEstancia(){
  if(!validate())return;
  const data={clienteId:parseInt(document.getElementById('fCliente').value),hotelId:parseInt(document.getElementById('fHotel').value),tipoHabId:parseInt(document.getElementById('fTipoHab').value),habitacion:document.getElementById('fHabitacion').value.trim(),entrada:document.getElementById('fEntrada').value,salida:document.getElementById('fSalida').value,estado:document.getElementById('fEstado').value};
  if(editingId){const i=estancias.findIndex(e=>e.id===editingId);if(i!==-1)estancias[i]={...estancias[i],...data};AdminUtils.showToast('Estancia actualizada.','success');}
  else{data.id=nextId();estancias.push(data);AdminUtils.showToast('Estancia registrada.','success');}
  save();AdminUtils.closeModal('modalBackdrop');renderTable();
}

document.getElementById('searchInput')?.addEventListener('input',e=>{searchQ=e.target.value;renderTable();});
document.getElementById('filterEstado')?.addEventListener('change',e=>{filtEst=e.target.value;renderTable();});
document.getElementById('btnNuevo')?.addEventListener('click',openCreate);
document.getElementById('btnGuardar')?.addEventListener('click',saveEstancia);
document.getElementById('btnCancelar')?.addEventListener('click',()=>AdminUtils.closeModal('modalBackdrop'));
document.getElementById('modalClose')?.addEventListener('click',()=>AdminUtils.closeModal('modalBackdrop'));

load();populateSelects();renderTable();
