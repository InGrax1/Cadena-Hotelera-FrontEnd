/* ═══════════════════════════════════════════════════════════════
   LUXORIA — nav.js  |  Navegación compartida (sin fetch)
   Compatible con file:// y servidores locales
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const placeholder = document.getElementById('navPlaceholder');
  if (!placeholder) return;

  /* ── Página activa ───────────────────────────────────────────── */
  const current = window.location.pathname.split('/').pop() || 'index.html';

  function isActive(href) {
    const page = href.split('#')[0].split('/').pop();
    return page && page === current ? ' active' : '';
  }

  /* ── Links principales ───────────────────────────────────────── */
  const LINKS = [
    { href: 'index.html#hoteles',    label: 'Hoteles'      },
    { href: 'busqueda.html',         label: 'Buscar'       },
    { href: 'index.html#categorias', label: 'Habitaciones' },
    { href: 'index.html#servicios',  label: 'Servicios'    },
  ];

  /* ── Sesión de usuario ───────────────────────────────────────── */
  let user = null;
  try { user = JSON.parse(localStorage.getItem('luxoria_client_user')); } catch {}

  const perfilLabel = user
    ? `◙ ${user.nombre?.split(' ')[0] || 'Perfil'}`
    : 'Mi perfil';

  /* ── HTML del nav ────────────────────────────────────────────── */
  placeholder.outerHTML = `
    <nav class="nav" id="nav">

      <div class="nav__logo">
        <a href="index.html"
           style="display:flex;align-items:center;gap:.5rem;
                  text-decoration:none;color:inherit">
          <span class="nav__logo-icon">◈</span>
          <span class="nav__logo-text">LUXORIA</span>
        </a>
      </div>

      <ul class="nav__links">
        ${LINKS.map(l =>
          `<li><a href="${l.href}"
                  class="${isActive(l.href)}">${l.label}</a></li>`
        ).join('')}
      </ul>

      <div style="display:flex;align-items:center;gap:.8rem;margin-left:auto">

        <a href="perfil.html"
           id="navPerfilBtn"
           style="padding:.5rem 1.1rem;
                  border:1px solid rgba(201,168,76,.4);
                  border-radius:var(--radius-sm);
                  font-family:var(--font-mono);
                  font-size:.68rem;
                  letter-spacing:.08em;
                  text-transform:uppercase;
                  color:var(--gold);
                  text-decoration:none;
                  white-space:nowrap;
                  transition:background .2s, border-color .2s;"
           onmouseover="this.style.background='rgba(201,168,76,.12)'"
           onmouseout="this.style.background='transparent'">
          ${perfilLabel}
        </a>

        <a href="busqueda.html" class="nav__cta">Reservar ahora</a>

      </div>

      <button class="nav__hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>

    </nav>`;

  /* ── Scroll effect ───────────────────────────────────────────── */
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── Hamburger ───────────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');

  hamburger?.addEventListener('click', () => {
    nav?.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (nav && !nav.contains(e.target)) {
      nav.classList.remove('open');
    }
  });

})();