/* ─────────────────────────────────────────────────────────────
   LUXORIA — hoteles.js  |  Gestión de Hoteles CRUD
   ───────────────────────────────────────────────────────────── */
'use strict';

/* ── DATA SEED ───────────────────────────────────────────────── */
const SEED_HOTELS = [
  { id: 1, nombre: 'Grand Luxoria Madrid',    direccion: 'Paseo de la Castellana 200, Madrid, España',     telefono: '+34 91 555 0100', anio: 1994, categoria: 5, habitaciones: 120, email: 'madrid@luxoria.com',    web: 'https://luxoria.com/madrid',    notas: 'Hotel insignia de la cadena.' },
  { id: 2, nombre: 'Luxoria Paris',           direccion: '12 Rue de Rivoli, París, Francia',                telefono: '+33 1 40 20 30 40', anio: 2001, categoria: 5, habitaciones: 85,  email: 'paris@luxoria.com',     web: 'https://luxoria.com/paris',     notas: 'Vistas a la Torre Eiffel.' },
  { id: 3, nombre: 'Aegean Luxoria',          direccion: 'Oia 84702, Santorini, Grecia',                    telefono: '+30 22860 71500',   anio: 2008, categoria: 4, habitaciones: 48,  email: 'santorini@luxoria.com', web: 'https://luxoria.com/santorini', notas: 'Piscina infinita con vistas al Mar Egeo.' },
  { id: 4, nombre: 'Desert Pearl Luxoria',    direccion: 'Sheikh Zayed Road, Dubái, EAU',                   telefono: '+971 4 302 5555',   anio: 2015, categoria: 5, habitaciones: 200, email: 'dubai@luxoria.com',     web: 'https://luxoria.com/dubai',     notas: 'El hotel más alto de la cadena.' },
  { id: 5, nombre: 'Luxoria Barcelona',       direccion: 'Passeig de Gràcia 88, Barcelona, España',         telefono: '+34 93 488 0100',   anio: 1999, categoria: 4, habitaciones: 95,  email: 'bcn@luxoria.com',       web: 'https://luxoria.com/barcelona', notas: 'Edificio modernista catalogado.' },
  { id: 6, nombre: 'Luxoria Roma',            direccion: 'Via Veneto 125, Roma, Italia',                    telefono: '+39 06 4741 2345',  anio: 1987, categoria: 3, habitaciones: 60,  email: 'roma@luxoria.com',      web: 'https://luxoria.com/roma',      notas: 'Hotel más antiguo de la cadena.' },
];

/* ── STATE ───────────────────────────────────────────────────── */
const STORAGE_KEY = 'luxoria_hotels';
let hotels      = [];
let editingId   = null;
let deletingId  = null;
let selectedId  = null;
let currentPage = 1;
const PAGE_SIZE = 5;
let sortCol     = 'id';
let sortDir     = 'asc';
let searchQuery = '';
let filterCat   = '';

/* ── PERSISTENCE ─────────────────────────────────────────────── */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    hotels = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED_HOTELS));
  } catch {
    hotels = JSON.parse(JSON.stringify(SEED_HOTELS));
  }
}
function saveData() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels)); } catch {}
}
function nextId() {
  return hotels.length ? Math.max(...hotels.map(h => h.id)) + 1 : 1;
}

/* ── STAR RENDERER ───────────────────────────────────────────── */
function stars(n) {
  return '⭑'.repeat(Math.min(5, Math.max(1, n)));
}
function catBadge(n) {
  return `<span class="cat-badge cat-badge--${n}">${stars(n)} ${n} Estrella${n !== 1 ? 's' : ''}</span>`;
}

/* ── FILTER & SORT ───────────────────────────────────────────── */
function filtered() {
  let list = [...hotels];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(h =>
      h.nombre.toLowerCase().includes(q) ||
      h.direccion.toLowerCase().includes(q) ||
      h.telefono.includes(q)
    );
  }
  if (filterCat) list = list.filter(h => h.categoria === parseInt(filterCat));
  list.sort((a, b) => {
    let va = a[sortCol], vb = b[sortCol];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });
  return list;
}

/* ── RENDER TABLE ────────────────────────────────────────────── */
function renderTable() {
  const list  = filtered();
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > pages) currentPage = pages;

  const slice = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const tbody = document.getElementById('hotelTableBody');

  document.getElementById('tableCount').textContent =
    `Mostrando ${slice.length} de ${total} hotel${total !== 1 ? 'es' : ''}`;

  tbody.innerHTML = slice.map(h => `
    <tr data-id="${h.id}" class="${selectedId === h.id ? 'row--selected' : ''}">
      <td class="td-id">#${h.id}</td>
      <td class="td-name">${h.nombre}</td>
      <td class="td-muted">${h.direccion.split(',').slice(-2).join(',').trim()}</td>
      <td class="td-muted">${h.telefono}</td>
      <td class="td-muted">${h.anio}</td>
      <td>${catBadge(h.categoria)}</td>
      <td class="td-muted">${h.habitaciones ?? '—'}</td>
      <td>
        <div class="td-actions">
          <button class="btn-admin btn-admin--icon" data-action="view"  data-id="${h.id}" title="Ver detalles">◎</button>
          <button class="btn-admin btn-admin--icon" data-action="edit"  data-id="${h.id}" title="Editar">✎</button>
          <button class="btn-admin btn-admin--icon-danger" data-action="delete" data-id="${h.id}" title="Eliminar">✕</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Row click → select & detail
  tbody.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', (e) => {
      if (e.target.closest('[data-action]')) return;
      const id = parseInt(tr.dataset.id);
      selectHotel(id);
    });
  });

  // Action buttons
  tbody.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id  = parseInt(btn.dataset.id);
      const act = btn.dataset.action;
      if (act === 'view')   selectHotel(id);
      if (act === 'edit')   openEditModal(id);
      if (act === 'delete') openDeleteModal(id);
    });
  });

  renderPagination(pages);
}

/* ── PAGINATION ──────────────────────────────────────────────── */
function renderPagination(pages) {
  const pg = document.getElementById('pagination');
  pg.innerHTML = '';
  if (pages <= 1) return;
  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn${i === currentPage ? ' page-btn--active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => { currentPage = i; renderTable(); });
    pg.appendChild(btn);
  }
}

/* ── DETAIL PANEL ────────────────────────────────────────────── */
function selectHotel(id) {
  selectedId = id;
  renderTable();
  const h  = hotels.find(x => x.id === id);
  const ph = document.getElementById('detailPlaceholder');
  const dc = document.getElementById('detailContent');
  if (!h) { ph.style.display = ''; dc.style.display = 'none'; return; }
  ph.style.display = 'none';
  dc.style.display = '';
  dc.innerHTML = `
    <div class="detail-hotel-name">${h.nombre}</div>
    <div class="detail-cat">${catBadge(h.categoria)}</div>
    <div class="detail-rows">
      <div class="detail-row">
        <span class="detail-row-label">Dirección</span>
        <span class="detail-row-value">${h.direccion}</span>
      </div>
      <div class="detail-row">
        <span class="detail-row-label">Teléfono</span>
        <span class="detail-row-value">${h.telefono}</span>
      </div>
      <div class="detail-row">
        <span class="detail-row-label">Año de construcción</span>
        <span class="detail-row-value">${h.anio}</span>
      </div>
      <div class="detail-row">
        <span class="detail-row-label">Habitaciones</span>
        <span class="detail-row-value">${h.habitaciones ?? '—'}</span>
      </div>
      ${h.email ? `<div class="detail-row"><span class="detail-row-label">Email</span><span class="detail-row-value">${h.email}</span></div>` : ''}
      ${h.web ? `<div class="detail-row"><span class="detail-row-label">Web</span><span class="detail-row-value" style="word-break:break-all">${h.web}</span></div>` : ''}
      ${h.notas ? `<div class="detail-divider"></div><div class="detail-row"><span class="detail-row-label">Notas</span><span class="detail-row-value">${h.notas}</span></div>` : ''}
    </div>
    <div class="detail-actions">
      <button class="btn-admin btn-admin--primary" id="detailEditBtn">Editar hotel</button>
      <button class="btn-admin btn-admin--icon-danger" id="detailDeleteBtn">✕ Eliminar</button>
    </div>
  `;
  document.getElementById('detailEditBtn').addEventListener('click', () => openEditModal(id));
  document.getElementById('detailDeleteBtn').addEventListener('click', () => openDeleteModal(id));
}

/* ── KPI UPDATE ──────────────────────────────────────────────── */
function updateKpis() {
  const totalEl = document.querySelector('.kpi-card:nth-child(1) .kpi-value');
  if (totalEl) { totalEl.dataset.count = hotels.length; totalEl.textContent = hotels.length; }
}

/* ── FORM MODAL ──────────────────────────────────────────────── */
function clearForm() {
  ['fId','fNombre','fDireccion','fTelefono','fAnio','fHabitaciones','fEmail','fWeb','fNotas'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('fCategoria').value = '';
  clearErrors();
}
function clearErrors() {
  document.querySelectorAll('.field-err').forEach(el => el.textContent = '');
  document.querySelectorAll('.field--error').forEach(el => el.classList.remove('field--error'));
}
function setError(fieldId, errId, msg) {
  document.getElementById(fieldId)?.classList.add('field--error');
  const e = document.getElementById(errId);
  if (e) e.textContent = msg;
}
function validate() {
  clearErrors();
  let ok = true;
  const nombre    = document.getElementById('fNombre').value.trim();
  const direccion = document.getElementById('fDireccion').value.trim();
  const telefono  = document.getElementById('fTelefono').value.trim();
  const anio      = document.getElementById('fAnio').value.trim();
  const categoria = document.getElementById('fCategoria').value;
  if (!nombre)    { setError('fNombre',    'errNombre',    'El nombre es obligatorio.'); ok = false; }
  if (!direccion) { setError('fDireccion', 'errDireccion', 'La dirección es obligatoria.'); ok = false; }
  if (!telefono)  { setError('fTelefono',  'errTelefono',  'El teléfono es obligatorio.'); ok = false; }
  if (!anio || isNaN(anio) || anio < 1800 || anio > 2099)
                  { setError('fAnio', 'errAnio', 'Año válido entre 1800 y 2099.'); ok = false; }
  if (!categoria) { setError('fCategoria', 'errCategoria', 'Selecciona una categoría.'); ok = false; }
  return ok;
}

function openCreateModal() {
  editingId = null;
  clearForm();
  document.getElementById('modalTitle').textContent = 'Nuevo Hotel';
  document.getElementById('btnGuardarText').textContent = 'Guardar hotel';
  AdminUtils.openModal('modalBackdrop');
}
function openEditModal(id) {
  editingId = id;
  const h = hotels.find(x => x.id === id);
  if (!h) return;
  clearForm();
  document.getElementById('fId').value           = h.id;
  document.getElementById('fNombre').value        = h.nombre;
  document.getElementById('fDireccion').value     = h.direccion;
  document.getElementById('fTelefono').value      = h.telefono;
  document.getElementById('fAnio').value          = h.anio;
  document.getElementById('fCategoria').value     = h.categoria;
  document.getElementById('fHabitaciones').value  = h.habitaciones ?? '';
  document.getElementById('fEmail').value         = h.email ?? '';
  document.getElementById('fWeb').value           = h.web ?? '';
  document.getElementById('fNotas').value         = h.notas ?? '';
  document.getElementById('modalTitle').textContent    = 'Editar Hotel';
  document.getElementById('btnGuardarText').textContent = 'Guardar cambios';
  AdminUtils.openModal('modalBackdrop');
}
function saveHotel() {
  if (!validate()) return;
  const data = {
    nombre:       document.getElementById('fNombre').value.trim(),
    direccion:    document.getElementById('fDireccion').value.trim(),
    telefono:     document.getElementById('fTelefono').value.trim(),
    anio:         parseInt(document.getElementById('fAnio').value),
    categoria:    parseInt(document.getElementById('fCategoria').value),
    habitaciones: parseInt(document.getElementById('fHabitaciones').value) || null,
    email:        document.getElementById('fEmail').value.trim() || null,
    web:          document.getElementById('fWeb').value.trim() || null,
    notas:        document.getElementById('fNotas').value.trim() || null,
  };
  if (editingId) {
    const idx = hotels.findIndex(h => h.id === editingId);
    if (idx !== -1) hotels[idx] = { ...hotels[idx], ...data };
    AdminUtils.showToast('Hotel actualizado correctamente.', 'success');
  } else {
    data.id = nextId();
    hotels.push(data);
    AdminUtils.showToast('Hotel registrado correctamente.', 'success');
  }
  saveData();
  AdminUtils.closeModal('modalBackdrop');
  updateKpis();
  renderTable();
  if (selectedId === editingId) selectHotel(editingId);
}

/* ── DELETE MODAL ────────────────────────────────────────────── */
function openDeleteModal(id) {
  deletingId = id;
  const h = hotels.find(x => x.id === id);
  document.getElementById('deleteHotelName').textContent = h?.nombre ?? '';
  AdminUtils.openModal('deleteBackdrop');
}
function deleteHotel() {
  hotels = hotels.filter(h => h.id !== deletingId);
  saveData();
  if (selectedId === deletingId) {
    selectedId = null;
    document.getElementById('detailPlaceholder').style.display = '';
    document.getElementById('detailContent').style.display = 'none';
  }
  AdminUtils.closeModal('deleteBackdrop');
  AdminUtils.showToast('Hotel eliminado.', 'error');
  updateKpis();
  renderTable();
}

/* ── SORT ────────────────────────────────────────────────────── */
document.querySelectorAll('#hotelTable th[data-col]').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.col;
    if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else { sortCol = col; sortDir = 'asc'; }
    currentPage = 1;
    renderTable();
  });
});

/* ── SEARCH & FILTER ─────────────────────────────────────────── */
document.getElementById('searchInput')?.addEventListener('input', e => {
  searchQuery = e.target.value;
  currentPage = 1;
  renderTable();
});
document.getElementById('filterCat')?.addEventListener('change', e => {
  filterCat   = e.target.value;
  currentPage = 1;
  renderTable();
});

/* ── BUTTON BINDINGS ─────────────────────────────────────────── */
document.getElementById('btnNuevo')?.addEventListener('click', openCreateModal);
document.getElementById('btnGuardar')?.addEventListener('click', saveHotel);
document.getElementById('btnCancelar')?.addEventListener('click', () => AdminUtils.closeModal('modalBackdrop'));
document.getElementById('modalClose')?.addEventListener('click', () => AdminUtils.closeModal('modalBackdrop'));
document.getElementById('deleteConfirm')?.addEventListener('click', deleteHotel);
document.getElementById('deleteCancelar')?.addEventListener('click', () => AdminUtils.closeModal('deleteBackdrop'));
document.getElementById('deleteClose')?.addEventListener('click', () => AdminUtils.closeModal('deleteBackdrop'));

/* ── INIT ────────────────────────────────────────────────────── */
loadData();
updateKpis();
renderTable();
