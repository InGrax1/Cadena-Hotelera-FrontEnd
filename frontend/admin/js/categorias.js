/* ─────────────────────────────────────────────────────────────
   LUXORIA — categorias.js  |  Gestión de Categorías CRUD
   ───────────────────────────────────────────────────────────── */
'use strict';

/* ── DATA SEED ───────────────────────────────────────────────── */
const SEED_CATS = [
  { id: 1, nombre: 'Una Estrella',           estrellas: 1, tipoIva: 'Superreducido', porcentajeIva: 4,  descripcion: 'Alojamiento básico y económico.' },
  { id: 2, nombre: 'Dos Estrellas',          estrellas: 2, tipoIva: 'Reducido',      porcentajeIva: 8,  descripcion: 'Servicios estándar a buen precio.' },
  { id: 3, nombre: 'Tres Estrellas',         estrellas: 3, tipoIva: 'Reducido',      porcentajeIva: 10, descripcion: 'Confort medio con servicios adicionales.' },
  { id: 4, nombre: 'Cuatro Estrellas',       estrellas: 4, tipoIva: 'General',       porcentajeIva: 21, descripcion: 'Alta calidad con servicios completos.' },
  { id: 5, nombre: 'Cinco Estrellas',        estrellas: 5, tipoIva: 'General',       porcentajeIva: 21, descripcion: 'Lujo y excelencia en todos los servicios.' },
];

/* Hoteles de ejemplo para contar por categoría */
const HOTEL_CATS = { 1: 0, 2: 0, 3: 1, 4: 2, 5: 3 };

/* ── STATE ───────────────────────────────────────────────────── */
const STORAGE_KEY = 'luxoria_categories';
let cats       = [];
let editingId  = null;
let deletingId = null;
let searchQ    = '';

/* ── PERSISTENCE ─────────────────────────────────────────────── */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cats = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED_CATS));
  } catch {
    cats = JSON.parse(JSON.stringify(SEED_CATS));
  }
}
function saveData() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cats)); } catch {}
}
function nextId() {
  return cats.length ? Math.max(...cats.map(c => c.id)) + 1 : 1;
}

/* ── HELPERS ─────────────────────────────────────────────────── */
function stars(n) { return '⭑'.repeat(Math.min(5, Math.max(1, n))); }
function hotelsFor(estrellas) { return HOTEL_CATS[estrellas] ?? 0; }

/* ── RENDER TABLE ────────────────────────────────────────────── */
function renderTable() {
  const list = cats.filter(c =>
    !searchQ || c.nombre.toLowerCase().includes(searchQ.toLowerCase())
  );
  document.getElementById('tableCount').textContent =
    `Mostrando ${list.length} categoría${list.length !== 1 ? 's' : ''}`;

  document.getElementById('catTableBody').innerHTML = list.map(c => `
    <tr data-id="${c.id}">
      <td class="td-id">#${c.id}</td>
      <td class="td-name">${c.nombre}</td>
      <td><span style="color:var(--gold);letter-spacing:.05em">${stars(c.estrellas)}</span></td>
      <td><span class="cat-badge cat-badge--${c.estrellas}">${c.tipoIva}</span></td>
      <td style="color:var(--gold);font-weight:700">${c.porcentajeIva}%</td>
      <td class="td-muted">${hotelsFor(c.estrellas)} hotel${hotelsFor(c.estrellas) !== 1 ? 'es' : ''}</td>
      <td>
        <div class="td-actions">
          <button class="btn-admin btn-admin--icon"        data-action="edit"   data-id="${c.id}" title="Editar">✎</button>
          <button class="btn-admin btn-admin--icon-danger" data-action="delete" data-id="${c.id}" title="Eliminar">✕</button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('#catTableBody [data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      if (btn.dataset.action === 'edit')   openEditModal(id);
      if (btn.dataset.action === 'delete') openDeleteModal(id);
    });
  });

  renderCards(list);
  renderKpis();
  renderIvaChart(list);
}

/* ── RENDER CARDS ────────────────────────────────────────────── */
function renderCards(list) {
  const wrap = document.getElementById('catCards');
  wrap.innerHTML = list.map(c => `
    <div class="cat-visual-card">
      <div class="cvc-header">
        <span class="cvc-name">${c.nombre}</span>
        <span class="cvc-stars">${stars(c.estrellas)}</span>
      </div>
      <div class="cvc-meta">
        <span class="cvc-pill cvc-pill--iva">IVA ${c.tipoIva}</span>
        <span class="cvc-pill cvc-pill--pct">${c.porcentajeIva}%</span>
        <span class="cvc-pill cvc-pill--hotels">${hotelsFor(c.estrellas)} hoteles</span>
      </div>
      ${c.descripcion ? `<p style="font-size:.65rem;color:var(--muted);margin-top:.6rem;line-height:1.5">${c.descripcion}</p>` : ''}
    </div>
  `).join('');
}

/* ── KPI UPDATE ──────────────────────────────────────────────── */
function renderKpis() {
  const kpiTotal = document.getElementById('kpiTotal');
  if (kpiTotal) kpiTotal.textContent = cats.length;

  const maxIva = cats.length ? Math.max(...cats.map(c => c.porcentajeIva)) : 0;
  const kpiIvaMax = document.getElementById('kpiIvaMax');
  if (kpiIvaMax) kpiIvaMax.textContent = maxIva ? `${maxIva}%` : '—';
}

/* ── IVA CHART ───────────────────────────────────────────────── */
const BAR_COLORS = ['#5cba8c','#4a8ecb','#c9a84c','#e08c5c','#c96aa8'];

function renderIvaChart(list) {
  const barsWrap   = document.getElementById('ivaBars');
  const legendWrap = document.getElementById('ivaLegend');
  if (!barsWrap || !legendWrap || !list.length) return;

  const maxPct = Math.max(...list.map(c => c.porcentajeIva), 1);

  barsWrap.innerHTML = list.map((c, i) => {
    const heightPct = Math.round((c.porcentajeIva / maxPct) * 100);
    const color = BAR_COLORS[i % BAR_COLORS.length];
    return `
      <div class="iva-bar-group">
        <span class="iva-bar-pct">${c.porcentajeIva}%</span>
        <div class="iva-bar-track">
          <div class="iva-bar-fill" style="height:0%;background:linear-gradient(to top,${color},${color}66)"
               data-target="${heightPct}"></div>
        </div>
        <span class="iva-bar-label">${stars(c.estrellas)}</span>
      </div>
    `;
  }).join('');

  legendWrap.innerHTML = list.map((c, i) => `
    <div class="iva-legend-item">
      <div class="iva-legend-dot" style="background:${BAR_COLORS[i % BAR_COLORS.length]}"></div>
      <div class="iva-legend-text">
        <strong>${c.nombre}</strong>
        ${c.tipoIva} — ${c.porcentajeIva}%
      </div>
    </div>
  `).join('');

  // Animate bars
  requestAnimationFrame(() => {
    barsWrap.querySelectorAll('.iva-bar-fill').forEach(bar => {
      const target = bar.dataset.target;
      setTimeout(() => { bar.style.height = target + '%'; }, 100);
    });
  });
}

/* ── FORM MODAL ──────────────────────────────────────────────── */
function clearForm() {
  ['fId','fNombre','fDescripcion'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('fEstrellas').value   = '';
  document.getElementById('fTipoIva').value     = '';
  document.getElementById('fPorcentajeIva').value = '';
  document.getElementById('spStars').textContent = '—';
  document.getElementById('spIva').textContent  = '';
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
  const nombre  = document.getElementById('fNombre').value.trim();
  const ests    = document.getElementById('fEstrellas').value;
  const tipoIva = document.getElementById('fTipoIva').value;
  const pct     = document.getElementById('fPorcentajeIva').value;
  if (!nombre) { setError('fNombre',   'errNombre',   'El nombre es obligatorio.'); ok = false; }
  if (!ests)   { setError('fEstrellas','errEstrellas','Selecciona las estrellas.'); ok = false; }
  if (!tipoIva){ setError('fTipoIva',  'errTipoIva',  'Selecciona el tipo de IVA.'); ok = false; }
  if (!pct || isNaN(pct) || pct < 0 || pct > 100)
               { setError('fPorcentajeIva','errPorcentajeIva','IVA entre 0 y 100.'); ok = false; }
  return ok;
}

/* Live preview */
function updatePreview() {
  const ests   = document.getElementById('fEstrellas').value;
  const tipo   = document.getElementById('fTipoIva').value;
  const pct    = document.getElementById('fPorcentajeIva').value;
  const spStars = document.getElementById('spStars');
  const spIva   = document.getElementById('spIva');
  spStars.textContent = ests ? stars(parseInt(ests)) : '—';
  spIva.textContent   = tipo && pct ? `${tipo} ${pct}%` : '';
}
['fEstrellas','fTipoIva','fPorcentajeIva'].forEach(id =>
  document.getElementById(id)?.addEventListener('change', updatePreview)
);
document.getElementById('fPorcentajeIva')?.addEventListener('input', updatePreview);

function openCreateModal() {
  editingId = null;
  clearForm();
  document.getElementById('modalTitle').textContent = 'Nueva Categoría';
  AdminUtils.openModal('modalBackdrop');
}
function openEditModal(id) {
  editingId = id;
  const c = cats.find(x => x.id === id);
  if (!c) return;
  clearForm();
  document.getElementById('fId').value            = c.id;
  document.getElementById('fNombre').value         = c.nombre;
  document.getElementById('fEstrellas').value      = c.estrellas;
  document.getElementById('fTipoIva').value        = c.tipoIva;
  document.getElementById('fPorcentajeIva').value  = c.porcentajeIva;
  document.getElementById('fDescripcion').value    = c.descripcion ?? '';
  document.getElementById('modalTitle').textContent = 'Editar Categoría';
  updatePreview();
  AdminUtils.openModal('modalBackdrop');
}
function saveCat() {
  if (!validate()) return;
  const data = {
    nombre:        document.getElementById('fNombre').value.trim(),
    estrellas:     parseInt(document.getElementById('fEstrellas').value),
    tipoIva:       document.getElementById('fTipoIva').value,
    porcentajeIva: parseFloat(document.getElementById('fPorcentajeIva').value),
    descripcion:   document.getElementById('fDescripcion').value.trim() || null,
  };
  if (editingId) {
    const idx = cats.findIndex(c => c.id === editingId);
    if (idx !== -1) cats[idx] = { ...cats[idx], ...data };
    AdminUtils.showToast('Categoría actualizada.', 'success');
  } else {
    data.id = nextId();
    cats.push(data);
    AdminUtils.showToast('Categoría creada.', 'success');
  }
  saveData();
  AdminUtils.closeModal('modalBackdrop');
  renderTable();
}

/* ── DELETE ──────────────────────────────────────────────────── */
function openDeleteModal(id) {
  deletingId = id;
  const c = cats.find(x => x.id === id);
  document.getElementById('deleteCatName').textContent = c?.nombre ?? '';
  AdminUtils.openModal('deleteBackdrop');
}
function deleteCat() {
  cats = cats.filter(c => c.id !== deletingId);
  saveData();
  AdminUtils.closeModal('deleteBackdrop');
  AdminUtils.showToast('Categoría eliminada.', 'error');
  renderTable();
}

/* ── SEARCH ──────────────────────────────────────────────────── */
document.getElementById('searchInput')?.addEventListener('input', e => {
  searchQ = e.target.value;
  renderTable();
});

/* ── BINDINGS ────────────────────────────────────────────────── */
document.getElementById('btnNuevo')?.addEventListener('click', openCreateModal);
document.getElementById('btnGuardar')?.addEventListener('click', saveCat);
document.getElementById('btnCancelar')?.addEventListener('click', () => AdminUtils.closeModal('modalBackdrop'));
document.getElementById('modalClose')?.addEventListener('click', () => AdminUtils.closeModal('modalBackdrop'));
document.getElementById('deleteConfirm')?.addEventListener('click', deleteCat);
document.getElementById('deleteCancelar')?.addEventListener('click', () => AdminUtils.closeModal('deleteBackdrop'));
document.getElementById('deleteClose')?.addEventListener('click', () => AdminUtils.closeModal('deleteBackdrop'));

/* ── INIT ────────────────────────────────────────────────────── */
loadData();
renderTable();
