/* ── LUXORIA — gastos.js ────────────────────────────────────── */
'use strict';
const KEY_G='luxoria_gastos';
const SEED_G=[
  {id:1,estanciaId:1,tipo:'Restaurante',descripcion:'Cena en restaurante El Jardín',monto:180,fecha:'2025-06-12'},
  {id:2,estanciaId:1,tipo:'Spa',        descripcion:'Masaje premium 90 min',        monto:95, fecha:'2025-06-13'},
  {id:3,estanciaId:1,tipo:'Minibar',    descripcion:'Consumo minibar habitación',   monto:45, fecha:'2025-06-14'},
  {id:4,estanciaId:2,tipo:'Room Service',descripcion:'Desayuno en habitación x7',  monto:65, fecha:'2025-07-03'},
  {id:5,estanciaId:2,tipo:'Lavandería', descripcion:'Servicio lavandería express',  monto:30, fecha:'2025-07-05'},
  {id:6,estanciaId:4,tipo:'Restaurante',descripcion:'Cena de gala en terraza',      monto:450,fecha:'2025-09-02'},
  {id:7,estanciaId:4,tipo:'Spa',        descripcion:'Spa VIP con champán',          monto:280,fecha:'2025-09-03'},
  {id:8,estanciaId:4,tipo:'Otros',      descripcion:'Flores y decoración suite',    monto:150,fecha:'2025-09-04'},
  {id:9,estanciaId:5,tipo:'Minibar',    descripcion:'Minibar día 1',                monto:32, fecha:'2025-10-02'},
  {id:10,estanciaId:5,tipo:'Room Service',descripcion:'Cena room service',          monto:78, fecha:'2025-10-05'},
];

const TIPO_ICONS={Restaurante:'◉',Spa:'◈',Minibar:'◎',['Room Service']:'▣',Lavandería:'◊',Teléfono:'◇',Transporte:'⬡',Otros:'▦'};
const TIPO_COLORS={Restaurante:'#e08c5c',Spa:'#c9a84c',Minibar:'#5cba8c',['Room Service']:'#4a8ecb',Lavandería:'#c96aa8',Teléfono:'#8c5cba',Transporte:'#5c8cba',Otros:'#7a7895'};

let gastos=[],editingId=null,deletingId=null,filtEst='',filtTipo='';

function load(){try{gastos=JSON.parse(localStorage.getItem(KEY_G))||JSON.parse(JSON.stringify(SEED_G));}catch{gastos=JSON.parse(JSON.stringify(SEED_G));}}
function save(){try{localStorage.setItem(KEY_G,JSON.stringify(gastos));}catch{}}
function nextId(){return gastos.length?Math.max(...gastos.map(g=>g.id))+1:1;}
function fmt(n){return'€'+parseFloat(n).toFixed(2);}
function fmtDate(d){if(!d)return'—';const [y,m,dd]=d.split('-');const mn=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];return`${parseInt(dd)} ${mn[parseInt(m)-1]} ${y}`;}

function populateEstanciaSelect(){
  const estancias=LuxData.getEstancias(),clientes=LuxData.getClientes();
  const opts=estancias.map(e=>{const c=clientes.find(cl=>cl.id===e.clienteId);return`<option value="${e.id}">#${e.id} ${c?.nombre||'—'} (${e.habitacion})</option>`;});
  document.getElementById('filterEstancia').innerHTML=`<option value="">Todas las estancias</option>`+opts.join('');
  document.getElementById('fEstancia').innerHTML=`<option value="">Seleccionar estancia…</option>`+opts.join('');
}

function renderTable(){
  let list=[...gastos];
  if(filtEst) list=list.filter(g=>g.estanciaId===parseInt(filtEst));
  if(filtTipo)list=list.filter(g=>g.tipo===filtTipo);
  const total=list.reduce((s,g)=>s+g.monto,0);
  document.getElementById('tableCount').textContent=`Mostrando ${list.length} gasto${list.length!==1?'s':''}`;
  document.getElementById('totalDisplay').textContent=list.length?`Total filtrado: ${fmt(total)}`:'';
  const estancias=LuxData.getEstancias(),clientes=LuxData.getClientes();
  document.getElementById('gastoBody').innerHTML=list.map(g=>{
    const e=estancias.find(x=>x.id===g.estanciaId),c=e?clientes.find(cl=>cl.id===e?.clienteId):null;
    const color=TIPO_COLORS[g.tipo]||'var(--muted)',icon=TIPO_ICONS[g.tipo]||'◎';
    return`<tr>
      <td class="td-id">#${g.id}</td>
      <td><div style="font-size:.72rem"><div style="color:var(--white)">${c?.nombre||'—'}</div><div style="color:var(--muted);font-size:.62rem">${e?.habitacion||'—'}</div></div></td>
      <td><span style="color:${color};font-size:.72rem">${icon} ${g.tipo}</span></td>
      <td class="td-muted" style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${g.descripcion}</td>
      <td class="td-muted">${fmtDate(g.fecha)}</td>
      <td style="color:var(--gold);font-weight:700">${fmt(g.monto)}</td>
      <td><div class="td-actions">
        <button class="btn-admin btn-admin--icon" data-action="edit" data-id="${g.id}">✎</button>
        <button class="btn-admin btn-admin--icon-danger" data-action="delete" data-id="${g.id}">✕</button>
      </div></td>
    </tr>`;
  }).join('');
  document.querySelectorAll('#gastoBody [data-action]').forEach(b=>b.addEventListener('click',ev=>{
    ev.stopPropagation();const id=parseInt(b.dataset.id);
    b.dataset.action==='edit'?openEdit(id):openDelete(id);
  }));
  renderKpis();renderChart();
}

function renderKpis(){
  const montos=gastos.map(g=>g.monto);
  document.getElementById('kpiTotal').textContent=gastos.length;
  document.getElementById('kpiMonto').textContent=montos.length?fmt(montos.reduce((a,b)=>a+b,0)):'—';
  document.getElementById('kpiProm').textContent=montos.length?fmt(montos.reduce((a,b)=>a+b,0)/montos.length):'—';
  document.getElementById('kpiMax').textContent=montos.length?fmt(Math.max(...montos)):'—';
}

function renderChart(){
  const byTipo={};
  gastos.forEach(g=>{byTipo[g.tipo]=(byTipo[g.tipo]||0)+g.monto;});
  const sorted=Object.entries(byTipo).sort((a,b)=>b[1]-a[1]);
  const max=sorted.length?sorted[0][1]:1;
  document.getElementById('gastoChart').innerHTML=sorted.map(([tipo,total])=>{
    const pct=(total/max*100).toFixed(1),color=TIPO_COLORS[tipo]||'var(--muted)',icon=TIPO_ICONS[tipo]||'◎';
    return`<div style="display:grid;grid-template-columns:1.5rem 100px 1fr 4rem;align-items:center;gap:.6rem">
      <span style="color:${color};font-size:.9rem">${icon}</span>
      <span style="font-size:.66rem;color:var(--muted)">${tipo}</span>
      <div style="height:18px;background:var(--bg-3);border-radius:3px;overflow:hidden;border:1px solid var(--card-border)">
        <div style="height:100%;width:0%;background:${color};border-radius:3px;transition:width .8s ease" data-w="${pct}"></div>
      </div>
      <span style="font-size:.66rem;color:${color};text-align:right">${fmt(total)}</span>
    </div>`;
  }).join('');
  requestAnimationFrame(()=>{document.querySelectorAll('#gastoChart [data-w]').forEach(b=>{setTimeout(()=>{b.style.width=b.dataset.w+'%';},80);});});
}

function clearErr(){document.querySelectorAll('.field-err').forEach(e=>e.textContent='');document.querySelectorAll('.field--error').forEach(e=>e.classList.remove('field--error'));}
function setErr(f,e,m){document.getElementById(f)?.classList.add('field--error');const el=document.getElementById(e);if(el)el.textContent=m;}
function validate(){
  clearErr();let ok=true;
  if(!document.getElementById('fEstancia').value){setErr('fEstancia','errEstancia','Selecciona una estancia.');ok=false;}
  if(!document.getElementById('fTipoGasto').value){setErr('fTipoGasto','errTipoGasto','Selecciona el tipo.');ok=false;}
  const m=document.getElementById('fMonto').value;if(!m||isNaN(m)||m<=0){setErr('fMonto','errMonto','Monto válido requerido.');ok=false;}
  if(!document.getElementById('fDescripcion').value.trim()){setErr('fDescripcion','errDescripcion','Descripción obligatoria.');ok=false;}
  return ok;
}
function clearForm(){
  ['fId','fDescripcion','fMonto','fFecha'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('fEstancia').value='';document.getElementById('fTipoGasto').value='';clearErr();
}
function openCreate(){editingId=null;clearForm();document.getElementById('fFecha').value=new Date().toISOString().slice(0,10);document.getElementById('modalTitle').textContent='Nuevo Gasto';AdminUtils.openModal('modalBackdrop');}
function openEdit(id){
  editingId=id;const g=gastos.find(x=>x.id===id);if(!g)return;clearForm();
  document.getElementById('fId').value=g.id;document.getElementById('fEstancia').value=g.estanciaId;
  document.getElementById('fTipoGasto').value=g.tipo;document.getElementById('fMonto').value=g.monto;
  document.getElementById('fDescripcion').value=g.descripcion;document.getElementById('fFecha').value=g.fecha||'';
  document.getElementById('modalTitle').textContent='Editar Gasto';AdminUtils.openModal('modalBackdrop');
}
function saveGasto(){
  if(!validate())return;
  const data={estanciaId:parseInt(document.getElementById('fEstancia').value),tipo:document.getElementById('fTipoGasto').value,monto:parseFloat(document.getElementById('fMonto').value),descripcion:document.getElementById('fDescripcion').value.trim(),fecha:document.getElementById('fFecha').value||new Date().toISOString().slice(0,10)};
  if(editingId){const i=gastos.findIndex(g=>g.id===editingId);if(i!==-1)gastos[i]={...gastos[i],...data};AdminUtils.showToast('Gasto actualizado.','success');}
  else{data.id=nextId();gastos.push(data);AdminUtils.showToast('Gasto registrado.','success');}
  save();AdminUtils.closeModal('modalBackdrop');renderTable();
}
function openDelete(id){deletingId=id;const g=gastos.find(x=>x.id===id);document.getElementById('deleteGastoName').textContent=g?.descripcion||'';AdminUtils.openModal('deleteBackdrop');}
function doDelete(){gastos=gastos.filter(g=>g.id!==deletingId);save();AdminUtils.closeModal('deleteBackdrop');AdminUtils.showToast('Gasto eliminado.','error');renderTable();}

document.getElementById('filterEstancia')?.addEventListener('change',e=>{filtEst=e.target.value;renderTable();});
document.getElementById('filterTipo')?.addEventListener('change',e=>{filtTipo=e.target.value;renderTable();});
document.getElementById('btnNuevo')?.addEventListener('click',openCreate);
document.getElementById('btnGuardar')?.addEventListener('click',saveGasto);
document.getElementById('btnCancelar')?.addEventListener('click',()=>AdminUtils.closeModal('modalBackdrop'));
document.getElementById('modalClose')?.addEventListener('click',()=>AdminUtils.closeModal('modalBackdrop'));
document.getElementById('deleteConfirm')?.addEventListener('click',doDelete);
document.getElementById('deleteCancelar')?.addEventListener('click',()=>AdminUtils.closeModal('deleteBackdrop'));
document.getElementById('deleteClose')?.addEventListener('click',()=>AdminUtils.closeModal('deleteBackdrop'));

load();populateEstanciaSelect();renderTable();
