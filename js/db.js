/**
 * EcoReport — Capa de base de datos (localStorage)
 * Simula una base de datos persistente en el navegador.
 * Para producción real, reemplazar con llamadas a una API backend.
 */

const DB = (() => {
  const KEY = 'ecoreport_v1';

  function getAll() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function save(reports) {
    localStorage.setItem(KEY, JSON.stringify(reports));
  }

  function insert(report) {
    const reports = getAll();
    const id = 'RPT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    const newReport = {
      id,
      nombre: report.nombre,
      email: report.email || '',
      ubicacion: report.ubicacion,
      descripcion: report.descripcion,
      imagen: report.imagen || null,
      lat: report.lat || null,
      lng: report.lng || null,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
    };
    reports.unshift(newReport);
    save(reports);
    return newReport;
  }

  function updateStatus(id, estado) {
    const reports = getAll();
    const idx = reports.findIndex(r => r.id === id);
    if (idx === -1) return null;
    reports[idx].estado = estado;
    reports[idx].fechaActualizacion = new Date().toISOString();
    save(reports);
    return reports[idx];
  }

  function getStats() {
    const reports = getAll();
    return {
      total: reports.length,
      pendiente: reports.filter(r => r.estado === 'pendiente').length,
      en_proceso: reports.filter(r => r.estado === 'en_proceso').length,
      resuelto: reports.filter(r => r.estado === 'resuelto').length,
    };
  }

  function filter({ search = '', date = '', estado = '' }) {
    let reports = getAll();
    if (search.trim()) {
      const q = search.toLowerCase();
      reports = reports.filter(r =>
        r.ubicacion.toLowerCase().includes(q) ||
        r.nombre.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q)
      );
    }
    if (date) {
      reports = reports.filter(r => r.fechaCreacion.startsWith(date));
    }
    if (estado) {
      reports = reports.filter(r => r.estado === estado);
    }
    return reports;
  }

  // Seed de datos de demostración si la base está vacía
  function seed() {
    if (getAll().length > 0) return;
    const demos = [
      {
        nombre: 'Carlos Martínez',
        email: 'carlos@ejemplo.com',
        ubicacion: 'Parque Principal, Calle 15 con Carrera 7',
        descripcion: 'Acumulación de bolsas de basura cerca de las bancas del parque. Hay residuos de comida y plásticos.',
        imagen: null,
        lat: 11.5444,
        lng: -72.9072,
        estado: 'pendiente',
        fechaCreacion: new Date(Date.now() - 2 * 86400000).toISOString(),
        id: 'RPT-DEMO-001',
      },
      {
        nombre: 'Luisa Fernández',
        email: 'luisa@correo.com',
        ubicacion: 'Avenida Principal, frente al Centro Comercial',
        descripcion: 'Escombros de construcción bloqueando parcialmente el andén, peligro para los peatones.',
        imagen: null,
        lat: 11.5480,
        lng: -72.9020,
        estado: 'en_proceso',
        fechaCreacion: new Date(Date.now() - 5 * 86400000).toISOString(),
        fechaActualizacion: new Date(Date.now() - 86400000).toISOString(),
        id: 'RPT-DEMO-002',
      },
      {
        nombre: 'Andrés Torres',
        email: '',
        ubicacion: 'Carrera 12 con Calle 8, barrio La Esperanza',
        descripcion: 'Residuos sólidos y chatarra acumulada en el separador vial.',
        imagen: null,
        lat: 11.5410,
        lng: -72.9100,
        estado: 'resuelto',
        fechaCreacion: new Date(Date.now() - 10 * 86400000).toISOString(),
        fechaActualizacion: new Date(Date.now() - 3 * 86400000).toISOString(),
        id: 'RPT-DEMO-003',
      },
      {
        nombre: 'María González',
        email: 'maria@ejemplo.co',
        ubicacion: 'Zona verde del barrio El Prado',
        descripcion: 'Basura doméstica y electrodomésticos abandonados en espacio público verde.',
        imagen: null,
        lat: 11.5460,
        lng: -72.9050,
        estado: 'pendiente',
        fechaCreacion: new Date(Date.now() - 1 * 86400000).toISOString(),
        id: 'RPT-DEMO-004',
      },
    ];
    localStorage.setItem(KEY, JSON.stringify(demos));
  }

  return { getAll, insert, updateStatus, getStats, filter, seed };
})();
