# 🌿 EcoReport — Plataforma de Reporte Ciudadano de Residuos

Plataforma web moderna para que ciudadanos reporten la presencia de basura, escombros o desechos en espacios públicos.

---

## 🚀 Funcionalidades

- **Formulario de reporte** con nombre, correo, ubicación, descripción, fecha automática y subida de imágenes
- **Vista previa de imágenes** antes de enviar (PNG, JPG, JPEG — máx. 5 MB)
- **Mapa interactivo** (Leaflet + OpenStreetMap) para marcar la ubicación exacta
- **Mapa general** con todos los reportes coloreados por estado
- **Panel administrativo** para ver, filtrar y actualizar el estado de reportes
- **Estadísticas en tiempo real** con tasa de resolución
- **Diseño 100% responsive** para móviles, tablets y computadores
- **Almacenamiento local** con localStorage (listo para conectar a backend)

---

## 📁 Estructura del proyecto

```
ecoreport/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos completos
├── js/
│   ├── db.js           # Capa de datos (localStorage)
│   └── app.js          # Lógica principal
├── README.md
└── .nojekyll           # Necesario para GitHub Pages
```

---

## 🖥️ Ejecutar localmente

1. Clona o descarga el proyecto
2. Abre `index.html` directamente en el navegador  
   *(o usa un servidor local para evitar restricciones CORS)*

### Con VS Code Live Server:
```bash
# Instala la extensión "Live Server" en VS Code
# Click derecho en index.html → Open with Live Server
```

### Con Python:
```bash
cd ecoreport
python -m http.server 8080
# Visita http://localhost:8080
```

### Con Node.js:
```bash
npx serve .
# Visita http://localhost:3000
```

---

## 🌐 Despliegue gratuito

### Opción 1: GitHub Pages

1. Crea un repositorio en GitHub (ej: `ecoreport`)
2. Sube todos los archivos:
```bash
git init
git add .
git commit -m "feat: EcoReport inicial"
git remote add origin https://github.com/TU_USUARIO/ecoreport.git
git push -u origin main
```
3. Ve a **Settings → Pages → Source: Deploy from branch → main → Save**
4. Tu app estará en: `https://TU_USUARIO.github.io/ecoreport`

> ⚠️ Asegúrate de que el archivo `.nojekyll` esté en la raíz (ya incluido).

---

### Opción 2: Netlify (Recomendado)

**Método arrastrar y soltar:**
1. Ve a [netlify.com](https://netlify.com) → Inicia sesión
2. En el dashboard, arrastra la carpeta `ecoreport/` a la zona de deploy
3. ¡Listo! Obtienes una URL tipo `https://nombre-random.netlify.app`

**Método CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

---

### Opción 3: Vercel

```bash
npm install -g vercel
cd ecoreport
vercel --prod
```

O conecta tu repositorio GitHub en [vercel.com](https://vercel.com) para despliegue automático.

---

### Opción 4: Render

1. Sube el proyecto a GitHub
2. Ve a [render.com](https://render.com) → New → Static Site
3. Conecta tu repositorio
4. Build Command: *(vacío)*
5. Publish Directory: `.`
6. Deploy!

---

## 📧 Configurar notificaciones por correo (producción)

El proyecto tiene preparado el hook `simulateEmailSend()` en `js/app.js`.  
Para envíos reales, reemplaza esa función con **EmailJS**:

1. Crea cuenta en [emailjs.com](https://www.emailjs.com) (gratis hasta 200 emails/mes)
2. Configura un servicio de correo y una plantilla
3. Agrega el SDK en `index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
```
4. Reemplaza `simulateEmailSend` en `app.js`:
```javascript
async function simulateEmailSend(data) {
  await emailjs.send('TU_SERVICE_ID', 'TU_TEMPLATE_ID', {
    from_name: data.nombre,
    from_email: data.email || 'sin-correo@ciudadano.co',
    ubicacion: data.ubicacion,
    descripcion: data.descripcion,
    fecha: new Date().toLocaleString('es-CO'),
  }, 'TU_PUBLIC_KEY');
}
```

---

## 🗄️ Migrar a backend real (producción)

Para escalar la aplicación con backend real:

### Stack sugerido:
- **Backend**: Node.js + Express + Prisma
- **Base de datos**: PostgreSQL (Railway, Supabase, o Neon — gratis)
- **Almacenamiento imágenes**: Cloudinary o Supabase Storage
- **Auth admin**: JWT o Supabase Auth

### Reemplazar DB en `db.js`:
```javascript
async function insert(report) {
  const res = await fetch('/api/reportes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  return res.json();
}
```

---

## 🔒 Seguridad implementada

- Validación de tipos de archivo (solo PNG/JPG/JPEG)
- Límite de tamaño de imagen (5 MB)
- Validación de formulario cliente (campos requeridos, formato email)
- Sanitización de HTML contra XSS en el panel admin
- Longitudes máximas en todos los campos

---

## 🎨 Tecnologías

| Tecnología | Uso |
|------------|-----|
| HTML5 | Estructura semántica |
| CSS3 | Diseño responsive, animaciones |
| JavaScript ES6+ | Lógica de aplicación |
| Leaflet.js | Mapas interactivos |
| OpenStreetMap | Tiles del mapa (gratuito) |
| localStorage | Persistencia de datos |
| Google Fonts | Space Grotesk + Inter |

---

## 📱 Compatibilidad

✅ Chrome / Edge / Firefox / Safari  
✅ iOS Safari / Android Chrome  
✅ Responsive: 320px hasta 4K  

---

## 📄 Licencia

MIT — libre para uso educativo y municipal.

---

*Construido para ciudadanos, por ciudadanos. 🌿*
