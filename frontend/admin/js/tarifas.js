/* ── LUXORIA — tarifas.js ───────────────────────────────────── */
'use strict';
const KEY_T = 'luxoria_tarifas';

const SEED_T = [
  { id:1,  hotelId:1, tipoId:1, tempId:5, precio:120 },
  { id:2,  hotelId:1, tipoId:1, tempId:3, precio:160 },
  { id:3,  hotelId:1, tipoId:1, tempId:1, precio:220 },
  { id:4,  hotelId:1, tipoId:2, tempId:5, precio:190 },
  { id:5,  hotelId:1, tipoId:2, tempId:3, precio:260 },
  { id:6,  hotelId:1, tipoId:2, tempId:1, precio:360 },
  { id:7,  hotelId:1, tipoId:4, tempId:5, precio:310 },
  { id:8,  hotelId:1, tipoId:4, tempId:3, precio:420 },
  { id:9,  hotelId:1, tipoId:4, tempId:1, precio:580 },
  { id:10, hotelId:1, tipoId:6, tempId:6, precio:1400 },
  { id:11, hotelId:2, tipoId:2, tempId:1, precio:240 },
  { id:12, hotelId:2, tipoId:2, tempId:3, precio:320 },
  { id:13, hotelId:2, tipoId:4, tempId:1, precio:480 },
  { id:14, hotelId:2, tipoId:4, tempId:6, precio:750 },
  { id:15, hotelId:3, tipoId:2, tempId:3, precio:180 },
  { id:16, hotelId:3, tipoId:2, tempId:1, precio:240 },
  { id:17, hotelId:3, tipoId:4, tempId:1, precio:380 },
  { id:18, hotelId:4, tipoId:6, tempId:1, precio:850 },
  { id:19, hotelId:4, tipoId:6, tempId:6, precio:1800 },
  { id:20, hotelId:5, tipoId:2, tempId:3, precio:200 },
  { id:21, hotelId:5, tipoId:4, tempId:3, precio:340 },
  { id:22, hotelId:6, tipoId:1, tempId:5, precio:65  },
  { id:23, hotelId:6, tipoId:1, tempId:3, precio:85  },
  { id:24, hotelId:6, tipoId:2, tempId:5, precio:100 },
  { id:25, hotelId:6, tipoId:2, tempId:3, precio:130 },
];

let tarifas=[], editingId=null, deletingId=null, fHotel='', fTipo='', fTemp='';

function load(){ try{tarifas=JSON.parse(localStorage.getItem(KEY_T))||JSON.parse(JSON.stringify(SEED_T));}catch{tarifas=JSON.parse(JSON.stringify(SEED_T));} }
function save(){ try{localStorage.setItem(KEY_T,JSON.stringify(tarifas));}catch{} }
function nextId(){ return tarifas.length?Math.max(...tarifas.map(t=>t.id))+1:1; }

function getIva(hotelId){
  const h=LuxData.hotelById(hotelId); if(!h) return 10;
  const c=LuxData.catByEstrellas(h.categoria); return c?c.porcentajeIva:10;
}
function fmt(n){ return '€'+parseFloat(n).toFixed(2); }

function tempBadge(tipo){
  const colors={Alta:'var(--red,#e05c5c)',Media:'var(--blue)',Baja:'var(--green)'};
  const icons={Alta:'☀',Media:'⟳',Baja:'❄'};
  const c=colors[tipo]||'var(--muted)';
  return `<span style="color:${c};font-size:.7rem">${icons[tipo]||''} ${tipo}</span>`;
}

/* Populate selects */
function populateSelects(){
  const hotels=LuxData.getHotels(), tipos=LuxData.getRoomTypes(), temps=LuxData.getTemps();
  const sets={
    filterHotel:[['','Todos los hoteles'],...hotels.map(h=>[h.id,h.nombre])],
    filterTipo: [['','Todos los tipos'],...tipos.map(t=>[t.id,t.nombre])],
    filterTemp: [['','Todas las temporadas'],...temps.map(t=>[t.id,t.nombre])],
    fHotel:     [['','Seleccionar…'],...hotels.map(h=>[h.id,h.nombre])],
    fTipo:      [['','Seleccionar…'],...tipos.map(t=>[t.id,t.nombre])],
    fTemp:      [['','Seleccionar…'],...temps.map(t=>[t.id,`${t.nombre} (${t.tipo})`])],
  };
  Object.entries(sets).forEach(([id,opts])=>{
    const el=document.getElementById(id); if(!el) return;
    el.innerHTML=opts.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
  });
}

function renderTable(){
  let list=[...tarifas];
  if(fHotel) list=list.filter(t=>t.hotelId===parseInt(fHotel));
  if(fTipo)  list=list.filter(t=>t.tipoId===parseInt(fTipo));
  if(fTemp)  list=list.filter(t=>t.tempId===parseInt(fTemp));
  document.getElementById('tableCount').textContent=`Mostrando ${list.length} tarifa${list.length!==1?'s':''}`;
  document.getElementById('tarifaBody').innerHTML=list.map(t=>{
    const h=LuxData.hotelById(t.hotelId), tp=LuxData.tipoById(t.tipoId), te=LuxData.tempById(t.tempId);
    const iva=getIva(t.hotelId), total=t.precio*(1+iva/100);
    return `<tr>
      <td class="td-name">${h?.nombre||'—'}</td>
      <td class="td-muted">${tp?.nombre||'—'}</td>
      <td>${te?tempBadge(te.tipo)+' <span style="color:var(--muted);font-size:.68rem">'+te.nombre+'</span>':'—'}</td>
      <td style="color:var(--gold);font-weight:700">${fmt(t.precio)}</td>
      <td class="td-muted">${iva}%</td>
      <td style="color:var(--white)">${fmt(total)}</td>
      <td><div class="td-actions">
        <button class="btn-admin btn-admin--icon" data-action="edit" data-id="${t.id}" title="Editar">✎</button>
        <button class="btn-admin btn-admin--icon-danger" data-action="delete" data-id="${t.id}" title="Eliminar">✕</button>
      </div></td>
    </tr>`;
  }).join('');
  document.querySelectorAll('#tarifaBody [data-action]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    b.dataset.action==='edit'?openEdit(parseInt(b.dataset.id)):openDelete(parseInt(b.dataset.id));
  }));
  updateKpis(list);
}

function updateKpis(list){
  const prices=list.map(t=>t.precio);
  document.getElementById('kpiTotal').textContent=tarifas.length;
  document.getElementById('kpiProm').textContent=prices.length?'€'+(prices.reduce((a,b)=>a+b,0)/prices.length).toFixed(0):'—';
  document.getElementById('kpiMax').textContent=prices.length?'€'+Math.max(...prices):'—';
  document.getElementById('kpiMin').textContent=prices.length?'€'+Math.min(...prices):'—';
}

/* Preview IVA in modal */
function updatePreview(){
  const hId=document.getElementById('fHotel').value;
  const precio=parseFloat(document.getElementById('fPrecio').value);
  const prev=document.getElementById('tarifaPreview');
  if(!hId||isNaN(precio)||precio<=0){prev.style.display='none';return;}
  const iva=getIva(hId), total=precio*(1+iva/100);
  prev.style.display='block';
  document.getElementById('tpBase').textContent=fmt(precio);
  document.getElementById('tpIvaLabel').textContent=`IVA (${iva}%):`;
  document.getElementById('tpIva').textContent=fmt(precio*iva/100);
  document.getElementById('tpTotal').textContent=fmt(total);
}
document.getElementById('fHotel')?.addEventListener('change',updatePreview);
document.getElementById('fPrecio')?.addEventListener('input',updatePreview);

/* Validate & save */
function clearErr(){document.querySelectorAll('.field-err').forEach(e=>e.textContent='');document.querySelectorAll('.field--error').forEach(e=>e.classList.remove('field--error'));}
function setErr(f,e,m){document.getElementById(f)?.classList.add('field--error');const el=document.getElementById(e);if(el)el.textContent=m;}
function validate(){
  clearErr();let ok=true;
  if(!document.getElementById('fHotel').value){setErr('fHotel','errHotel','Selecciona un hotel.');ok=false;}
  if(!document.getElementById('fTipo').value){setErr('fTipo','errTipo','Selecciona el tipo.');ok=false;}
  if(!document.getElementById('fTemp').value){setErr('fTemp','errTemp','Selecciona la temporada.');ok=false;}
  const p=document.getElementById('fPrecio').value;
  if(!p||isNaN(p)||p<=0){setErr('fPrecio','errPrecio','Ingresa un precio válido.');ok=false;}
  return ok;
}

function clearForm(){
  ['fId','fPrecio'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  ['fHotel','fTipo','fTemp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('tarifaPreview').style.display='none';
  clearErr();
}
function openCreate(){
  editingId=null;clearForm();
  document.getElementById('modalTitle').textContent='Nueva Tarifa';
  AdminUtils.openModal('modalBackdrop');
}
function openEdit(id){
  editingId=id;const t=tarifas.find(x=>x.id===id);if(!t)return;
  clearForm();
  document.getElementById('fId').value=t.id;
  document.getElementById('fHotel').value=t.hotelId;
  document.getElementById('fTipo').value=t.tipoId;
  document.getElementById('fTemp').value=t.tempId;
  document.getElementById('fPrecio').value=t.precio;
  updatePreview();
  document.getElementById('modalTitle').textContent='Editar Tarifa';
  AdminUtils.openModal('modalBackdrop');
}
function saveTarifa(){
  if(!validate())return;
  const data={hotelId:parseInt(document.getElementById('fHotel').value),tipoId:parseInt(document.getElementById('fTipo').value),tempId:parseInt(document.getElementById('fTemp').value),precio:parseFloat(document.getElementById('fPrecio').value)};
  if(editingId){const i=tarifas.findIndex(t=>t.id===editingId);if(i!==-1)tarifas[i]={...tarifas[i],...data};AdminUtils.showToast('Tarifa actualizada.','success');}
  else{data.id=nextId();tarifas.push(data);AdminUtils.showToast('Tarifa registrada.','success');}
  save();AdminUtils.closeModal('modalBackdrop');renderTable();
}
function openDelete(id){
  deletingId=id;const t=tarifas.find(x=>x.id===id);
  const h=LuxData.hotelById(t?.hotelId),tp=LuxData.tipoById(t?.tipoId),te=LuxData.tempById(t?.tempId);
  document.getElementById('deleteTarifaDesc').textContent=`${h?.nombre||'—'} · ${tp?.nombre||'—'} · ${te?.nombre||'—'}`;
  AdminUtils.openModal('deleteBackdrop');
}
function doDelete(){
  tarifas=tarifas.filter(t=>t.id!==deletingId);save();
  AdminUtils.closeModal('deleteBackdrop');AdminUtils.showToast('Tarifa eliminada.','error');renderTable();
}

/* Bindings */
document.getElementById('filterHotel')?.addEventListener('change',e=>{fHotel=e.target.value;renderTable();});
document.getElementById('filterTipo')?.addEventListener('change',e=>{fTipo=e.target.value;renderTable();});
document.getElementById('filterTemp')?.addEventListener('change',e=>{fTemp=e.target.value;renderTable();});
document.getElementById('btnNuevo')?.addEventListener('click',openCreate);
document.getElementById('btnGuardar')?.addEventListener('click',saveTarifa);
document.getElementById('btnCancelar')?.addEventListener('click',()=>AdminUtils.closeModal('modalBackdrop'));
document.getElementById('modalClose')?.addEventListener('click',()=>AdminUtils.closeModal('modalBackdrop'));
document.getElementById('deleteConfirm')?.addEventListener('click',doDelete);
document.getElementById('deleteCancelar')?.addEventListener('click',()=>AdminUtils.closeModal('deleteBackdrop'));
document.getElementById('deleteClose')?.addEventListener('click',()=>AdminUtils.closeModal('deleteBackdrop'));

load();populateSelects();renderTable();
