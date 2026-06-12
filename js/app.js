/**
 * EcoReport — Aplicación principal
 * Gestiona el formulario, mapas, panel admin y estadísticas.
 */

/* ========== ESTADO GLOBAL ========== */
let reportMap = null;
let mainMap = null;
let heroMap = null;
let reportMarker = null;
let selectedLat = null;
let selectedLng = null;
let imageBase64 = null;
let allMarkers = [];

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  DB.seed();
  updateStats();
  initReportMap();
  initMainMap();
  initHeroMap();
  initForm();
  initUpload();
  initNav();
  startClock();
  animateHeroStats();
});

/* ========== NAV ========== */
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  window.addEventListener('scroll', () => {
    document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 10);
  });
}
function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
}

/* ========== RELOJ ========== */
function startClock() {
  const el = document.getElementById('fechaHoraDisplay');
  const update = () => {
    const now = new Date();
    el.textContent = 'Fecha y hora: ' + now.toLocaleString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };
  update();
  setInterval(update, 1000);
}

/* ========== HERO STATS ANIMATION ========== */
function animateHeroStats() {
  const stats = DB.getStats();
  animateNumber('statTotal', stats.total);
  animateNumber('statResolved', stats.resuelto);
  animateNumber('statPending', stats.pendiente);
  animateNumber('stTotal', stats.total);
  animateNumber('stPending', stats.pendiente);
  animateNumber('stProcess', stats.en_proceso);
  animateNumber('stResolved', stats.resuelto);
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 40);
}

function updateStats() {
  const s = DB.getStats();
  ['statTotal', 'stTotal'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = s.total; });
  ['statPending', 'stPending'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = s.pendiente; });
  ['statResolved', 'stResolved'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = s.resuelto; });
  ['stProcess'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = s.en_proceso; });

  const rate = s.total > 0 ? Math.round((s.resuelto / s.total) * 100) : 0;
  const rateEl = document.getElementById('resolutionRate');
  const fillEl = document.getElementById('progressFill');
  if (rateEl) rateEl.textContent = rate + '%';
  if (fillEl) setTimeout(() => { fillEl.style.width = rate + '%'; }, 200);
}

/* ========== MAPA DEL FORMULARIO ========== */
function initReportMap() {
  reportMap = L.map('reportMap').setView([11.5444, -72.9072], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(reportMap);

  reportMap.on('click', (e) => {
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;
    if (reportMarker) reportMap.removeLayer(reportMarker);
    reportMarker = L.marker([selectedLat, selectedLng]).addTo(reportMap);
    reportMarker.bindPopup('📍 Ubicación seleccionada').openPopup();
    document.getElementById('mapCoords').textContent =
      `📍 Coordenadas: ${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`;
    // Reverse geocoding with Nominatim
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${selectedLat}&lon=${selectedLng}&format=json`)
      .then(r => r.json())
      .then(data => {
        if (data && data.display_name) {
          const addr = data.display_name.split(',').slice(0, 3).join(',');
          const ubEl = document.getElementById('ubicacion');
          if (!ubEl.value) ubEl.value = addr;
        }
      }).catch(() => {});
  });
}

/* ========== MAPA PRINCIPAL ========== */
function initMainMap() {
  mainMap = L.map('mainMap').setView([11.5444, -72.9072], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19,
  }).addTo(mainMap);
  loadMainMapMarkers();
}

function loadMainMapMarkers() {
  if (!mainMap) return;
  allMarkers.forEach(m => mainMap.removeLayer(m));
  allMarkers = [];
  const reports = DB.getAll();
  reports.forEach(r => {
    if (!r.lat || !r.lng) return;
    const color = r.estado === 'resuelto' ? '#52B788' : r.estado === 'en_proceso' ? '#3498DB' : '#E9A319';
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    const marker = L.marker([r.lat, r.lng], { icon }).addTo(mainMap);
    marker.bindPopup(`
      <div style="font-family:Inter,sans-serif;min-width:180px">
        <strong style="color:#1B4332">${r.nombre}</strong><br/>
        <small style="color:#6B7C6D">${formatDate(r.fechaCreacion)}</small><br/>
        <div style="margin:6px 0;font-size:0.85em">${r.ubicacion}</div>
        <div style="font-size:0.8em;color:#6B7C6D">${r.descripcion.substring(0, 80)}${r.descripcion.length > 80 ? '…' : ''}</div>
        <div style="margin-top:6px">
          <span style="background:${color};color:white;font-size:0.7em;padding:2px 8px;border-radius:100px;font-weight:700;text-transform:uppercase">
            ${r.estado.replace('_', ' ')}
          </span>
        </div>
      </div>
    `);
    allMarkers.push(marker);
  });
}

/* ========== HERO MAP (mini preview) ========== */
function initHeroMap() {
  heroMap = L.map('heroMapPreview', { zoomControl: false, scrollWheelZoom: false, dragging: false, attributionControl: false })
    .setView([11.5444, -72.9072], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(heroMap);
  DB.getAll().forEach(r => {
    if (!r.lat || !r.lng) return;
    const color = r.estado === 'resuelto' ? '#52B788' : r.estado === 'en_proceso' ? '#3498DB' : '#E9A319';
    L.circleMarker([r.lat, r.lng], { radius: 7, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9 }).addTo(heroMap);
  });
}

/* ========== FORMULARIO ========== */
function initForm() {
  const form = document.getElementById('reportForm');
  const textarea = document.getElementById('descripcion');
  textarea.addEventListener('input', () => {
    document.getElementById('charCount').textContent = textarea.value.length;
  });
  form.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
  e.preventDefault();
  clearErrors();
  const form = e.target;
  const nombre = form.nombre.value.trim();
  const email = form.email.value.trim();
  const ubicacion = form.ubicacion.value.trim();
  const descripcion = form.descripcion.value.trim();

  let valid = true;
  if (!nombre) { showError('err-nombre', 'El nombre es requerido.'); valid = false; }
  if (email && !isValidEmail(email)) { showError('err-email', 'Correo electrónico inválido.'); valid = false; }
  if (!ubicacion) { showError('err-ubicacion', 'La ubicación es requerida.'); valid = false; }
  if (!descripcion) { showError('err-descripcion', 'La descripción es requerida.'); valid = false; }
  if (descripcion.length < 10) { showError('err-descripcion', 'La descripción debe tener al menos 10 caracteres.'); valid = false; }

  if (!valid) return;

  // Loading state
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.querySelector('.btn-text').style.display = 'none';
  btn.querySelector('.btn-spinner').style.display = 'inline';

  // Simular envío de correo (en producción usar EmailJS u otro servicio)
  await simulateEmailSend({ nombre, email, ubicacion, descripcion, imagen: imageBase64 });

  const report = DB.insert({ nombre, email, ubicacion, descripcion, imagen: imageBase64, lat: selectedLat, lng: selectedLng });

  // Reset
  form.reset();
  document.getElementById('charCount').textContent = '0';
  clearImagePreview();
  selectedLat = null; selectedLng = null;
  if (reportMarker) { reportMap.removeLayer(reportMarker); reportMarker = null; }
  document.getElementById('mapCoords').textContent = 'Haz clic en el mapa para marcar la ubicación exacta';

  btn.disabled = false;
  btn.querySelector('.btn-text').style.display = 'inline';
  btn.querySelector('.btn-spinner').style.display = 'none';

  updateStats();
  loadMainMapMarkers();

  // Show success modal
  document.getElementById('reportIdDisplay').textContent = report.id;
  document.getElementById('successModal').style.display = 'flex';
}

async function simulateEmailSend(data) {
  // En producción: usar EmailJS, un endpoint de Netlify Functions, etc.
  // Aquí simulamos el delay de red
  return new Promise(resolve => setTimeout(resolve, 800));
}

/* ========== UPLOAD DE IMAGEN ========== */
function initUpload() {
  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('imagenInput');
  const removeBtn = document.getElementById('removeImage');

  input.addEventListener('change', () => handleFile(input.files[0]));
  removeBtn.addEventListener('click', clearImagePreview);

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault(); zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
}

function handleFile(file) {
  if (!file) return;
  const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowed.includes(file.type)) { showError('err-imagen', 'Solo se permiten imágenes PNG, JPG o JPEG.'); return; }
  if (file.size > 5 * 1024 * 1024) { showError('err-imagen', 'La imagen no puede superar 5 MB.'); return; }
  clearError('err-imagen');

  const reader = new FileReader();
  reader.onload = (e) => {
    imageBase64 = e.target.result;
    document.getElementById('previewImg').src = imageBase64;
    document.getElementById('uploadPlaceholder').style.display = 'none';
    document.getElementById('uploadPreview').style.display = 'flex';
    document.getElementById('uploadZone').style.flexDirection = 'column';
  };
  reader.readAsDataURL(file);
}

function clearImagePreview() {
  imageBase64 = null;
  document.getElementById('imagenInput').value = '';
  document.getElementById('previewImg').src = '';
  document.getElementById('uploadPreview').style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'block';
}

/* ========== PANEL ADMIN ========== */
function openAdmin() {
  document.getElementById('adminPanel').style.display = 'flex';
  renderAdmin(DB.getAll());
}
function closeAdmin() {
  document.getElementById('adminPanel').style.display = 'none';
}

function applyAdminFilters() {
  const search = document.getElementById('adminSearch').value;
  const date = document.getElementById('adminDateFilter').value;
  const estado = document.getElementById('adminStatusFilter').value;
  renderAdmin(DB.filter({ search, date, estado }));
}

document.addEventListener('DOMContentLoaded', () => {
  ['adminSearch', 'adminDateFilter', 'adminStatusFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', applyAdminFilters);
  });
});

function renderAdmin(reports) {
  const body = document.getElementById('adminBody');
  const stats = DB.getStats();

  document.getElementById('adminTotal').textContent = `Total: ${stats.total}`;
  document.getElementById('adminPendingCount').textContent = `Pendientes: ${stats.pendiente}`;
  document.getElementById('adminProcessCount').textContent = `En proceso: ${stats.en_proceso}`;
  document.getElementById('adminResolvedCount').textContent = `Resueltos: ${stats.resuelto}`;

  if (!reports.length) {
    body.innerHTML = '<p class="admin__empty">No se encontraron reportes.</p>';
    return;
  }

  body.innerHTML = reports.map(r => `
    <div class="report-card" id="card-${r.id}">
      <div class="report-card__info">
        <div class="report-card__header">
          <span class="report-card__name">${escHtml(r.nombre)}</span>
          <span class="status-badge status-badge--${r.estado}">${r.estado.replace('_', ' ')}</span>
          <span class="report-card__date">${formatDate(r.fechaCreacion)}</span>
        </div>
        <div class="report-card__location">📍 <strong>${escHtml(r.ubicacion)}</strong></div>
        <div class="report-card__desc">${escHtml(r.descripcion)}</div>
        ${r.email ? `<div class="report-card__email">✉️ ${escHtml(r.email)}</div>` : ''}
        <div class="report-card__id" style="font-size:0.75rem;color:#9aadab;margin-top:4px">ID: ${r.id}</div>
      </div>
      <div class="report-card__side">
        ${r.imagen
          ? `<img src="${r.imagen}" class="report-card__img" alt="Imagen del reporte" onclick="viewImage('${r.id}')" />`
          : `<div class="report-card__no-img">📷</div>`}
        <select class="status-select" onchange="changeStatus('${r.id}', this.value)">
          <option value="pendiente" ${r.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="en_proceso" ${r.estado === 'en_proceso' ? 'selected' : ''}>En proceso</option>
          <option value="resuelto" ${r.estado === 'resuelto' ? 'selected' : ''}>Resuelto</option>
        </select>
      </div>
    </div>
  `).join('');
}

function changeStatus(id, newStatus) {
  DB.updateStatus(id, newStatus);
  updateStats();
  loadMainMapMarkers();
  applyAdminFilters();
  showToast('Estado actualizado correctamente ✓');
}

function viewImage(id) {
  const report = DB.getAll().find(r => r.id === id);
  if (!report || !report.imagen) return;
  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>Imagen reporte ${id}</title></head><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${report.imagen}" style="max-width:100%;max-height:100vh;object-fit:contain" /></body></html>`);
  w.document.close();
}

/* ========== MODALES ========== */
function closeSuccess() {
  document.getElementById('successModal').style.display = 'none';
}

/* ========== TOAST ========== */
function showToast(msg, duration = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* ========== HELPERS ========== */
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; }
  const inputId = id.replace('err-', '');
  const input = document.getElementById(inputId) || document.querySelector(`[name="${inputId}"]`);
  if (input) input.classList.add('error');
}
function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}
function clearErrors() {
  document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
  document.querySelectorAll('.form-input.error, .form-textarea.error').forEach(e => e.classList.remove('error'));
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// Cerrar modales con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAdmin();
    closeSuccess();
  }
});

// Cerrar admin al hacer clic fuera
document.getElementById('adminPanel').addEventListener('click', (e) => {
  if (e.target === document.getElementById('adminPanel')) closeAdmin();
});
document.getElementById('successModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('successModal')) closeSuccess();
});
