# 🏗️ Plan de Arquitectura Frontend para Sistema de Chat (Tipo Slack)

## 📋 Resumen Ejecutivo

Este documento detalla la planificación previa y las decisiones tecnológicas para construir un frontend profesional, robusto y mantenible para un sistema de mensajería/chat (similar a Slack, o mejor). Está alineado con el backend existente UTalk (mensajería multicanal con CRM, campañas, chatbot, etc.), por lo que aprovecha al máximo sus capacidades.

**Objetivo**: Usar las mejores tecnologías disponibles (futuras y disruptivas, no solo las más populares), pensando a 10 años adelante en rendimiento y mantenibilidad.

---

## 🎯 1. Definición de Requerimientos y Alcance

### 1.1 Módulos Principales del MVP

#### **Autenticación**

- Pantalla de login (y registro si aplica)
- Uso de email/contraseña con JWT, alineado con la API de autenticación del backend
- Incluye gestión de sesión (tokens de acceso y refresco)

#### **Chat/Conversaciones**

- Vista principal tipo Slack con listado de conversaciones (canales o contactos) y área de mensajes
- Soporta listar conversaciones asignadas o del usuario
- Iniciar nuevas conversaciones
- Cargar el historial de mensajes con paginación

#### **Mensajes**

- Envío y recepción en tiempo real de mensajes de texto (y multimedia en futuras iteraciones)
- Incluye mostrar estado del mensaje (enviado, entregado, leído)
- Funcionalidades tipo typing indicator ("Usuario está escribiendo...")
- Entrega y lectura en vivo

#### **Contactos/Clientes**

- (Para versión completa) módulo de contactos/CRM integrado
- Mostrar detalles del cliente/contacto asociado a cada conversación
- En MVP podría simplificarse a mostrar nombre del contacto en la conversación

#### **Perfil de Usuario**

- Página para ver/editar perfil (nombre, contraseña, etc.)
- Utilizando los endpoints `/api/auth/profile` y cambio de contraseña

### 1.2 Features Clave del MVP

#### **Mensajería en Tiempo Real**

- Al enviar un mensaje, debe aparecer instantáneamente en la interfaz de todos los clientes conectados a esa conversación
- Nuevos mensajes entrantes se muestran sin refrescar la página

#### **Notificaciones**

- Si el usuario está inactivo o la ventana en segundo plano, recibir notificaciones (ej. push del navegador) de mensajes nuevos
- En la interfaz, usar notificaciones tipo toast para avisos breves (ej. "Mensaje enviado" o errores)

#### **Indicadores de Estado**

- Mostrar qué usuarios están en línea o su estado (el backend tiene eventos de USER_ONLINE / OFFLINE)
- Mostrar indicadores de escritura en conversaciones (evento typing)

#### **Seguridad y Roles**

- Soportar distintos roles de usuario (por ahora admin y agente)
- Un admin podría ver todas las conversaciones y métricas, un agente solo las asignadas o propias
- Un cliente externo no tendrá interfaz web propia en MVP, ya que interactúa vía canales externos como WhatsApp/SMS

#### **Multicanal**

- Preparar la UI para diferenciar mensajes según canal (WhatsApp, SMS, email) con íconos o etiquetas
- En MVP quizá solo se enfoque en chat interno
- El backend soporta múltiples canales, por lo que la arquitectura frontend debe ser flexible para añadir vistas de campaña, chatbot y otras pestañas en versiones posteriores

### 1.3 Alcance Técnico

#### **Plataforma**

- La aplicación será web (SPA) con capacidad PWA (instalable, con offline básico y push)
- No se desarrollará app móvil nativa en esta fase, pero el PWA dará experiencia similar a app

#### **Escalabilidad**

- Debe escalar a miles de usuarios concurrentes en tiempo real, manteniendo rendimiento óptimo
- El backend ya es enterprise (usa Node.js + Socket.IO optimizado para miles de conexiones)
- El frontend debe manejar eficientemente actualizaciones frecuentes (virtual DOM o reactividad eficiente, etc.)

#### **Compatibilidad**

- Soportar últimos navegadores modernos
- Uso de estándares ES2025+ (transpilados según necesite)
- Considerar accesibilidad (WCAG) desde el inicio – teclas de navegación en chat, marcas aria, etc.

---

## 🛠️ 2. Selección y Documentación del Stack Tecnológico

### 2.1 Framework Principal

**Decisión**: **SvelteKit (con Svelte 4)**

**Justificación**:

- SvelteKit ofrece una arquitectura moderna sin virtual DOM y compila componentes altamente optimizados
- Resulta en cargas más rápidas y menor huella de JavaScript comparado con React/Next
- Su enfoque reactivo y sintaxis concisa permiten desarrollar más rápido y con menos código (DX sobresaliente)
- En 2025, Svelte y su ecosistema se consideran muy future-proof por su rendimiento y simplicidad
- Sitios SvelteKit suelen superar a equivalentes en Next.js en métricas como First Contentful Paint

**Alternativas evaluadas**: Next.js 13 (React) por su solidez y comunidad. Next es "seguro" y cuenta con React Server Components, pero priorizamos SvelteKit por ser más ligero y "elegante" a largo plazo.

**Nota**: El equipo deberá capacitarse en SvelteKit si es nuevo, pero la curva es manejable dado que la sintaxis es intuitiva y similar a JavaScript puro.

### 2.2 Lenguaje

**Decisión**: **TypeScript (estricto)**

**Justificación**:

- TS es imprescindible para un proyecto grande en 2025 – prácticamente "ya no es opcional"
- Brinda tipado estático robusto, evitando muchos bugs en desarrollo y facilitando el mantenimiento a gran escala
- Con TS tendremos autocompletado, refactors seguros y documentación viva en el código
- Acelera el desarrollo en equipo
- SvelteKit soporta TS de forma nativa en sus plantillas

### 2.3 Sistema de Estilos (CSS)

**Decisión**: **Tailwind CSS (utility-first)**

**Justificación**:

- Permite diseñar rápidamente con clases utilitarias, garantizando consistencia de estilo
- CSS final optimizado (sin clases no usadas gracias a purge)
- Según encuestas, Tailwind destaca como el framework de CSS que los desarrolladores "están felices de seguir usando"
- Al ser utility-first, facilita aplicar el diseño custom requerido (Slack tiene estilo propio, no genérico)
- Empresas líderes como OpenAI, GitHub, Shopify ya confían en Tailwind
- Genera UIs consistentes con menos CSS manual
- Su enfoque modular por componente encaja perfecto con frameworks modernos

**Contrapartida**: Puede producir HTML con muchas clases, pero el mantenimiento global resulta más sencillo que con CSS tradicional.

### 2.4 Biblioteca de UI

**Decisión**: **Shadcn/UI (componentes construidos sobre Tailwind + Radix UI)**

**Justificación**:

- Librería relativamente nueva (2023) que proporciona componentes accesibles y altamente personalizables
- Sin el peso de un estilo predefinido pesado
- Shadcn es mucho más ligera que Material UI
- Los componentes se adaptan fácilmente a cualquier diseño
- Perfecto para lograr una interfaz tipo Slack (personalizada) sin reinventar todo
- Permite "bootstrapear" un diseño propio usando piezas listas (inputs, modales, menús, etc.)
- Al apoyarse en Radix UI bajo el capó, garantiza accesibilidad (ARP) y comportamientos UI consistentes

**Alternativas**: Chakra UI (popular, accesible) o Material UI (robusta pero pesada y con opinión de diseño Material)

**Nota**: Al ser nueva, su comunidad es más pequeña, pero dado que se compone de Tailwind+Radix (tecnologías sólidas), no supone riesgo alto.

### 2.5 Gestión de Estado Global

**Decisión**: **Combinación moderna**

#### **Svelte Stores para Estado Global Sencillo**

- SvelteKit lo incluye de serie
- En Svelte, las stores reactivas cumplen el rol de Context/Redux sin boilerplate
- Son simples objetos reactivos a los que los componentes se suscriben
- Cubre cosas como el usuario logueado, estado de tema, etc.
- Su mecanismo es eficiente (actualiza solo los suscritos) y escalable

#### **TanStack Query para Estado de Servidor**

- Utilizaremos su variante para Svelte (svelte-query) o directamente llamadas con load functions
- Esta librería es el estándar en 2025 para manejar datos asíncronos y cache de API
- Ventajas: fetching centralizado, cacheo automático, refetch en segundo plano, control de estados de carga/error
- Viene perfecto para cargar conversaciones, mensajes, etc., manteniéndolos actualizados sin múltiples llamadas redundantes

#### **Zustand para Estado Global UI Puntual**

- Aunque Svelte stores cubrirán esto, mencionamos Zustand ya que en React es preferido sobre Redux en 2025
- En nuestro caso, Svelte stores son análogas a un Zustand incorporado
- No usaremos Redux Toolkit a menos que el dominio crezca en complejidad extrema

### 2.6 Librería de Formularios

**Decisión**: **React Hook Form**

**Justificación**:

- Extremadamente performante y ligero, evitando rerenders innecesarios
- En React ha reemplazado prácticamente a Formik
- RHF tiene ~2x descargas que Formik en 2024 y un bundle menor
- Asegura validación instantánea y manejo de errores sencillo
- Ofrece integración con esquemas (p.ej. YUP o Zod) para validar campos antes de enviar
- Formik implica más re-renders y código boilerplate

### 2.7 Sistema de Rutas

**Decisión**: **Enrutamiento de SvelteKit basado en filesystem**

**Justificación**:

- Cada página vista corresponde a un archivo en `src/routes`
- Nos da SSR opcional (por ejemplo, podríamos SSR la página de login para optimizar First Load)
- También permite routing SPA cliente
- No necesitaremos algo tipo React Router
- SvelteKit provee navegación optimizada (prefetching de enlaces, etc.)

**Rutas principales**:

- `/login` - Página de login
- `/conversations` - Lista de conversaciones
- `/conversations/[id]` - Página de conversación individual (chat)
- `/profile` - Página de perfil de usuario

### 2.8 Cliente HTTP

**Decisión**: **Axios para llamadas REST**

**Justificación**:

- Aunque fetch nativo ha mejorado, Axios aporta comodidades importantes
- Manejo automático de JSON (convierte responses a objeto)
- Mejores mensajes de error
- Interceptores para agregar token JWT a todas las peticiones
- Refrescar tokens en caso de 401 automáticamente
- Es promisorio y manejable en TS (tiene tipos incluidos)
- Dado que el backend expone una API REST robusta, Axios encaja bien como wrapper

**Nota**: Axios en sí hoy en día usa fetch internamente pero trae ~13KB gzips extras. Asumimos ese pequeño costo por la conveniencia que añade.

### 2.9 Comunicación en Tiempo Real

**Decisión**: **Socket.IO client (v4)**

**Justificación**:

- El backend implementa un avanzado Enterprise Socket Manager basado en Socket.IO
- La mejor opción es usar la misma librería en el frontend para compatibilidad total
- Permite autenticación de sockets con JWT durante el handshake
- Socket.IO es probado en la industria para chats escalables
- Slack y Discord usan websockets similares para lograr actualizaciones instantáneas
- Simplifica manejar reconexiones automáticas, caídas, etc.
- El backend ya tiene eventos definidos como `new-message`, `typing`, `user-online`, etc.

**Alternativas consideradas**: Ably o Pusher (servicios externos de tiempo real), pero dado que tenemos servidor propio optimizado, preferimos control total con Socket.IO.

### 2.10 Gestión de Notificaciones

**Decisión**: **Implementación en dos niveles**

#### **Notificaciones In-App**

- Para feedback rápido al usuario
- Usaremos un componente de Toast (posiblemente aprovechando Shadcn UI)
- Para mostrar mensajes efímeros (ej: "Mensaje enviado" o errores)
- Mejora la UX sin molestar con alerts

#### **Notificaciones Push (Sistema)**

- Integraremos Web Push Notifications vía Service Workers
- Si el usuario tiene la PWA instalada o el sitio abierto en segundo plano, podrá recibir avisos de nuevos mensajes
- Aprovecharemos que ya usamos Firebase en backend
- Podemos utilizar Firebase Cloud Messaging (FCM) para simplificar el envío de push
- También evaluaremos usar la API Notifications del navegador con el Service Worker

**Nota**: Apple iOS recientemente empezó a soportar web push (con restricciones), así que cubriremos al menos Chrome/Firefox/Edge.

### 2.11 Herramientas de Desarrollo

#### **Linters y Formateo**

- Configuraremos ESLint (con reglas recomendadas para Svelte/TS) y Prettier
- Asegura código limpio
- Podemos usar Husky + lint-staged para correr linter en pre-commit

#### **Commits**

- Podemos adoptar Conventional Commits o al menos buenos mensajes
- Quizá configurar Commitlint si se ve valor (menor prioridad)

#### **Testing**

- Añadiremos frameworks como Vitest (rápido para TS, compatible con SvelteKit) o Jest
- Para pruebas unitarias desde el inicio

**Documentación**: Toda elección de tecnología será documentada en un archivo de decisiones (`docs/decisions.md`) para futura referencia, incluyendo por qué se eligió sobre otras.

---

## 📁 3. Arquitectura de Carpetas y Patrones

### 3.1 Estructura Base de Proyecto

```
frontend/
├── src/
│   ├── routes/                    # Pages y endpoints SvelteKit
│   │   ├── +layout.svelte        # Layout principal (nav lateral, etc.)
│   │   ├── +page.svelte          # Página inicial / dashboard
│   │   ├── login/
│   │   │   └── +page.svelte      # Página de login
│   │   ├── conversations/
│   │   │   ├── +page.svelte      # Lista de conversaciones
│   │   │   └── [id]/
│   │   │       └── +page.svelte  # Página de conversación individual (chat)
│   │   └── profile/
│   │       └── +page.svelte      # Página de perfil de usuario
│   ├── lib/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── stores/              # Stores Svelte (estado global)
│   │   ├── hooks/               # Hooks o funciones utilitarias
│   │   ├── utils/               # Utilidades generales
│   │   ├── services/            # Lógica de acceso a APIs
│   │   └── types/               # Definiciones de tipos/interfaces TS
│   ├── styles/                  # CSS global o configuración Tailwind
│   └── app.d.ts                 # Definiciones TS globales (SvelteKit)
├── static/                      # Archivos estáticos
├── tests/                       # Pruebas unitarias/integración
├── package.json
└── vite.config.js              # Configuración de bundler
```

### 3.2 Módulos por Funcionalidad

#### **Módulo Auth**

- Componentes de Login
- Store de auth (usuario y tokens)
- Servicio AuthService

#### **Módulo Chat**

- Componentes de ConversationList, ChatWindow, MensajeItem
- Stores relacionados (ej. store de conversaciones en memoria)
- Servicio ChatService (llamadas a `/messages` y `/conversations`)

**Nota**: Esto ayuda a la escalabilidad. A medida que agreguemos campañas, chatbot, etc., cada módulo tiene su espacio.

### 3.3 Patrones de Diseño de Componentes

#### **Componentes Presentacionales vs Contenedores**

- Usaremos componentes presentacionales (solo UI, props) vs contenedores (manejan datos)
- En Svelte, probablemente tengamos componentes que reciben datos ya preparados para mostrar
- La lógica de fetch estará en load functions o en el componente padre contenedor

#### **Patrón de Composición**

- Aplicaremos patrón de composición en vez de herencia
- Componentes pequeños reutilizables (ej: `<MessageItem>`, `<MessageList>`, `<ChatInput>`)
- Se componen en vistas mayores

#### **Custom Hooks/Composables**

- Encapsularemos lógica repetitiva en funciones reutilizables
- Ej: un hook `useSocket()` para conectar al socket y exponer eventos
- Un hook `useNotifications()` para solicitar permiso de notificación
- Esto mantiene los componentes limpios

#### **Manejo de Estado**

- Centralizado en stores para datos globales
- Evitando prop drilling
- Para local state dentro de un componente, Svelte reactividad local es suficiente

#### **CSS Design System**

- Con Tailwind definiremos en config colores, fuentes y spacings
- Posiblemente crearemos componentes base estilizados (ej: `<Button variant="primary">`)
- Para un diseño consistente

### 3.4 Documentación de Arquitectura

Se elaborará un `ARCHITECTURE.md` que explique:

- Esta estructura
- Los principios de patrones usados
- Convenciones (nomenclatura de archivos, etc.)
- Diagramas simples si ayuda

---

## ⚙️ 4. Configuración Inicial del Repositorio

### 4.1 Inicializar Repositorio Git

- Crear el repositorio (`git init`) y hacer un primer commit base
- Añadir un remoto (GitHub, GitLab) según corresponda al proyecto

### 4.2 .gitignore

- Configurar `.gitignore` para excluir `node_modules`
- Archivos de build (`.svelte-kit/`, `build/`)
- `.env` y credenciales
- Cualquier otro artefacto (ej: coverage, logs)
- Usaremos plantillas estándar para Node/Svelte

### 4.3 Instalar Dependencias Base

- SvelteKit, Tailwind, etc.
- Configurar Tailwind (generar config) e integrar con SvelteKit (postcss)
- Instalar Axios, Socket.IO client, etc.
- Enumerar las dependencias clave en la documentación del repo

### 4.4 Configurar Linters y Formateo

- Añadir ESLint con la configuración recomendada de Svelte (`eslint-plugin-svelte`)
- Incluir reglas de TypeScript y posiblemente Prettier
- Incluir un script npm "lint" que revise todo
- Lo mismo con Prettier (archivo de config)
- Ejecutar una pasada inicial para asegurarnos que todo el repo sigue el estilo desde el inicio

### 4.5 Pre-commits Hooks

- Usar Husky para configurar un gancho pre-commit que ejecute el linter y quizás los tests
- Ejemplo: `"husky": { "hooks": { "pre-commit": "npm run lint && npm run test" } }`

### 4.6 CI/CD

#### **Vercel**

- Si desplegaremos en Vercel, aprovecharemos su CI integrada
- Cada push a main (o a ramas específicas) puede disparar deploy previo a producción
- Configuraremos el proyecto en Vercel vinculando el repo
- Vercel es ideal si hubiéramos usado Next, pero soporta SvelteKit también

#### **Alternativas**

- Railway o Netlify para desplegar la app
- Railway se mencionó para backend, pero para frontend preferimos Vercel

#### **GitHub Actions**

- Implementaremos un workflow de CI que al hacer PR ejecute build y tests
- Asegurando que las contribuciones no rompan nada
- En producción, podríamos requerir que CI pase antes de hacer merge

**Documentación**: Documentar en `docs/DEPLOYMENT.md` cómo es el flujo de CI/CD.

### 4.7 README.md

Actualizar el README del repo con:

- Descripción del proyecto, lista de tecnologías
- Pasos de instalación y ejecución (ej: `npm install`, `npm run dev`)
- Cómo correr linters/test
- Enlaces a documentación relevante (arquitectura, etc.)

### 4.8 Variables de Entorno

Crear un archivo `.env.example` con las variables necesarias:

```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_FIREBASE_PUSH_KEY=...
```

**Nota**: En SvelteKit, variables que empiezan con `VITE_` son expuestas al front.

### 4.9 Commit Inicial Limpio

- Haremos un commit inicial conteniendo la estructura de carpetas, configs
- Quizás un "Hello World" mínimo (ej: página principal con mensaje)
- Sin lógica de negocio aún
- Este commit servirá para comprobar que el pipeline CI/CD, el deploy, etc., funcionan en vacío

---

## 🔌 5. Integraciones Críticas Antes de Empezar

### 5.1 Prueba de API REST (Backend)

#### **Health Check**

- Realizar una llamada de prueba al backend para asegurarnos de la conectividad
- Usar fetch o Axios desde la consola o una pequeña función para llamar al health check (`GET /health`)
- Si responde `{"status":"healthy", ...}`, confirmamos que la URL base y CORS están correctos

#### **Flujo Principal de Pruebas**

**Login**:

- Llamar `POST /api/auth/login` con credenciales de prueba
- El backend envía en su README un ejemplo con `admin@utalk.com/password123`
- Verificar que obtenemos `200 OK` con un `accessToken` y datos de usuario
- Almacenar ese token para siguientes pruebas

**Obtener Conversaciones**:

- Con el token, llamar `GET /api/conversations` (lista de conversaciones)
- Debería devolver `200` con una lista paginada
- Confirmar estructura: cada conversación tiene `id`, `contactName`, `lastMessageAt`, etc.

**Obtener Mensajes**:

- Probar `GET /api/conversations/{id}/messages` para una conversación concreta
- O `GET /api/messages?conversationId=...`
- Debería traer mensajes con sus campos (`content`, `timestamp`, `status`)

**Enviar Mensaje**:

- Probar `POST /api/messages` con un cuerpo `{"conversationId":"conv_123", "content":"Hola", "type":"text"}`
- Con el token auth, debería retornar `201` con datos del nuevo mensaje (`id`, `content`, `status "sent"`)
- Verificar si el nuevo mensaje aparece vía socket también

### 5.2 Prueba de Conexión en Tiempo Real

#### **Configuración Temporal**

- Configurar temporalmente el cliente Socket.IO
- Podemos escribir un pequeño script o usar la consola del navegador

#### **Conexión con JWT**

- Con el token JWT obtenido, intentar conectar a `ws://localhost:3001`
- Usar `io(URL, { auth: { token } })`
- El backend espera el token en el handshake
- Si todo va bien, el socket `.on("connect")` debe dispararse
- Si hay error de auth, veremos un `connect_error`

#### **Suscripción a Eventos**

- Suscribir a un evento de prueba
- Por ejemplo, el backend podría emitir `conversation-joined` tras uno unirse a una sala
- O más simple: emitir desde cliente un evento `join-conversation` con un ID válido
- Escuchar `conversation-joined`

#### **Prueba de Envío de Mensaje via Socket**

- El flujo previsto es: tras hacer `POST /messages`, el backend emitirá un evento `new-message`
- A todos en esa conversación
- Del lado cliente, simular enviar mensaje vía REST y ver si nuestro listener de `new-message` capta algo
- Confirmaremos esto: al hacer POST de antes, deberíamos recibir un evento `new-message` con los datos del mensaje creado

#### **Prueba de Otros Eventos**

- Por ejemplo emitir desde consola `socket.emit('typing', { conversationId: X })`
- Ver si backend responde algo
- Al menos podemos observar en network si el ping-pong de WS está activo

### 5.3 Documentar Endpoints Críticos

Recopilar los detalles para el equipo:

#### **URLs**

- URL base (ej: `https://api.utalk.com` en prod, `http://localhost:3001` en dev)

#### **Endpoints Usados en MVP**

- **Auth**: `/api/auth/login`, `/auth/refresh`, `/auth/logout`
- **Conversations**: `GET /api/conversations`, `/conversations/:id`
- **Messages**: `GET /api/messages?conversationId=`, `POST /api/messages` para enviar
- **Read Status**: `PUT /api/conversations/:id/messages/:msgId/read` para marcar leído si existe

**Documentación**: Podríamos resumirlo en un confluence o en markdown en `/docs/API_FRONTEND_USAGE.md`

### 5.4 Configurar Manejo de Errores Global

#### **Expiración de Sesión**

- Dado que tenemos refresh token, debemos integrar en Axios un interceptor
- Si `401` y la respuesta indica token expirado, llamar refresh endpoint y reintentar la original
- Posiblemente escribamos un `AuthService.refreshToken()` que se active automáticamente

#### **Manejo de Errores Global**

- Un componente `<ErrorBoundary>` o en SvelteKit aprovechar la forma de manejar errores
- Crear `+error.svelte` para páginas de error global

### 5.5 Servicios Externos

#### **Firebase**

- En principio, el front no usará directamente Firestore ni Auth, todo pasa por backend
- **Excepción**: Si implementamos notificaciones push via FCM, necesitaremos incluir el SDK de Firebase Messaging
- Para registrar el token de dispositivo
- Deberíamos probar eso: inicializar Firebase app con config y pedir permiso de notificaciones

#### **Otros Servicios**

- Mapas, otros: No aplica mucho en chat
- Por ahora, parece que el front se comunica solo con UTalk API y con Socket.io

### 5.6 Revisar CORS y Seguridad

- Asegurar que el backend permite nuestras peticiones (CORS configurado para nuestro origen dev)
- En el `.env` backend vimos `CORS_ORIGINS`
- Nos aseguraremos de incluir nuestro dominio front al desplegar
- Ej: `http://localhost:5173` en dev, y dominio real en prod
- Esto lo coordinaremos con backend config

### 5.7 Verificar Versiones

- Confirmar que usamos versiones compatibles
- Ej: Socket.IO client v4 para server v4, Axios v1, etc.
- También que Node versión para dev es la correcta (Node 18+)

### 5.8 Performance Baseline

- Opcional, pero podríamos desde inicio configurar profiling sencillo
- SvelteKit con Vite permite analizador de bundle
- Podemos hacer un build inicial y ver tamaño
- Debe ser muy pequeño con solo scaffolding
- Esto de base nos servirá para monitorear que al añadir dependencias no se dispare el bundle

---

## 📅 6. Planificación de Versiones y Avance

### 6.1 Versión MVP (v0.1) – Autenticación + Chat Básico

#### **Objetivo**

Tener un sistema funcional donde un agente pueda iniciar sesión y enviar/recibir mensajes en tiempo real en una interfaz mínima.

#### **Incluye**

- Login/logout
- Pantalla de lista de conversaciones (puede ser sencilla, ej. lista de conversaciones activas del usuario)
- Pantalla de chat mostrando mensajes
- Envío de texto
- Recepción de mensajes entrantes (socket)
- Indicadores básicos: quizá un marcador de "en línea" para contactos si fácil

#### **Criterio de Listo**

- Un usuario agente puede conversar con otro (o con un cliente simulado) en tiempo real
- La app maneja expiración de sesión (token refresh)
- UI sencilla pero sin errores
- Código cubierto con pruebas unitarias de utils
- Quizás un test de integración simulado

#### **Tiempo Estimado**

~4 semanas

### 6.2 Versión 1.0 – Chat Completo + Perfil

#### **Objetivo**

Front listo para producción con todas features core de chat interno.

#### **Incluye**

- Todo MVP, más:
- Interfaz mejorada (diseño pulido con Shadcn components)
- Soporte de mensajería enriquecida (enviar imágenes/archivos adjuntos)
- Indicador "Usuario está escribiendo..."
- Marcar mensajes como leídos (con confirmación visual de ticks, etc.)
- Vista de perfil de usuario (y permitir cambiar nombre/contraseña)
- Notificaciones push integradas

#### **Roles**

- Soporte pleno de roles admin/agent
- Por ejemplo un admin podría tener un panel dashboard (métricas) y gestión de usuarios
- Esto último podría ser pospuesto si no crítico

#### **Criterio de Listo**

- La aplicación replica una experiencia tipo Slack básica: multi-conversación, multi-usuario, reliable
- Pases de QA completos, sin bugs críticos

#### **Estimado**

+4-6 semanas tras MVP

### 6.3 Versión 1.1 – Características Multicanal & Extra

#### **Campañas**

- Interfaz para que usuario cree campañas de mensajería masiva
- Apoyándose en endpoints `/api/campaigns`
- Incluiría formularios avanzados (p. ej. seleccionar audiencia)

#### **Bot/IA**

- UI para interactuar con el chatbot
- Quizá una conversación especial tipo "Chatbot"

#### **Base de Conocimientos**

- Sección para buscar artículos (según el backend, existe KB)

#### **Mejoras de UX**

- Drag & drop de archivos al chat
- Reacciones a mensajes
- Threads (responder a mensajes, backend ya soporta `replyToMessageId`)

#### **Criterio**

Expansión funcional terminada, app lista para casos de uso más amplios.

### 6.4 ROADMAP y Seguimiento

#### **Documentación**

- Crearemos un documento `docs/ROADMAP.md` con estos hitos, fechas tentativas y prioridades
- Será actualizado conforme avanza el proyecto

#### **Riesgos y Mitigaciones**

**Riesgo**: El equipo no domina SvelteKit

- **Mitigar**: Con capacitación inicial, pair programming al inicio

**Riesgo**: Integración socket compleja

- **Mitigar**: Con pruebas en entorno controlado primero, como ya planificado

**Riesgo**: Performance de listas largas de mensajes

- **Mitigar**: Usando técnicas virtual scroll en caso de miles de msgs, y pruebas de carga

**Riesgo**: Requerimientos cambiantes

- **Mitigar**: Trabajando con metodología ágil – sprints cortos y demos frecuentes al Product Owner

#### **Prioridades Semanales**

- Usaremos probablemente sprints de 1-2 semanas
- Al inicio de cada sprint definiremos tareas concretas
- Ej: Sprint 1: estructura + login básico
- Sprint 2: pantalla chat con list/scroll
- Sprint 3: realtime integration

#### **Control de Avance**

- Setup de tracking de tareas (Jira, Trello o GitHub Projects)
- Donde cada elemento de esta checklist quizás sea un story
- Esto permitirá marcar cada `[ ]` como `[x]` cuando esté listo

#### **Entrega y Demo**

- Al final de MVP y 1.0 haremos demos funcionales al equipo stakeholder para feedback
- También pruebas de usuario internas para pulir UX

---

## ✅ 7. Checklist de Calidad Continua

### 7.1 Testing Automatizado Desde el Inicio

#### **Pruebas Unitarias**

- Implementaremos tests unitarios para funciones puras y componentes críticos
- Ejemplo: utilidades de formateo (fechas de mensaje), stores (reducers o funciones)
- Componentes de presentación (usar Svelte Testing Library o similar)
- Al menos cubrir casos base: login form validation, mensaje componente corta texto largo adecuadamente, etc.

#### **Pruebas de Integración**

- A medida que tengamos módulos completos, escribir tests que simulen escenarios completos
- Con un mock del servidor (o utilizando un entorno de staging del backend)
- Probar el flujo login + abrir conversación + enviar mensaje
- Comprobar que el estado global se actualiza
- Podemos usar herramientas como Cypress o Playwright para pruebas end-to-end

#### **Cobertura**

- Apuntamos a un % decente (ej. >80% en utils y lógica)
- Sin obsesión, pero útil

### 7.2 Revisiones de Código (Code Review)

- Todo pull request deberá ser revisado por al menos un colega antes de merge
- Esto asegura estándares de calidad, detección de bugs temprana y difusión de conocimiento
- Usaremos Github PRs con checklist
- ¿Pasa CI? ¿Sigue guías estilo? ¿Hay pruebas? etc.

### 7.3 Documentación Continua

#### **Componentes**

- Cada componente complejo tendrá comentarios o README contextual
- Ej: un componente `ChatWindow.svelte` podría llevar en comentarios la descripción de cómo funciona la paginación de mensajes

#### **Funciones**

- Usar JSDoc/TSdoc en funciones utilitarias
- Para que otros desarrolladores entiendan su propósito rápidamente

#### **Documentación del Repo**

- Mantener actualizado el `/docs` del repo
- Guía de despliegue, de seguridad, etc.
- Tomando inspiración del backend que ya tiene docs (Deployment, Security, Testing)

### 7.4 Linting & Formatting Estrictos

- Gracias a ESLint/Prettier integrados, todos los commits tendrán formato consistente
- Configuraremos reglas para código accesible
- No se permitirán warnings de linter en build final

### 7.5 Performance Monitoring

- Aunque es front, podemos integrar herramientas como Lighthouse CI en el pipeline
- Para vigilar performance (p.ej. que Time to Interactive se mantenga bajo cierto umbral)
- En producción, podríamos usar Sentry o similares para capturar errores runtime

### 7.6 Seguridad Front

- Seguir buenas prácticas: nunca exponer info sensible en código
- Sanitizar input (la mayoría ya lo hace backend con Joi, pero en front validaremos formularios para usabilidad)
- Considerar usar Content Security Policy apropiada
- También evitar vulnerabilidades XSS en componentes (Svelte escapa contenido por defecto)

### 7.7 Retroalimentación de Usuarios

- Una vez en testing interno o beta, recopilar feedback
- Podríamos instrumentar analíticas simples (ej: cuántos mensajes envía un usuario al día)
- Pero como hay un dashboard analytics en back, quizá solo enfocarnos en UX feedback directo

### 7.8 Proceso de Despliegue Controlado

- En producción, usar despliegues canary si posible
- Por ejemplo, Vercel supports deploying preview to a % of users
- Al menos, hacer staging testing antes de pasar a prod

### 7.9 Mantenimiento

- Definir responsables del mantenimiento post-release
- Asegurar que hay rotación de guardia en caso de bugs urgentes
- Particularmente porque es un chat, se espera alta disponibilidad

---

## 📚 Referencias y Enlaces

### Documentación del Backend

- [README.md](https://github.com/isaavedra43/Utalk-backend/blob/a9d5f8df958eb0dbfc52fe36b07a2497d9002835/README.md)
- [API.md](https://github.com/isaavedra43/Utalk-backend/blob/a9d5f8df958eb0dbfc52fe36b07a2497d9002835/docs/API.md)
- [MessageController.js](https://github.com/isaavedra43/Utalk-backend/blob/a9d5f8df958eb0dbfc52fe36b07a2497d9002835/src/controllers/MessageController.js)
- [enterpriseSocketManager.js](https://github.com/isaavedra43/Utalk-backend/blob/a9d5f8df958eb0dbfc52fe36b07a2497d9002835/src/socket/enterpriseSocketManager.js)
- [REALTIME_ARCHITECTURE.md](https://github.com/isaavedra43/Utalk-backend/blob/a9d5f8df958eb0dbfc52fe36b07a2497d9002835/REALTIME_ARCHITECTURE.md)

### Tecnologías y Frameworks

- [Svelte vs Next.js: Which JavaScript Framework Should You Choose?](https://www.dhiwise.com/post/svelte-vs-nextjs)
- [Which Front-End Framework Feels Most "Future-Proof" in 2025?](https://www.sitepoint.com/community/t/which-front-end-framework-feels-most-future-proof-in-2025/475770)
- [React vs Vue vs Svelte: Choosing the Right Framework for 2025](https://medium.com/@ignatovich.dm/react-vs-vue-vs-svelte-choosing-the-right-framework-for-2025-4f4bb9da35b4)
- [Why Front-End Developers Should Use TypeScript in 2025](https://dev.to/priya_khanna_44234bba65fb/why-front-end-developers-should-use-typescript-in-2025-2m26)

### CSS y UI Frameworks

- [Top 7 CSS Frameworks in 2025](https://www.wearedevelopers.com/en/magazine/362/best-css-frameworks)
- [Material UI vs. ShadCN UI - Which Should You be using in 2024?](https://blog.openreplay.com/material-ui-vs-shadcn-ui/)
- [Top 5 CSS Frameworks in 2024: Tailwind, Material-UI, Ant Design, Shadcn & Chakra UI](https://www.codingwallah.org/blog/2024-top-css-frameworks-tailwind-material-ui-ant-design-shadcn-chakra-ui/)

### State Management

- [State Management in 2025: Redux, Zustand, or React Query?](https://www.linkedin.com/pulse/state-management-2025-redux-zustand-react-query-sbtqc)
- [React-Hook-Form vs Formik: The Good, Bad, and Ugly](https://joyfill.io/blog/react-hook-form-vs-formik-the-good-bad-and-ugly)

### HTTP Clients

- [Should I use fetch or axios to make API calls?](https://www.reddit.com/r/reactjs/comments/1hp5glg/should_i_use_fetch_or_axios_to_make_api_calls/)
- [Say Goodbye To Axios In 2025](https://javascript.plainenglish.io/say-goodbye-to-axios-in-2025-04fc0772c01e)

### Real-time y Notificaciones

- [Real-time Messaging - Engineering at Slack](https://slack.engineering/real-time-messaging/)
- [Using Push Notifications in PWAs: The Complete Guide](https://www.magicbell.com/blog/using-push-notifications-in-pwas)

---

## 🎯 Resumen

Con esta planificación, disponemos de un mapa detallado para construir un frontend de chat de clase mundial, combinando lo mejor de la tecnología actual (SvelteKit, Tailwind, Socket.IO, etc.) con prácticas de ingeniería robustas (testing continuo, arquitectura modular).

Siguiendo este documento paso a paso, nuestro equipo podrá desarrollar un frontend "a la altura" del backend o incluso superior, logrando una aplicación tipo Slack moderna, escalable y preparada para el futuro.

**¡Manos a la obra!**
