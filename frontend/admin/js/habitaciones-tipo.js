/* ─────────────────────────────────────────────────────────────
   LUXORIA — habitaciones-tipo.js  |  Tipos de Habitación CRUD
   ───────────────────────────────────────────────────────────── */
'use strict';

/* ── SEED DATA ───────────────────────────────────────────────── */
const SEED = [
  { id: 1, nombre: 'Individual',           descripcion: 'Habitación para una persona con cama individual. Ideal para viajeros de negocios o solitarios.', capacidad: 1, icono: '◎' },
  { id: 2, nombre: 'Doble',                descripcion: 'Habitación con cama doble o dos camas individuales. Perfecta para parejas o amigos.', capacidad: 2, icono: '◎' },
  { id: 3, nombre: 'Triple',               descripcion: 'Habitación con tres camas. Diseñada para familias o grupos pequeños.', capacidad: 3, icono: '▣' },
  { id: 4, nombre: 'Suite',                descripcion: 'Suite con sala de estar separada, amenities premium y vistas privilegiadas.', capacidad: 2, icono: '◇' },
  { id: 5, nombre: 'Suite Junior',         descripcion: 'Suite compacta con zona de salón integrada. Entre la doble y la suite completa.', capacidad: 2, icono: '◇' },
  { id: 6, nombre: 'Suite Presidencial',   descripcion: 'La cumbre del lujo. Varias habitaciones, mayordomía 24 h, acceso exclusivo y servicios VIP.', capacidad: 4, icono: '◈' },
  { id: 7, nombre: 'Familiar',             descripcion: 'Habitación grande con múltiples camas para grupos familiares de hasta 4 personas.', capacidad: 4, icono: '⬡' },
];

/* ── STATE ───────────────────────────────────────────────────── */
const KEY      = 'luxoria_room_types';
let tipos      = [];
let editingId  = null;
let deletingId = null;
let searchQ    = '';

/* ── PERSISTENCE ─────────────────────────────────────────────── */
function load() {
  try { tipos = JSON.parse(localStorage.getItem(KEY)) || JSON.parse(JSON.stringify(SEED)); }
  catch { tipos = JSON.parse(JSON.stringify(SEED)); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(tipos)); } catch {} }
function nextId() { return tipos.length ? Math.max(...tipos.map(t => t.id)) + 1 : 1; }

/* ── CAPACITY DOTS ───────────────────────────────────────────── */
function capDots(n, size = 'md') {
  const max   = Math.min(n, 10);
  const px    = size === 'sm' ? 8 : 12;
  const gap   = size === 'sm' ? 3 : 5;
  const color = 'var(--gold)';
  return Array.from({ length: max }, () =>
    `<span style="display:inline-block;width:${px}px;height:${px}px;border-radius:50%;background:${color};margin-right:${gap}px;vertical-align:middle"></span>`
  ).join('') + (n > 10 ? `<span style="font-size:.65rem;color:var(--muted);margin-left:2px">+${n - 10}</span>` : '');
}

/* ── CAP BADGE ───────────────────────────────────────────────── */
function capBadge(n) {
  const colors = { 1: '#5cba8c', 2: '#4a8ecb', 3: '#c9a84c', 4: '#e08c5c' };
  const color  = colors[Math.min(n, 4)] ?? '#c9a84c';
  return `<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.2rem .6rem;border-radius:999px;font-size:.62rem;border:1px solid ${color}44;background:${color}18;color:${color}">
    <span style="font-size:.75rem">⬡</span> ${n} persona${n !== 1 ? 's' : ''}
  </span>`;
}

/* ── RENDER TABLE ────────────────────────────────────────────── */
function renderTable() {
  const list = tipos.filter(t => !searchQ || t.nombre.toLowerCase().includes(searchQ.toLowerCase()));
  document.getElementById('tableCount').textContent =
    `Mostrando ${list.length} tipo${list.length !== 1 ? 's' : ''}`;

  document.getElementById('tipoTableBody').innerHTML = list.map(t => `
    <tr data-id="${t.id}">
      <td class="td-id">#${t.id}</td>
      <td><span style="font-size:1.1rem;color:var(--gold)">${t.icono}</span>
          <span class="td-name" style="margin-left:.5rem">${t.nombre}</span></td>
      <td class="td-muted" style="max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.descripcion}</td>
      <td>${capBadge(t.capacidad)}</td>
      <td>${capDots(t.capacidad, 'sm')}</td>
      <td>
        <div class="td-actions">
          <button class="btn-admin btn-admin--icon"        data-action="edit"   data-id="${t.id}" title="Editar">✎</button>
          <button class="btn-admin btn-admin--icon-danger" data-action="delete" data-id="${t.id}" title="Eliminar">✕</button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('#tipoTableBody [data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      btn.dataset.action === 'edit' ? openEditModal(id) : openDeleteModal(id);
    });
  });

  renderCards(list);
  renderKpis();
  renderCapChart(list);
}

/* ── CARDS ───────────────────────────────────────────────────── */
function renderCards(list) {
  document.getElementById('tipoCards').innerHTML = list.map(t => `
    <div class="cat-visual-card" style="cursor:default">
      <div class="cvc-header">
        <span class="cvc-name">${t.icono} ${t.nombre}</span>
        ${capBadge(t.capacidad)}
      </div>
      <p style="font-size:.65rem;color:var(--muted);margin-top:.5rem;line-height:1.5">${t.descripcion}</p>
      <div style="margin-top:.7rem">${capDots(t.capacidad)}</div>
    </div>
  `).join('');
}

/* ── KPIs ────────────────────────────────────────────────────── */
function renderKpis() {
  document.getElementById('kpiTotal').textContent = tipos.length;
  const caps = tipos.map(t => t.capacidad);
  document.getElementById('kpiMaxCap').textContent = caps.length ? Math.max(...caps) : '—';
  document.getElementById('kpiAvgCap').textContent = caps.length
    ? (caps.reduce((a, b) => a + b, 0) / caps.length).toFixed(1)
    : '—';
}

/* ── CAPACITY CHART ──────────────────────────────────────────── */
const CHART_COLORS = ['#5cba8c','#4a8ecb','#c9a84c','#e08c5c','#c96aa8','#8c5cba','#5c8cba'];

function renderCapChart(list) {
  const wrap = document.getElementById('capChartWrap');
  if (!wrap || !list.length) return;

  const maxCap = Math.max(...list.map(t => t.capacidad), 1);

  wrap.innerHTML = `
    <div class="cap-bars-wrap">
      ${list.map((t, i) => {
        const pct   = Math.round((t.capacidad / maxCap) * 100);
        const color = CHART_COLORS[i % CHART_COLORS.length];
        return `
          <div class="cap-bar-item">
            <span class="cap-bar-icon">${t.icono}</span>
            <div class="cap-bar-track">
              <div class="cap-bar-fill"
                   style="width:0%;background:linear-gradient(90deg,${color},${color}88)"
                   data-target="${pct}">
              </div>
              <span class="cap-bar-label">${t.nombre}</span>
            </div>
            <span class="cap-bar-value" style="color:${color}">${t.capacidad} pers.</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Animate
  requestAnimationFrame(() => {
    wrap.querySelectorAll('.cap-bar-fill').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.target + '%'; }, 80);
    });
  });
}

/* ── MODAL ───────────────────────────────────────────────────── */
function clearForm() {
  ['fId','fNombre','fDescripcion','fCapacidad'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('fIcono').value = '◎';
  document.getElementById('capPrevDots').innerHTML =
    `<span style="color:var(--muted);font-size:.72rem">Ingresa la capacidad</span>`;
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
  const n = document.getElementById('fNombre').value.trim();
  const d = document.getElementById('fDescripcion').value.trim();
  const c = document.getElementById('fCapacidad').value;
  if (!n) { setErr('fNombre','errNombre','El nombre es obligatorio.'); ok = false; }
  if (!d) { setErr('fDescripcion','errDescripcion','La descripción es obligatoria.'); ok = false; }
  if (!c || isNaN(c) || c < 1 || c > 20)
    { setErr('fCapacidad','errCapacidad','Capacidad entre 1 y 20.'); ok = false; }
  return ok;
}

/* Live capacity preview */
document.getElementById('fCapacidad')?.addEventListener('input', e => {
  const n   = parseInt(e.target.value);
  const div = document.getElementById('capPrevDots');
  div.innerHTML = n > 0 ? capDots(n) : `<span style="color:var(--muted);font-size:.72rem">Ingresa la capacidad</span>`;
});

function openCreateModal() {
  editingId = null; clearForm();
  document.getElementById('modalTitle').textContent = 'Nuevo Tipo de Habitación';
  AdminUtils.openModal('modalBackdrop');
}
function openEditModal(id) {
  editingId = id;
  const t = tipos.find(x => x.id === id); if (!t) return;
  clearForm();
  document.getElementById('fId').value          = t.id;
  document.getElementById('fNombre').value       = t.nombre;
  document.getElementById('fDescripcion').value  = t.descripcion;
  document.getElementById('fCapacidad').value    = t.capacidad;
  document.getElementById('fIcono').value        = t.icono;
  document.getElementById('capPrevDots').innerHTML = capDots(t.capacidad);
  document.getElementById('modalTitle').textContent = 'Editar Tipo de Habitación';
  AdminUtils.openModal('modalBackdrop');
}
function saveTipo() {
  if (!validate()) return;
  const data = {
    nombre:      document.getElementById('fNombre').value.trim(),
    descripcion: document.getElementById('fDescripcion').value.trim(),
    capacidad:   parseInt(document.getElementById('fCapacidad').value),
    icono:       document.getElementById('fIcono').value,
  };
  if (editingId) {
    const i = tipos.findIndex(t => t.id === editingId);
    if (i !== -1) tipos[i] = { ...tipos[i], ...data };
    AdminUtils.showToast('Tipo actualizado correctamente.', 'success');
  } else {
    data.id = nextId(); tipos.push(data);
    AdminUtils.showToast('Tipo de habitación creado.', 'success');
  }
  save(); AdminUtils.closeModal('modalBackdrop'); renderTable();
}

/* ── DELETE ──────────────────────────────────────────────────── */
function openDeleteModal(id) {
  deletingId = id;
  const t = tipos.find(x => x.id === id);
  document.getElementById('deleteTipoName').textContent = t?.nombre ?? '';
  AdminUtils.openModal('deleteBackdrop');
}
function doDelete() {
  tipos = tipos.filter(t => t.id !== deletingId);
  save(); AdminUtils.closeModal('deleteBackdrop');
  AdminUtils.showToast('Tipo eliminado.', 'error'); renderTable();
}

/* ── BINDINGS ────────────────────────────────────────────────── */
document.getElementById('searchInput')?.addEventListener('input', e => { searchQ = e.target.value; renderTable(); });
document.getElementById('btnNuevo')?.addEventListener('click', openCreateModal);
document.getElementById('btnGuardar')?.addEventListener('click', saveTipo);
document.getElementById('btnCancelar')?.addEventListener('click', () => AdminUtils.closeModal('modalBackdrop'));
document.getElementById('modalClose')?.addEventListener('click', () => AdminUtils.closeModal('modalBackdrop'));
document.getElementById('deleteConfirm')?.addEventListener('click', doDelete);
document.getElementById('deleteCancelar')?.addEventListener('click', () => AdminUtils.closeModal('deleteBackdrop'));
document.getElementById('deleteClose')?.addEventListener('click', () => AdminUtils.closeModal('deleteBackdrop'));

/* ── INIT ────────────────────────────────────────────────────── */
load(); renderTable();
