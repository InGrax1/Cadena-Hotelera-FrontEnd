/* ─────────────────────────────────────────────────────────────
   LUXORIA — data.js  |  Cross-module data access helpers
   Load after sidebar.js and admin.js
   ───────────────────────────────────────────────────────────── */

/* Mini seed fallbacks (used when full modules haven't been opened) */
const _HOTELS_FALLBACK = [
  { id:1, nombre:'Grand Luxoria Madrid',  categoria:5 },
  { id:2, nombre:'Luxoria Paris',         categoria:5 },
  { id:3, nombre:'Aegean Luxoria',        categoria:4 },
  { id:4, nombre:'Desert Pearl Luxoria',  categoria:5 },
  { id:5, nombre:'Luxoria Barcelona',     categoria:4 },
  { id:6, nombre:'Luxoria Roma',          categoria:3 },
];
const _TIPOS_FALLBACK = [
  { id:1, nombre:'Individual',          capacidad:1 },
  { id:2, nombre:'Doble',               capacidad:2 },
  { id:3, nombre:'Triple',              capacidad:3 },
  { id:4, nombre:'Suite',               capacidad:2 },
  { id:5, nombre:'Suite Junior',        capacidad:2 },
  { id:6, nombre:'Suite Presidencial',  capacidad:4 },
  { id:7, nombre:'Familiar',            capacidad:4 },
];
const _TEMPS_FALLBACK = [
  { id:1, nombre:'Temporada Alta Verano',     tipo:'Alta'  },
  { id:2, nombre:'Semana Santa',              tipo:'Alta'  },
  { id:3, nombre:'Temporada Media Primavera', tipo:'Media' },
  { id:4, nombre:'Temporada Media Otoño',     tipo:'Media' },
  { id:5, nombre:'Temporada Baja Invierno',   tipo:'Baja'  },
  { id:6, nombre:'Navidad y Año Nuevo',       tipo:'Alta'  },
  { id:7, nombre:'Puente de Noviembre',       tipo:'Media' },
];
const _CATS_FALLBACK = [
  { id:1, nombre:'Una Estrella',    estrellas:1, tipoIva:'Superreducido', porcentajeIva:4  },
  { id:2, nombre:'Dos Estrellas',   estrellas:2, tipoIva:'Reducido',      porcentajeIva:8  },
  { id:3, nombre:'Tres Estrellas',  estrellas:3, tipoIva:'Reducido',      porcentajeIva:10 },
  { id:4, nombre:'Cuatro Estrellas',estrellas:4, tipoIva:'General',       porcentajeIva:21 },
  { id:5, nombre:'Cinco Estrellas', estrellas:5, tipoIva:'General',       porcentajeIva:21 },
];

function getHotels()    { try { return JSON.parse(localStorage.getItem('luxoria_hotels'))     || _HOTELS_FALLBACK; } catch { return _HOTELS_FALLBACK; } }
function getRoomTypes() { try { return JSON.parse(localStorage.getItem('luxoria_room_types')) || _TIPOS_FALLBACK;  } catch { return _TIPOS_FALLBACK;  } }
function getTemps()     { try { return JSON.parse(localStorage.getItem('luxoria_temporadas')) || _TEMPS_FALLBACK;  } catch { return _TEMPS_FALLBACK;  } }
function getCats()      { try { return JSON.parse(localStorage.getItem('luxoria_categories')) || _CATS_FALLBACK;   } catch { return _CATS_FALLBACK;   } }
function getTarifas()   { try { return JSON.parse(localStorage.getItem('luxoria_tarifas'))   || [];                } catch { return [];                } }
function getClientes()  { try { return JSON.parse(localStorage.getItem('luxoria_clientes'))  || [];                } catch { return [];                } }
function getEstancias() { try { return JSON.parse(localStorage.getItem('luxoria_estancias')) || [];                } catch { return [];                } }
function getGastos()    { try { return JSON.parse(localStorage.getItem('luxoria_gastos'))    || [];                } catch { return [];                } }
function getReservas()  { try { return JSON.parse(localStorage.getItem('luxoria_reservas'))  || [];                } catch { return [];                } }
function getFacturas()  { try { return JSON.parse(localStorage.getItem('luxoria_facturas'))  || [];                } catch { return [];                } }

/* Lookup helpers */
function hotelById(id)    { return getHotels().find(h => h.id === parseInt(id)); }
function tipoById(id)     { return getRoomTypes().find(t => t.id === parseInt(id)); }
function tempById(id)     { return getTemps().find(t => t.id === parseInt(id)); }
function clienteById(id)  { return getClientes().find(c => c.id === parseInt(id)); }
function estanciaById(id) { return getEstancias().find(e => e.id === parseInt(id)); }
function catByEstrellas(n){ return getCats().find(c => c.estrellas === parseInt(n)); }

/* Expose globally */
window.LuxData = {
  getHotels, getRoomTypes, getTemps, getCats, getTarifas,
  getClientes, getEstancias, getGastos, getReservas, getFacturas,
  hotelById, tipoById, tempById, clienteById, estanciaById, catByEstrellas
};
