/* ─────────────────────────────────────────────────────────────
   LUXORIA — Cadena Hotelera | JS Principal
   ───────────────────────────────────────────────────────────── */

'use strict';

/* ── SCROLL NAV ──────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── HAMBURGER MENU ──────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
hamburger?.addEventListener('click', () => {
  nav.classList.toggle('open');
});
// Close when clicking outside
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target)) nav.classList.remove('open');
});

/* ── REVEAL ON SCROLL ────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0);
        setTimeout(() => {
          el.classList.add('visible');
        }, delay);
        revealObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => {
  revealObserver.observe(el);
});

/* ── COUNTER ANIMATION ───────────────────────────────────────── */
function animateCount(el) {
  const target = parseInt(el.dataset.count);
  if (!target) return;
  const duration = 1600;
  const start = performance.now();
  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('[data-count]').forEach((el) => {
  counterObserver.observe(el);
});

/* ── BOOKING FORM ────────────────────────────────────────────── */
const bookingForm = document.getElementById('bookingForm');
bookingForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = bookingForm.querySelector('.btn-book');
  const originalHTML = btn.innerHTML;

  btn.innerHTML = '<span>Buscando...</span><span class="btn-book__arrow">◎</span>';
  btn.style.opacity = '.8';
  btn.style.pointerEvents = 'none';

  // Rotate the icon
  const icon = btn.querySelector('.btn-book__arrow');
  let angle = 0;
  const spinInterval = setInterval(() => {
    angle += 30;
    if (icon) icon.style.transform = `rotate(${angle}deg)`;
  }, 80);

  setTimeout(() => {
    clearInterval(spinInterval);
    btn.innerHTML = '<span>✓ Disponibilidad encontrada</span><span class="btn-book__arrow">→</span>';
    btn.style.background = 'var(--green)';
    btn.style.opacity = '1';

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.style.pointerEvents = '';
    }, 2500);
  }, 1800);
});

/* ── SMOOTH ANCHOR SCROLL ────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    nav.classList.remove('open');
    const offset = nav.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── BENTO CARD SUBTLE PARALLAX ──────────────────────────────── */
document.querySelectorAll('.bento-card--hotel, .bento-card--room-img').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const yPercent = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    const img = card.querySelector('.hotel-img, .room-img');
    if (img) {
      img.style.transform = `scale(1.06) translate(${xPercent * 0.3}px, ${yPercent * 0.3}px)`;
    }
  });
  card.addEventListener('mouseleave', () => {
    const img = card.querySelector('.hotel-img, .room-img');
    if (img) {
      img.style.transform = '';
    }
  });
});

/* ── TICKER PAUSE ON HOVER ───────────────────────────────────── */
const tickerTrack = document.querySelector('.ticker-track');
const tickerWrap  = document.querySelector('.ticker-wrap');
tickerWrap?.addEventListener('mouseenter', () => {
  tickerTrack.style.animationPlayState = 'paused';
});
tickerWrap?.addEventListener('mouseleave', () => {
  tickerTrack.style.animationPlayState = 'running';
});

/* ── PAGE LOAD STAGGER ───────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  // Trigger hero cards immediately with stagger
  const heroCards = document.querySelectorAll('.bento--hero .reveal');
  heroCards.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 150 + i * 120);
  });
});
