# ✅ Checklist de Despliegue PWA

## Pre-Despliegue

### 1. Configuración de Variables de Entorno

- [ ] Configurar `VITE_BACKEND_URL` en producción
- [ ] Configurar `VITE_VAPID_PUBLIC_KEY` (generar con `npx web-push generate-vapid-keys`)
- [ ] Configurar variables de Firebase (si aplica)
- [ ] Verificar que `.env.example` esté actualizado

### 2. Generación de Íconos

- [ ] Generar todos los tamaños de íconos requeridos
- [ ] Colocar íconos en `public/pwa-icons/`
- [ ] Verificar que existan:
  - [ ] icon-72x72.png
  - [ ] icon-96x96.png
  - [ ] icon-128x128.png
  - [ ] icon-144x144.png
  - [ ] icon-152x152.png
  - [ ] icon-192x192.png
  - [ ] icon-384x384.png
  - [ ] icon-512x512.png
  - [ ] icon-180x180.png (Apple)
  - [ ] favicon.ico
  - [ ] mask-icon.svg
- [ ] Generar splash screen para iOS

### 3. Configuración del Backend

- [ ] Generar VAPID keys en el backend
- [ ] Configurar endpoint `/api/push/subscribe`
- [ ] Configurar endpoint `/api/push/unsubscribe`
- [ ] Configurar servicio de envío de notificaciones push
- [ ] Verificar que el backend soporte HTTPS
- [ ] Configurar CORS correctamente

### 4. Build y Testing

- [ ] Ejecutar `npm run build`
- [ ] Verificar que no hay errores de TypeScript
- [ ] Ejecutar `npm run preview` para probar build
- [ ] Verificar que el manifest se genere correctamente
- [ ] Verificar que el service worker se registre

### 5. Testing en Dispositivos

#### Android
- [ ] Instalar PWA desde Chrome
- [ ] Verificar que aparezca el prompt de instalación
- [ ] Verificar que el ícono sea correcto
- [ ] Verificar splash screen
- [ ] Probar modo offline
- [ ] Probar notificaciones push
- [ ] Verificar permisos (cámara, ubicación, etc.)

#### iOS
- [ ] Instalar PWA desde Safari
- [ ] Verificar que el ícono sea correcto
- [ ] Verificar que funcione en modo standalone
- [ ] Probar modo offline
- [ ] Probar notificaciones (iOS 16.4+)
- [ ] Verificar permisos

#### Desktop
- [ ] Instalar desde Chrome/Edge
- [ ] Verificar que funcione como app standalone
- [ ] Probar modo offline
- [ ] Probar notificaciones

### 6. Lighthouse Audit

- [ ] Ejecutar Lighthouse audit
- [ ] Verificar PWA score (objetivo: 100)
- [ ] Verificar Performance score (objetivo: >90)
- [ ] Verificar Accessibility score (objetivo: >90)
- [ ] Verificar Best Practices score (objetivo: >90)
- [ ] Verificar SEO score (objetivo: >90)

---

## Despliegue

### 1. Configuración del Hosting

#### Vercel
- [ ] Configurar variables de entorno en Vercel
- [ ] Verificar `vercel.json`
- [ ] Configurar dominio personalizado
- [ ] Habilitar HTTPS automático

#### Netlify
- [ ] Configurar variables de entorno en Netlify
- [ ] Verificar `netlify.toml`
- [ ] Configurar dominio personalizado
- [ ] Habilitar HTTPS automático

#### Railway
- [ ] Configurar variables de entorno en Railway
- [ ] Verificar `railway.toml`
- [ ] Configurar dominio personalizado
- [ ] Verificar que el puerto sea correcto

### 2. Deploy

- [ ] Hacer commit de cambios
- [ ] Push a rama principal
- [ ] Esperar a que el build complete
- [ ] Verificar que no haya errores en logs

### 3. Verificación Post-Deploy

- [ ] Verificar que el sitio cargue correctamente
- [ ] Verificar que HTTPS esté activo
- [ ] Verificar que el manifest sea accesible: `https://tudominio.com/manifest.webmanifest`
- [ ] Verificar que el service worker se registre
- [ ] Probar instalación en dispositivo real
- [ ] Probar notificaciones push

---

## Post-Despliegue

### 1. Monitoreo

- [ ] Configurar analytics (Google Analytics / Mixpanel)
- [ ] Configurar error tracking (Sentry)
- [ ] Monitorear métricas de PWA:
  - [ ] Tasa de instalación
  - [ ] Engagement de notificaciones
  - [ ] Uso offline
  - [ ] Errores de service worker

### 2. Documentación

- [ ] Actualizar README con URL de producción
- [ ] Documentar proceso de despliegue
- [ ] Documentar variables de entorno necesarias
- [ ] Crear guía de instalación para usuarios

### 3. Marketing

- [ ] Crear banner de instalación en el sitio web
- [ ] Comunicar a usuarios sobre la app instalable
- [ ] Crear guías de instalación (Android/iOS)
- [ ] Compartir en redes sociales

---

## Mantenimiento

### Actualizaciones

- [ ] Incrementar versión en `package.json`
- [ ] Actualizar changelog
- [ ] Deploy nueva versión
- [ ] Verificar que los usuarios reciban notificación de actualización
- [ ] Monitorear que no haya errores post-actualización

### Testing Regular

- [ ] Probar instalación mensualmente
- [ ] Verificar que notificaciones funcionen
- [ ] Verificar modo offline
- [ ] Ejecutar Lighthouse audit

### Seguridad

- [ ] Actualizar dependencias regularmente
- [ ] Verificar vulnerabilidades con `npm audit`
- [ ] Renovar certificados SSL (si aplica)
- [ ] Revisar logs de seguridad

---

## Troubleshooting

### La PWA no se instala

**Pasos a verificar**:
1. ¿Está en HTTPS? (obligatorio)
2. ¿El manifest es válido y accesible?
3. ¿El service worker se registró correctamente?
4. ¿Los íconos existen y son accesibles?
5. ¿Se cumple el engagement heuristic? (visita el sitio al menos 2 veces con 5 minutos entre visitas)

### Las notificaciones no funcionan

**Pasos a verificar**:
1. ¿Los permisos están otorgados?
2. ¿Las VAPID keys están configuradas correctamente?
3. ¿El backend está enviando notificaciones correctamente?
4. ¿El service worker está activo?
5. ¿La suscripción está guardada en el backend?

### El modo offline no funciona

**Pasos a verificar**:
1. ¿El service worker está activo?
2. ¿Workbox está configurado correctamente?
3. ¿Los assets están en cache?
4. ¿Las estrategias de cache son correctas?

---

## Recursos de Ayuda

- **PWA Docs**: https://web.dev/progressive-web-apps/
- **Workbox**: https://developers.google.com/web/tools/workbox
- **Web Push**: https://web.dev/push-notifications-overview/
- **Manifest**: https://web.dev/add-manifest/
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse

---

**Fecha de último despliegue**: _________________

**Responsable**: _________________

**Versión actual**: _________________

