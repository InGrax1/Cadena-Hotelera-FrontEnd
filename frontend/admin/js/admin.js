/* ─────────────────────────────────────────────────────────────
   LUXORIA — admin.js  |  Shared admin utilities
   ───────────────────────────────────────────────────────────── */
'use strict';

/* ── DATE IN TOPBAR ──────────────────────────────────────────── */
const dateEl = document.getElementById('topbarDate');
if (dateEl) {
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('es-ES', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });
}

/* ── SIDEBAR TOGGLE (MOBILE) ────────────────────────────────── */
const sidebar        = document.getElementById('sidebar');
const sidebarToggle  = document.getElementById('sidebarToggle');
sidebarToggle?.addEventListener('click', () => sidebar.classList.toggle('open'));
document.addEventListener('click', (e) => {
  if (sidebar && !sidebar.contains(e.target) && !sidebarToggle?.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

/* ── REVEAL ON SCROLL ───────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('visible'), delay);
        revealObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.08 }
);
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── COUNTER ANIMATION ───────────────────────────────────────── */
function animateCount(el) {
  const target = parseInt(el.dataset.count);
  if (isNaN(target)) return;
  const dur = 1200;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}
const cntObs = new IntersectionObserver(
  (entries) => entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); cntObs.unobserve(e.target); } }),
  { threshold: 0.5 }
);
document.querySelectorAll('[data-count]').forEach(el => cntObs.observe(el));

/* ── TOAST ───────────────────────────────────────────────────── */
const toastContainer = document.getElementById('toastContainer');

function showToast(message, type = 'success') {
  const icons = { success: '✓', error: '✕', info: '◎' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '◎'}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast--out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

/* ── MODAL HELPERS ───────────────────────────────────────────── */
function openModal(backdropId) {
  document.getElementById(backdropId)?.classList.add('open');
}
function closeModal(backdropId) {
  document.getElementById(backdropId)?.classList.remove('open');
}
// Close backdrop on outside click
document.querySelectorAll('.modal-backdrop').forEach((bd) => {
  bd.addEventListener('click', (e) => {
    if (e.target === bd) bd.classList.remove('open');
  });
});

/* ── EXPOSE GLOBALLY ────────────────────────────────────────── */
window.AdminUtils = { showToast, openModal, closeModal, animateCount };
