/* ─────────────────────────────────────────────────────────────
   LUXORIA — sidebar.js  |  Dynamic sidebar generator
   Load this BEFORE admin.js in every admin HTML page
   ───────────────────────────────────────────────────────────── */
(function () {
  const NAV = [
    { group: 'Principal' },
    { href: 'index.html',             icon: '⌂',  label: 'Landing Page' },
    { group: 'Catálogos' },
    { href: 'hoteles.html',           icon: '▣',  label: 'Hoteles' },
    { href: 'categorias.html',        icon: '◇',  label: 'Categorías' },
    { href: 'habitaciones-tipo.html', icon: '◎',  label: 'Tipos de Habitación' },
    { href: 'temporadas.html',        icon: '◉',  label: 'Temporadas' },
    { href: 'tarifas.html',           icon: '◈',  label: 'Tarifas' },
    { group: 'Operaciones' },
    { href: 'reservaciones.html',     icon: '⬡',  label: 'Reservaciones' },
    { href: 'clientes.html',          icon: '◙',  label: 'Clientes' },
    { href: 'estancias.html',         icon: '▦',  label: 'Estancias' },
    { href: 'gastos.html',            icon: '◊',  label: 'Gastos' },
    { group: 'Finanzas' },
    { href: 'facturacion.html',       icon: '▩',  label: 'Facturación' },
    { href: 'reportes.html',          icon: '⊞',  label: 'Reportes' },
  ];

  const current = window.location.pathname.split('/').pop() || 'index.html';
  const el      = document.getElementById('sidebar');
  if (!el) return;

  let html = `
    <div class="sidebar__logo">
      <span class="nav__logo-icon">◈</span>
      <span class="nav__logo-text">LUXORIA</span>
      <span class="sidebar__badge">Admin</span>
    </div>
    <nav class="sidebar__nav">`;

  NAV.forEach(p => {
    if (p.group) {
      html += `<span class="sidebar__group-label">${p.group}</span>`;
    } else {
      const active = current === p.href ? ' sidebar__link--active' : '';
      html += `
        <a href="${p.href}" class="sidebar__link${active}">
          <span class="sl-icon">${p.icon}</span>${p.label}
        </a>`;
    }
  });

  html += `
    </nav>
    <div class="sidebar__footer">
      <div class="sidebar__user">
        <div class="sidebar__avatar">A</div>
        <div>
          <div class="sidebar__uname">Admin</div>
          <div class="sidebar__urole">Superusuario</div>
        </div>
      </div>
    </div>`;

  el.innerHTML = html;
})();
