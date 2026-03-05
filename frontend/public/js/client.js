/* ═══════════════════════════════════════════════════════════════
   LUXORIA — client.js  |  Booking flow state manager
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── SESSION STORE ───────────────────────────────────────────── */
const BOOK_KEY = 'luxoria_booking_session';
const USER_KEY = 'luxoria_client_user';

const BookingSession = {
  get()  { try { return JSON.parse(sessionStorage.getItem(BOOK_KEY)) || {}; } catch { return {}; } },
  set(d) { try { sessionStorage.setItem(BOOK_KEY, JSON.stringify({ ...this.get(), ...d })); } catch {} },
  clear(){ try { sessionStorage.removeItem(BOOK_KEY); } catch {} }
};

const ClientUser = {
  get()  { try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; } },
  set(u) { try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch {} },
  clear(){ try { localStorage.removeItem(USER_KEY); } catch {} },
  isLogged() { return !!this.get(); }
};

/* ── DATA HELPERS (same keys as admin modules) ───────────────── */
const _HOTELS_SEED = [
  { id:1, nombre:'Grand Luxoria Madrid',     ciudad:'Madrid',   pais:'España',   categoria:5, descripcion:'Icónico hotel de lujo en el corazón de Madrid. Arquitectura belle époque fusionada con diseño contemporáneo.', habitaciones:120, estrellas:5, lat:40.4168, lng:-3.7038, img:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', imgs:['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80','https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80'] },
  { id:2, nombre:'Luxoria Paris',             ciudad:'París',    pais:'Francia',  categoria:5, descripcion:'Elegancia parisina en la Rive Droite. Vistas privilegiadas a la Torre Eiffel desde las suites superiores.', habitaciones:85,  estrellas:5, lat:48.8566, lng:2.3522,  img:'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=800&q=80', imgs:['https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=800&q=80','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80','https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=800&q=80','https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80'] },
  { id:3, nombre:'Aegean Luxoria Santorini',  ciudad:'Santorini',pais:'Grecia',   categoria:4, descripcion:'Cavado en la caldera volcánica con piscinas infinitas sobre el mar Egeo. Puestas de sol únicas en el mundo.', habitaciones:48,  estrellas:4, lat:36.3932, lng:25.4615, img:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', imgs:['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80','https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=800&q=80','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80','https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80'] },
  { id:4, nombre:'Desert Pearl Luxoria Dubai',ciudad:'Dubái',   pais:'EAU',      categoria:5, descripcion:'Majestuosa torre de cristal en el corazón de Dubái. Mayordomo 24h, spa de clase mundial y gastronomía de autor.', habitaciones:200, estrellas:5, lat:25.2048, lng:55.2708, img:'https://images.unsplash.com/photo-1514025727944-b1b34eaad79a?w=800&q=80', imgs:['https://images.unsplash.com/photo-1514025727944-b1b34eaad79a?w=800&q=80','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80','https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80','https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&q=80'] },
  { id:5, nombre:'Luxoria Barcelona',         ciudad:'Barcelona',pais:'España',   categoria:4, descripcion:'Diseño modernista catalán con vistas al Mediterráneo. A pasos del Passeig de Gràcia y la Sagrada Família.', habitaciones:95,  estrellas:4, lat:41.3851, lng:2.1734,  img:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', imgs:['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80','https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80'] },
  { id:6, nombre:'Luxoria Roma',              ciudad:'Roma',     pais:'Italia',   categoria:3, descripcion:'Boutique hotel en el Trastevere histórico. Terraza panorámica con vistas a los siete colinas de la Ciudad Eterna.', habitaciones:60,  estrellas:3, lat:41.9028, lng:12.4964, img:'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', imgs:['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80','https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80','https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80','https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80'] },
];
const _TIPOS_SEED = [
  { id:1, nombre:'Individual',         descripcion:'Confort y privacidad para el viajero solitario.',         capacidad:1, icono:'◎', features:['Cama King', 'Wi-Fi', 'Escritorio', 'Vista ciudad'], imgs:['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80'] },
  { id:2, nombre:'Doble',              descripcion:'Espacio y confort para dos, con vistas privilegiadas.',   capacidad:2, icono:'◎', features:['Cama King o Twin', 'Wi-Fi', 'Bañera', 'Mini bar'], imgs:['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80'] },
  { id:3, nombre:'Triple',             descripcion:'Amplia habitación para familias o grupos de tres.',       capacidad:3, icono:'▣', features:['3 camas', 'Wi-Fi', 'Sofá', 'Nevera'], imgs:['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80'] },
  { id:4, nombre:'Suite',              descripcion:'Sala de estar separada, amenities premium y vistas.',     capacidad:2, icono:'◇', features:['Sala de estar', 'Jacuzzi', 'Butler', 'Mini bar VIP'], imgs:['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80'] },
  { id:5, nombre:'Suite Junior',       descripcion:'Elegancia compacta con zona de salón integrada.',         capacidad:2, icono:'◇', features:['Zona salón', 'Ducha lluvia', 'Wi-Fi', 'Bañera'], imgs:['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80'] },
  { id:6, nombre:'Suite Presidencial', descripcion:'La cumbre del lujo. Mayordomo, acceso VIP y servicios exclusivos.', capacidad:4, icono:'◈', features:['Varias habitaciones', 'Butler 24h', 'Terraza privada', 'Champán bienvenida'], imgs:['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80'] },
  { id:7, nombre:'Familiar',           descripcion:'Amplio espacio diseñado para familias de hasta 4.',       capacidad:4, icono:'⬡', features:['4 camas', 'Cocina', 'Salón familiar', 'Wi-Fi'], imgs:['https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&q=80'] },
];
const _TARIFAS_SEED = [
  {id:1,hotelId:1,tipoId:1,tempId:5,precio:120},{id:2,hotelId:1,tipoId:1,tempId:3,precio:160},{id:3,hotelId:1,tipoId:1,tempId:1,precio:220},
  {id:4,hotelId:1,tipoId:2,tempId:5,precio:190},{id:5,hotelId:1,tipoId:2,tempId:3,precio:260},{id:6,hotelId:1,tipoId:2,tempId:1,precio:360},
  {id:7,hotelId:1,tipoId:4,tempId:5,precio:310},{id:8,hotelId:1,tipoId:4,tempId:3,precio:420},{id:9,hotelId:1,tipoId:4,tempId:1,precio:580},
  {id:10,hotelId:1,tipoId:6,tempId:6,precio:1400},
  {id:11,hotelId:2,tipoId:2,tempId:5,precio:240},{id:12,hotelId:2,tipoId:2,tempId:3,precio:320},{id:13,hotelId:2,tipoId:4,tempId:5,precio:480},{id:14,hotelId:2,tipoId:4,tempId:6,precio:750},
  {id:15,hotelId:3,tipoId:2,tempId:3,precio:180},{id:16,hotelId:3,tipoId:2,tempId:5,precio:130},{id:17,hotelId:3,tipoId:4,tempId:3,precio:340},
  {id:18,hotelId:4,tipoId:6,tempId:5,precio:850},{id:19,hotelId:4,tipoId:6,tempId:6,precio:1800},{id:20,hotelId:4,tipoId:4,tempId:3,precio:580},
  {id:21,hotelId:5,tipoId:2,tempId:3,precio:200},{id:22,hotelId:5,tipoId:4,tempId:3,precio:340},
  {id:23,hotelId:6,tipoId:1,tempId:5,precio:65},{id:24,hotelId:6,tipoId:1,tempId:3,precio:85},{id:25,hotelId:6,tipoId:2,tempId:5,precio:100},{id:26,hotelId:6,tipoId:2,tempId:3,precio:130},
];
const _TEMPS_SEED = [
  {id:1,nombre:'Temporada Alta Verano',     tipo:'Alta', fechaInicio:'2025-06-21',fechaFin:'2025-09-22',multiplicador:1.8},
  {id:2,nombre:'Semana Santa',              tipo:'Alta', fechaInicio:'2025-04-13',fechaFin:'2025-04-20',multiplicador:1.6},
  {id:3,nombre:'Temporada Media Primavera', tipo:'Media',fechaInicio:'2025-03-01',fechaFin:'2025-06-20',multiplicador:1.0},
  {id:4,nombre:'Temporada Media Otoño',     tipo:'Media',fechaInicio:'2025-09-23',fechaFin:'2025-11-30',multiplicador:1.1},
  {id:5,nombre:'Temporada Baja Invierno',   tipo:'Baja', fechaInicio:'2025-01-07',fechaFin:'2025-03-31',multiplicador:0.7},
  {id:6,nombre:'Navidad y Año Nuevo',       tipo:'Alta', fechaInicio:'2025-12-20',fechaFin:'2026-01-06',multiplicador:1.9},
  {id:7,nombre:'Puente de Noviembre',       tipo:'Media',fechaInicio:'2025-11-01',fechaFin:'2025-11-02',multiplicador:1.3},
];
const _CATS_SEED = [
  {id:1,estrellas:1,tipoIva:'Superreducido',porcentajeIva:4},
  {id:2,estrellas:2,tipoIva:'Reducido',     porcentajeIva:8},
  {id:3,estrellas:3,tipoIva:'Reducido',     porcentajeIva:10},
  {id:4,estrellas:4,tipoIva:'General',      porcentajeIva:21},
  {id:5,estrellas:5,tipoIva:'General',      porcentajeIva:21},
];

const Data = {
  hotels()    { try { return JSON.parse(localStorage.getItem('luxoria_hotels'))     || _HOTELS_SEED; } catch { return _HOTELS_SEED; } },
  tipos()     { try { return JSON.parse(localStorage.getItem('luxoria_room_types')) || _TIPOS_SEED;  } catch { return _TIPOS_SEED;  } },
  temps()     { try { return JSON.parse(localStorage.getItem('luxoria_temporadas')) || _TEMPS_SEED;  } catch { return _TEMPS_SEED;  } },
  tarifas()   { try { return JSON.parse(localStorage.getItem('luxoria_tarifas'))   || _TARIFAS_SEED;} catch { return _TARIFAS_SEED;} },
  cats()      { try { return JSON.parse(localStorage.getItem('luxoria_categories')) || _CATS_SEED;   } catch { return _CATS_SEED;   } },

  hotelById(id)    { return this.hotels().find(h => h.id === parseInt(id)); },
  tipoById(id)     { return this.tipos().find(t => t.id === parseInt(id)); },
  catByEstrellas(n){ return this.cats().find(c => c.estrellas === parseInt(n)); },

  /* Find applicable tarifa */
  getTarifa(hotelId, tipoId, fecha) {
    const tarifas = this.tarifas();
    const temps   = this.temps();
    const date    = fecha || new Date().toISOString().slice(0,10);
    // find season
    const temp = temps.find(t => date >= t.fechaInicio && date <= t.fechaFin);
    if (temp) {
      const t = tarifas.find(x => x.hotelId === parseInt(hotelId) && x.tipoId === parseInt(tipoId) && x.tempId === temp.id);
      if (t) return { precio: t.precio, temporada: temp };
    }
    // fallback: any tarifa for this hotel+tipo
    const t = tarifas.find(x => x.hotelId === parseInt(hotelId) && x.tipoId === parseInt(tipoId));
    return t ? { precio: t.precio, temporada: null } : null;
  },

  /* Min price for hotel (any room, baja season) */
  minPrice(hotelId) {
    const ts = this.tarifas().filter(t => t.hotelId === parseInt(hotelId));
    return ts.length ? Math.min(...ts.map(t => t.precio)) : null;
  },

  getIvaRate(hotelId) {
    const h = this.hotelById(hotelId); if (!h) return 10;
    const c = this.catByEstrellas(h.categoria); return c ? c.porcentajeIva : 10;
  },

  /* Rating mock (based on id) */
  rating(hotelId) {
    const ratings = { 1:9.2, 2:9.4, 3:9.6, 4:9.1, 5:8.9, 6:8.4 };
    return ratings[parseInt(hotelId)] ?? 8.5;
  }
};

/* ── DATE HELPERS ────────────────────────────────────────────── */
const DateUtil = {
  nights(a, b) { return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000)); },
  fmt(d) {
    if (!d) return '—';
    const [y, m, dd] = d.split('-');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${parseInt(dd)} ${months[parseInt(m)-1]} ${y}`;
  },
  fmtShort(d) {
    if (!d) return '—';
    const [y, m, dd] = d.split('-');
    return `${dd}/${m}/${y}`;
  },
  today() { return new Date().toISOString().slice(0,10); },
  addDays(d, n) { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().slice(0,10); }
};

/* ── STARS RENDER ────────────────────────────────────────────── */
function renderStars(n) {
  return Array.from({ length: 5 }, (_, i) => i < n ? '⭑' : '⭒').join('');
}

/* ── SEASON BADGE ────────────────────────────────────────────── */
function seasonBadge(temp) {
  if (!temp) return '';
  const colors = { Alta: '#e05c5c', Media: '#4a8ecb', Baja: '#5cba8c' };
  const icons  = { Alta: '☀', Media: '⟳', Baja: '❄' };
  const c = colors[temp.tipo] || 'var(--gold)';
  return `<span class="os-season-badge" style="background:${c}18;border:1px solid ${c}33;color:${c}">${icons[temp.tipo]||'◉'} ${temp.nombre}</span>`;
}

/* ── CLIENT NAV BUILDER ──────────────────────────────────────── */
function buildClientNav(activePage) {
  const user = ClientUser.get();
  const links = [
    { href:'index.html',     label:'Inicio',    key:'home' },
    { href:'busqueda.html',  label:'Hoteles',   key:'hoteles' },
    { href:'perfil.html',    label:'Mis Reservas', key:'reservas' },
  ];
  const nav = document.getElementById('clientNav');
  if (!nav) return;
  nav.innerHTML = `
    <a href="index.html" class="cn-logo">
      <span class="cn-logo-icon">◈</span>
      <span class="cn-logo-text">LUXORIA</span>
    </a>
    <ul class="cn-links">
      ${links.map(l => `<li><a href="${l.href}" class="${activePage===l.key?'active':''}">${l.label}</a></li>`).join('')}
    </ul>
    <div class="cn-actions">
      ${user
        ? `<div class="cn-user">
             <div class="cn-user-avatar">${user.nombre?.[0]?.toUpperCase()||'U'}</div>
             <span class="cn-user-name">${user.nombre}</span>
           </div>
           <a href="perfil.html" class="cn-btn cn-btn--ghost">Mi Perfil</a>`
        : `<a href="perfil.html" class="cn-btn cn-btn--ghost">Iniciar sesión</a>
           <a href="busqueda.html" class="cn-btn cn-btn--primary">Reservar</a>`
      }
    </div>`;
}

/* ── BOOKING STEPS RENDERER ──────────────────────────────────── */
const STEPS = [
  { n:1, label:'Hotel' },
  { n:2, label:'Habitación' },
  { n:3, label:'Detalle' },
  { n:4, label:'Datos' },
  { n:5, label:'Pago' },
  { n:6, label:'Confirmado' },
];
function renderBookingSteps(container, currentStep) {
  if (!container) return;
  container.innerHTML = STEPS.map((s, i) => {
    const cls = s.n < currentStep ? 'step--done' : s.n === currentStep ? 'step--active' : '';
    const icon = s.n < currentStep ? '✓' : s.n;
    return `
      ${i > 0 ? `<div class="step__line"></div>` : ''}
      <div class="step ${cls}">
        <div class="step__dot">${icon}</div>
        <span class="step__label">${s.label}</span>
      </div>`;
  }).join('');
}

/* ── FORMAT CURRENCY ─────────────────────────────────────────── */
function fmtEur(n) { return `€${parseFloat(n||0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`; }

/* ── TOAST ───────────────────────────────────────────────────── */
function showToast(msg, type='info') {
  let c = document.getElementById('clientToasts');
  if (!c) { c = document.createElement('div'); c.id='clientToasts'; c.className='toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  const colors = { success:'#5cba8c', error:'#e05c5c', info:'#c9a84c' };
  t.style.cssText = `padding:.8rem 1.2rem;background:var(--bg-2);border:1px solid ${colors[type]||colors.info}44;border-radius:6px;font-size:.7rem;color:var(--white);box-shadow:0 8px 32px rgba(0,0,0,.4);animation:slideInRight .3s ease;max-width:280px;margin-bottom:.4rem;border-left:3px solid ${colors[type]||colors.info}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); }, 3000);
}

/* ── GENERATE RESERVATION NUMBER ─────────────────────────────── */
function genReservaNum() {
  const y = new Date().getFullYear();
  const r = Math.floor(Math.random() * 90000) + 10000;
  return `LXR-${y}-${r}`;
}

/* ── SAVE RESERVATION TO localStorage ───────────────────────── */
function saveReservation(session) {
  const KEY = 'luxoria_reservas';
  const reservas = JSON.parse(localStorage.getItem(KEY) || '[]');
  const num = genReservaNum();
  const nueva = {
    id: Date.now(),
    num,
    tipo: session.tipoReserva || 'Particular',
    nombre: session.nombre || session.huesped || 'Cliente',
    telefono: session.telefono || '',
    hotelId: parseInt(session.hotelId),
    tipoHabId: parseInt(session.tipoId),
    entrada: session.entrada,
    salida: session.salida,
    estado: 'Confirmada',
    agencia: session.agencia || null,
    huesped: session.huesped || null,
    direccion: session.direccion || null,
    notas: session.notas || null,
    categoriaId: session.categoriaId || null,
    total: session.total,
    ivaAmt: session.ivaAmt,
    subtotal: session.subtotal,
    creadoEn: DateUtil.today(),
  };
  reservas.push(nueva);
  localStorage.setItem(KEY, JSON.stringify(reservas));
  return num;
}

/* ── EXPOSE GLOBALLY ─────────────────────────────────────────── */
window.LuxClient = {
  BookingSession, ClientUser, Data, DateUtil,
  renderStars, seasonBadge, buildClientNav, renderBookingSteps,
  fmtEur, showToast, genReservaNum, saveReservation
};
