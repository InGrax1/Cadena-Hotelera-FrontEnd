/* ─────────────────────────────────────────────────────────────
   LUXORIA — temporadas.js  |  Gestión de Temporadas CRUD
   ───────────────────────────────────────────────────────────── */
'use strict';

/* ── SEED DATA ───────────────────────────────────────────────── */
const SEED = [
  { id: 1, nombre: 'Temporada Alta Verano',    tipo: 'Alta',  fechaInicio: '2025-06-21', fechaFin: '2025-09-22', multiplicador: 1.8, descripcion: 'Verano europeo. Máxima demanda en destinos de playa y montaña.' },
  { id: 2, nombre: 'Semana Santa',             tipo: 'Alta',  fechaInicio: '2025-04-13', fechaFin: '2025-04-20', multiplicador: 1.6, descripcion: 'Puente festivo de alta ocupación.' },
  { id: 3, nombre: 'Temporada Media Primavera',tipo: 'Media', fechaInicio: '2025-03-01', fechaFin: '2025-06-20', multiplicador: 1.0, descripcion: 'Primavera: clima agradable y flujo moderado de viajeros.' },
  { id: 4, nombre: 'Temporada Media Otoño',    tipo: 'Media', fechaInicio: '2025-09-23', fechaFin: '2025-11-30', multiplicador: 1.1, descripcion: 'Otoño con descenso gradual de la demanda.' },
  { id: 5, nombre: 'Temporada Baja Invierno',  tipo: 'Baja',  fechaInicio: '2025-01-07', fechaFin: '2025-03-31', multiplicador: 0.7, descripcion: 'Invierno general con baja ocupación salvo festivos.' },
  { id: 6, nombre: 'Navidad y Año Nuevo',      tipo: 'Alta',  fechaInicio: '2025-12-20', fechaFin: '2026-01-06', multiplicador: 1.9, descripcion: 'Festivos de diciembre. Demanda máxima del año.' },
  { id: 7, nombre: 'Puente de Noviembre',      tipo: 'Media', fechaInicio: '2025-11-01', fechaFin: '2025-11-02', multiplicador: 1.3, descripcion: 'Puente de Todos los Santos.' },
];

/* ── TIPO CONFIG ─────────────────────────────────────────────── */
const TIPO_CFG = {
  Alta:  { icon: '☀', color: '#e05c5c', colorDim: 'rgba(224,92,92,.15)',  colorBorder: 'rgba(224,92,92,.3)'  },
  Media: { icon: '⟳', color: '#4a8ecb', colorDim: 'rgba(74,142,203,.15)', colorBorder: 'rgba(74,142,203,.3)' },
  Baja:  { icon: '❄', color: '#5cba8c', colorDim: 'rgba(92,186,140,.15)', colorBorder: 'rgba(92,186,140,.3)' },
};

/* ── STATE ───────────────────────────────────────────────────── */
const KEY      = 'luxoria_temporadas';
let temps      = [];
let editingId  = null;
let deletingId = null;
let selectedId = null;
let searchQ    = '';
let filterTipo = '';
let yearView   = new Date().getFullYear();

/* ── PERSISTENCE ─────────────────────────────────────────────── */
function load() {
  try { temps = JSON.parse(localStorage.getItem(KEY)) || JSON.parse(JSON.stringify(SEED)); }
  catch { temps = JSON.parse(JSON.stringify(SEED)); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(temps)); } catch {} }
function nextId() { return temps.length ? Math.max(...temps.map(t => t.id)) + 1 : 1; }

/* ── HELPERS ─────────────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return '—';
  const [y, m, dd] = d.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(dd)} ${months[parseInt(m) - 1]} ${y}`;
}
function daysBetween(a, b) {
  const ms = new Date(b) - new Date(a);
  return Math.max(0, Math.round(ms / 86400000));
}
function isActive(t) {
  const now = new Date().toISOString().slice(0, 10);
  return t.fechaInicio <= now && t.fechaFin >= now;
}
function tipoBadge(tipo) {
  const cfg = TIPO_CFG[tipo] ?? TIPO_CFG.Media;
  return `<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.25rem .65rem;
    border-radius:999px;font-size:.62rem;border:1px solid ${cfg.colorBorder};
    background:${cfg.colorDim};color:${cfg.color}">${cfg.icon} ${tipo}</span>`;
}
function statusBadge(t) {
  if (isActive(t))
    return `<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.2rem .6rem;
      border-radius:999px;font-size:.6rem;background:rgba(92,186,140,.15);
      border:1px solid rgba(92,186,140,.3);color:#5cba8c">◉ Activa</span>`;
  const now = new Date().toISOString().slice(0, 10);
  if (t.fechaFin < now)
    return `<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.2rem .6rem;
      border-radius:999px;font-size:.6rem;background:var(--white-dim);
      border:1px solid var(--card-border);color:var(--muted)">◎ Finalizada</span>`;
  return `<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.2rem .6rem;
    border-radius:999px;font-size:.6rem;background:rgba(201,168,76,.12);
    border:1px solid rgba(201,168,76,.25);color:var(--gold)">◇ Próxima</span>`;
}

/* ── YEAR SELECT ─────────────────────────────────────────────── */
function buildYearSelect() {
  const sel = document.getElementById('yearSelect');
  if (!sel) return;
  const years = new Set(temps.flatMap(t => [
    new Date(t.fechaInicio).getFullYear(),
    new Date(t.fechaFin).getFullYear()
  ]));
  years.add(new Date().getFullYear());
  years.add(new Date().getFullYear() + 1);
  [...years].sort().forEach(y => {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    if (y === yearView) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', e => { yearView = parseInt(e.target.value); renderTimeline(); });
}

/* ── CALENDAR TIMELINE ───────────────────────────────────────── */
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function renderTimeline() {
  const wrap = document.getElementById('timelineWrap');
  if (!wrap) return;

  const yearStart = new Date(`${yearView}-01-01`);
  const yearEnd   = new Date(`${yearView}-12-31`);
  const yearDays  = (yearEnd - yearStart) / 86400000 + 1;

  // Month markers
  const monthMarkers = MONTHS.map((m, i) => {
    const d      = new Date(yearView, i, 1);
    const offset = (d - yearStart) / 86400000;
    const pct    = (offset / yearDays) * 100;
    return `<div class="tl-month" style="left:${pct.toFixed(2)}%">
      <span>${m}</span>
    </div>`;
  }).join('');

  // Temporada bars
  const bars = temps.map(t => {
    const cfg   = TIPO_CFG[t.tipo] ?? TIPO_CFG.Media;
    const start = new Date(t.fechaInicio);
    const end   = new Date(t.fechaFin);

    // Clip to year
    const s = start < yearStart ? yearStart : start;
    const e = end   > yearEnd   ? yearEnd   : end;
    if (s > yearEnd || e < yearStart) return ''; // outside year

    const left  = ((s - yearStart) / 86400000 / yearDays) * 100;
    const width = ((e - s)         / 86400000 / yearDays) * 100 + (1 / yearDays * 100);

    return `
      <div class="tl-row">
        <div class="tl-label" title="${t.nombre}">${t.nombre}</div>
        <div class="tl-track">
          <div class="tl-bar" style="
            left:${left.toFixed(2)}%;
            width:${Math.min(width, 100 - left).toFixed(2)}%;
            background:linear-gradient(90deg,${cfg.color},${cfg.color}bb);
            box-shadow:0 0 8px ${cfg.color}44;
          " title="${t.nombre}: ${fmtDate(t.fechaInicio)} – ${fmtDate(t.fechaFin)}">
            <span class="tl-bar-text">${cfg.icon} ${t.tipo}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Today marker
  const today    = new Date();
  const todayPct = ((today - yearStart) / 86400000 / yearDays) * 100;
  const todayMark = todayPct >= 0 && todayPct <= 100
    ? `<div class="tl-today" style="left:${todayPct.toFixed(2)}%"><span class="tl-today-label">HOY</span></div>`
    : '';

  wrap.innerHTML = `
    <div class="tl-container">
      <div class="tl-header">
        <div class="tl-header-label">Temporada</div>
        <div class="tl-header-months">${monthMarkers}${todayMark}</div>
      </div>
      <div class="tl-body">
        ${bars || '<p style="padding:1.5rem;font-size:.72rem;color:var(--muted)">Sin temporadas para este año.</p>'}
      </div>
    </div>
  `;
}

/* ── RENDER TABLE ────────────────────────────────────────────── */
function renderTable() {
  let list = [...temps];
  if (searchQ)    list = list.filter(t => t.nombre.toLowerCase().includes(searchQ.toLowerCase()));
  if (filterTipo) list = list.filter(t => t.tipo === filterTipo);

  document.getElementById('tableCount').textContent =
    `Mostrando ${list.length} temporada${list.length !== 1 ? 's' : ''}`;

  document.getElementById('tempTableBody').innerHTML = list.map(t => {
    const days = daysBetween(t.fechaInicio, t.fechaFin);
    return `
      <tr data-id="${t.id}" class="${selectedId === t.id ? 'row--selected' : ''}">
        <td class="td-id">#${t.id}</td>
        <td class="td-name">${t.nombre}</td>
        <td>${tipoBadge(t.tipo)}</td>
        <td class="td-muted">${fmtDate(t.fechaInicio)}</td>
        <td class="td-muted">${fmtDate(t.fechaFin)}</td>
        <td class="td-muted">${days} día${days !== 1 ? 's' : ''}</td>
        <td>${statusBadge(t)}</td>
        <td>
          <div class="td-actions">
            <button class="btn-admin btn-admin--icon"        data-action="view"   data-id="${t.id}" title="Detalles">◎</button>
            <button class="btn-admin btn-admin--icon"        data-action="edit"   data-id="${t.id}" title="Editar">✎</button>
            <button class="btn-admin btn-admin--icon-danger" data-action="delete" data-id="${t.id}" title="Eliminar">✕</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('#tempTableBody tr').forEach(tr => {
    tr.addEventListener('click', e => {
      if (e.target.closest('[data-action]')) return;
      selectTemp(parseInt(tr.dataset.id));
    });
  });
  document.querySelectorAll('#tempTableBody [data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id  = parseInt(btn.dataset.id);
      const act = btn.dataset.action;
      if (act === 'view')   selectTemp(id);
      if (act === 'edit')   openEditModal(id);
      if (act === 'delete') openDeleteModal(id);
    });
  });

  renderKpis();
  renderTimeline();
}

/* ── DETAIL PANEL ────────────────────────────────────────────── */
function selectTemp(id) {
  selectedId = id;
  renderTable();
  const t   = temps.find(x => x.id === id);
  const ph  = document.getElementById('detailPlaceholder');
  const dc  = document.getElementById('detailContent');
  if (!t) { ph.style.display = ''; dc.style.display = 'none'; return; }

  const cfg  = TIPO_CFG[t.tipo] ?? TIPO_CFG.Media;
  const days = daysBetween(t.fechaInicio, t.fechaFin);

  ph.style.display = 'none';
  dc.style.display = '';
  dc.innerHTML = `
    <div style="padding:1.5rem">
      <div style="font-size:2.5rem;color:${cfg.color};margin-bottom:.5rem">${cfg.icon}</div>
      <div class="detail-hotel-name">${t.nombre}</div>
      <div class="detail-cat" style="margin:.5rem 0 1.2rem">${tipoBadge(t.tipo)} ${statusBadge(t)}</div>

      <div class="detail-rows">
        <div class="detail-row">
          <span class="detail-row-label">Fecha inicio</span>
          <span class="detail-row-value">${fmtDate(t.fechaInicio)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-row-label">Fecha fin</span>
          <span class="detail-row-value">${fmtDate(t.fechaFin)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-row-label">Duración</span>
          <span class="detail-row-value" style="color:var(--gold)">${days} días</span>
        </div>
        ${t.multiplicador != null ? `
        <div class="detail-row">
          <span class="detail-row-label">Multiplicador de tarifa</span>
          <span class="detail-row-value" style="color:${cfg.color};font-weight:700">×${t.multiplicador}</span>
        </div>` : ''}
        ${t.descripcion ? `
        <div class="detail-divider"></div>
        <div class="detail-row">
          <span class="detail-row-label">Descripción</span>
          <span class="detail-row-value">${t.descripcion}</span>
        </div>` : ''}
      </div>

      <!-- Mini duration bar -->
      <div style="margin-top:1.2rem">
        <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem">
          Peso del año
        </div>
        <div style="height:6px;background:var(--bg-3);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${Math.min((days/365)*100,100).toFixed(1)}%;
            background:${cfg.color};border-radius:3px;
            transition:width .8s cubic-bezier(.4,0,.2,1)"></div>
        </div>
        <div style="font-size:.6rem;color:var(--muted);margin-top:.3rem">
          ${((days/365)*100).toFixed(1)}% del año
        </div>
      </div>

      <div class="detail-actions">
        <button class="btn-admin btn-admin--primary" id="detailEditBtn">Editar</button>
        <button class="btn-admin btn-admin--icon-danger" id="detailDeleteBtn">✕ Eliminar</button>
      </div>
    </div>
  `;

  document.getElementById('detailEditBtn')?.addEventListener('click', () => openEditModal(id));
  document.getElementById('detailDeleteBtn')?.addEventListener('click', () => openDeleteModal(id));
}

/* ── KPIs ────────────────────────────────────────────────────── */
function renderKpis() {
  const now = new Date().toISOString().slice(0, 10);
  document.getElementById('kpiActivas').textContent =
    temps.filter(t => t.fechaInicio <= now && t.fechaFin >= now).length;
  document.getElementById('kpiAltas').textContent  = temps.filter(t => t.tipo === 'Alta').length;
  document.getElementById('kpiMedias').textContent = temps.filter(t => t.tipo === 'Media').length;
  document.getElementById('kpiBajas').textContent  = temps.filter(t => t.tipo === 'Baja').length;
}

/* ── DURATION PREVIEW (modal) ────────────────────────────────── */
function updateDurPreview() {
  const fi  = document.getElementById('fFechaInicio').value;
  const ff  = document.getElementById('fFechaFin').value;
  const div = document.getElementById('durPreview');
  const badge = document.getElementById('durBadge');
  const info  = document.getElementById('durInfo');
  const tipo  = document.getElementById('fTipo').value;
  const mult  = document.getElementById('fMultiplicador').value;

  if (!fi || !ff) { div.style.display = 'none'; return; }
  if (ff < fi) { div.style.display = 'none'; return; }

  const days = daysBetween(fi, ff);
  const cfg  = TIPO_CFG[tipo] ?? { color: 'var(--gold)', icon: '◉' };
  div.style.display = 'flex';
  badge.innerHTML = tipoBadge(tipo || 'Media');
  info.innerHTML  = `
    <span style="font-size:.7rem;color:var(--muted)">
      ${fmtDate(fi)} → ${fmtDate(ff)} —
      <strong style="color:var(--white)">${days} días</strong>
      ${mult ? `· Tarifa <strong style="color:${cfg.color}">×${mult}</strong>` : ''}
    </span>
  `;
}
['fFechaInicio','fFechaFin','fTipo','fMultiplicador'].forEach(id =>
  document.getElementById(id)?.addEventListener('change', updateDurPreview)
);
document.getElementById('fMultiplicador')?.addEventListener('input', updateDurPreview);

/* ── MODAL FORM ──────────────────────────────────────────────── */
function clearForm() {
  ['fId','fNombre','fDescripcion','fMultiplicador','fFechaInicio','fFechaFin'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('fTipo').value = '';
  document.getElementById('durPreview').style.display = 'none';
  clearErrors();
}
function clearErrors() {
  document.querySelectorAll('.field-err').forEach(el => el.textContent = '');
  document.querySelectorAll('.field--error').forEach(el => el.classList.remove('field--error'));
}
function setErr(fId, eId, msg) {
  document.getElementById(fId)?.classList.add('field--error');
  const e = document.getElementById(eId); if (e) e.textContent = msg;
}
function validate() {
  clearErrors(); let ok = true;
  const n  = document.getElementById('fNombre').value.trim();
  const tp = document.getElementById('fTipo').value;
  const fi = document.getElementById('fFechaInicio').value;
  const ff = document.getElementById('fFechaFin').value;
  if (!n)  { setErr('fNombre','errNombre','El nombre es obligatorio.'); ok = false; }
  if (!tp) { setErr('fTipo','errTipo','Selecciona un tipo.'); ok = false; }
  if (!fi) { setErr('fFechaInicio','errFechaInicio','La fecha de inicio es obligatoria.'); ok = false; }
  if (!ff) { setErr('fFechaFin','errFechaFin','La fecha de fin es obligatoria.'); ok = false; }
  if (fi && ff && ff < fi) { setErr('fFechaFin','errFechaFin','La fecha fin debe ser posterior al inicio.'); ok = false; }
  return ok;
}

function openCreateModal() {
  editingId = null; clearForm();
  document.getElementById('modalTitle').textContent = 'Nueva Temporada';
  AdminUtils.openModal('modalBackdrop');
}
function openEditModal(id) {
  editingId = id;
  const t = temps.find(x => x.id === id); if (!t) return;
  clearForm();
  document.getElementById('fId').value           = t.id;
  document.getElementById('fNombre').value        = t.nombre;
  document.getElementById('fTipo').value          = t.tipo;
  document.getElementById('fFechaInicio').value   = t.fechaInicio;
  document.getElementById('fFechaFin').value      = t.fechaFin;
  document.getElementById('fMultiplicador').value = t.multiplicador ?? '';
  document.getElementById('fDescripcion').value   = t.descripcion ?? '';
  document.getElementById('modalTitle').textContent = 'Editar Temporada';
  updateDurPreview();
  AdminUtils.openModal('modalBackdrop');
}
function saveTemp() {
  if (!validate()) return;
  const data = {
    nombre:        document.getElementById('fNombre').value.trim(),
    tipo:          document.getElementById('fTipo').value,
    fechaInicio:   document.getElementById('fFechaInicio').value,
    fechaFin:      document.getElementById('fFechaFin').value,
    multiplicador: parseFloat(document.getElementById('fMultiplicador').value) || null,
    descripcion:   document.getElementById('fDescripcion').value.trim() || null,
  };
  if (editingId) {
    const i = temps.findIndex(t => t.id === editingId);
    if (i !== -1) temps[i] = { ...temps[i], ...data };
    AdminUtils.showToast('Temporada actualizada.', 'success');
  } else {
    data.id = nextId(); temps.push(data);
    AdminUtils.showToast('Temporada creada.', 'success');
  }
  save(); AdminUtils.closeModal('modalBackdrop');
  if (selectedId === editingId) selectTemp(editingId);
  renderTable();
}

/* ── DELETE ──────────────────────────────────────────────────── */
function openDeleteModal(id) {
  deletingId = id;
  const t = temps.find(x => x.id === id);
  document.getElementById('deleteTempName').textContent = t?.nombre ?? '';
  AdminUtils.openModal('deleteBackdrop');
}
function doDelete() {
  temps = temps.filter(t => t.id !== deletingId);
  save(); AdminUtils.closeModal('deleteBackdrop');
  AdminUtils.showToast('Temporada eliminada.', 'error');
  if (selectedId === deletingId) {
    selectedId = null;
    document.getElementById('detailPlaceholder').style.display = '';
    document.getElementById('detailContent').style.display = 'none';
  }
  renderTable();
}

/* ── BINDINGS ────────────────────────────────────────────────── */
document.getElementById('searchInput')?.addEventListener('input', e => { searchQ = e.target.value; renderTable(); });
document.getElementById('filterTipo')?.addEventListener('change', e => { filterTipo = e.target.value; renderTable(); });
document.getElementById('btnNuevo')?.addEventListener('click', openCreateModal);
document.getElementById('btnGuardar')?.addEventListener('click', saveTemp);
document.getElementById('btnCancelar')?.addEventListener('click', () => AdminUtils.closeModal('modalBackdrop'));
document.getElementById('modalClose')?.addEventListener('click', () => AdminUtils.closeModal('modalBackdrop'));
document.getElementById('deleteConfirm')?.addEventListener('click', doDelete);
document.getElementById('deleteCancelar')?.addEventListener('click', () => AdminUtils.closeModal('deleteBackdrop'));
document.getElementById('deleteClose')?.addEventListener('click', () => AdminUtils.closeModal('deleteBackdrop'));

/* ── INIT ────────────────────────────────────────────────────── */
load();
buildYearSelect();
renderTable();
