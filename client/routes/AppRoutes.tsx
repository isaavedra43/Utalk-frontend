import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { logger } from "@/lib/utils";

// Páginas principales
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Componentes existentes
import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";
import { CampaignModule } from "@/components/CampaignModule";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { SellerSettings } from "@/components/SellerSettings";

// Componentes placeholder para módulos en desarrollo
import { ContactosPage } from "@/pages/ContactosPage";
import { MensajesPage } from "@/pages/MensajesPage";  
import { EquipoPage } from "@/pages/EquipoPage";

/**
 * SISTEMA DE RUTAS PRINCIPAL - UTalk Frontend
 * 
 * PROPÓSITO:
 * - Centralizar todas las rutas de la aplicación SPA
 * - Manejar autenticación y protección de rutas
 * - Proporcionar navegación robusta con logs detallados
 * - Soporte completo para refresh/deep linking en Vercel
 * 
 * CONFIGURACIÓN SPA:
 * - vercel.json configurado con rewrites para SPA
 * - vite.config.ts optimizado para build de producción
 * - React Router maneja navegación del lado cliente
 * 
 * ESCALABILIDAD:
 * - Fácil agregar nuevas rutas y módulos
 * - Componentes placeholder para desarrollo incremental
 * - Logs exhaustivos para debugging y monitoreo
 */
export function AppRoutes() {
  const location = useLocation();
  
  // Log exhaustivo de navegación y cambios de ruta
  useEffect(() => {
    const routeInfo = {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 100) + '...',
      referrer: document.referrer,
      title: document.title
    };

    console.group('🧭 [NAVIGATION] Cambio de ruta detectado');
    console.info('📍 Información de ruta:', routeInfo);
    console.info('🔗 URL completa:', window.location.href);
    console.info('📱 Viewport:', `${window.innerWidth}x${window.innerHeight}`);
    console.groupEnd();

    logger.navigation('🧭 Navegación a nueva ruta', routeInfo);

    // Actualizar título de página para SEO y UX
    const routeTitles: Record<string, string> = {
      '/': 'UTalk - Dashboard Principal',
      '/login': 'UTalk - Iniciar Sesión', 
      '/dashboard': 'UTalk - Dashboard Ejecutivo',
      '/campañas': 'UTalk - Gestión de Campañas',
      '/contactos': 'UTalk - Gestión de Contactos',
      '/mensajes': 'UTalk - Chat y Mensajes',
      '/conocimiento': 'UTalk - Base de Conocimiento',
      '/equipo': 'UTalk - Gestión de Equipo',
      '/configuración': 'UTalk - Configuración'
    };

    const newTitle = routeTitles[location.pathname] || 'UTalk - Plataforma de Comunicación';
    if (document.title !== newTitle) {
      document.title = newTitle;
      logger.navigation('📄 Título de página actualizado', { newTitle });
    }
    
  }, [location]);

  // Log de inicialización del sistema de rutas
  useEffect(() => {
    logger.navigation('🚀 [ROUTES] Sistema de rutas inicializado', {
      currentPath: location.pathname,
      totalRoutes: 15, // Actualizar cuando agregues más rutas
      protectedRoutes: 8,
      publicRoutes: 1,
      timestamp: new Date().toISOString(),
      routerVersion: 'React Router v6',
      buildInfo: {
        environment: import.meta.env.MODE,
        version: import.meta.env.VITE_APP_VERSION || '1.0.0'
      }
    });
  }, []);

  return (
    <Routes>
      {/* ===== RUTAS PÚBLICAS ===== */}
      
      {/* 
        RUTA DE LOGIN - Acceso público
        - No requiere autenticación
        - Redirige a dashboard tras login exitoso
        - Maneja estado de "from" para redirección post-login
      */}
      <Route 
        path="/login" 
        element={<Login />} 
      />

      {/* ===== RUTAS PROTEGIDAS ===== */}
      {/*
        TODAS las rutas dentro de RequireAuth requieren autenticación
        - Si no hay sesión válida → redirige a /login
        - Si hay sesión → permite acceso y renderiza Outlet
        - Logs detallados de autenticación en RequireAuth.tsx
      */}
      <Route element={<RequireAuth />}>
        
        {/* 
          RUTA PRINCIPAL - Dashboard Inbox
          - Landing page tras login
          - Vista principal de mensajes y conversaciones
        */}
        <Route 
          path="/" 
          element={<Index />} 
        />

        {/* 
          DASHBOARD EJECUTIVO - Métricas y KPIs
          - Vista ejecutiva con métricas del negocio
          - KPIs, gráficos, alertas en tiempo real
          - Exportación de reportes PDF/Excel
        */}
        <Route 
          path="/dashboard" 
          element={
            <div className="h-screen bg-gray-950">
              <ExecutiveDashboard />
            </div>
          } 
        />

        {/* 
          GESTIÓN DE CAMPAÑAS - Marketing y comunicación masiva
          - Crear, editar, lanzar campañas
          - Templates, segmentación, analytics
          - Integración con WhatsApp Business API
        */}
        <Route 
          path="/campañas" 
          element={
            <div className="h-screen bg-gray-950">
              <CampaignModule />
            </div>
          } 
        />

        {/* 
          GESTIÓN DE CONTACTOS - CRM y base de datos
          - Lista de contactos con filtros avanzados
          - Importación CSV, exportación, tags
          - Historial de conversaciones por contacto
        */}
        <Route 
          path="/contactos" 
          element={
            <div className="h-screen bg-gray-950">
              <ContactosPage />
            </div>
          } 
        />

        {/* 
          CHAT Y MENSAJERÍA - Conversaciones en tiempo real
          - WhatsApp, Facebook Messenger, SMS, Email
          - Socket.io para tiempo real
          - AI Assistant integrado
        */}
        <Route 
          path="/mensajes" 
          element={
            <div className="h-screen bg-gray-950">
              <MensajesPage />
            </div>
          } 
        />

        {/* 
          BASE DE CONOCIMIENTO - Documentos y FAQs
          - Gestión de documentos internos
          - FAQs para clientes y agentes
          - Upload de archivos, categorización
        */}
        <Route 
          path="/conocimiento" 
          element={
            <div className="h-screen bg-gray-950">
              <KnowledgeBase />
            </div>
          } 
        />

        {/* 
          GESTIÓN DE EQUIPO - Usuarios y permisos
          - Lista de agentes y administradores
          - Asignación de roles y permisos
          - Métricas de performance por agente
        */}
        <Route 
          path="/equipo" 
          element={
            <div className="h-screen bg-gray-950">
              <EquipoPage />
            </div>
          } 
        />

        {/* 
          CONFIGURACIÓN - Settings del sistema
          - Configuración de integrations (WhatsApp, etc.)
          - Settings de usuario, notificaciones
          - Configuración de AI y automatizaciones
        */}
        <Route 
          path="/configuración" 
          element={
            <div className="h-screen bg-gray-950">
              <SellerSettings />
            </div>
          } 
        />

        {/* ===== RUTAS DE COMPATIBILIDAD (Inglés → Español) ===== */}
        {/*
          REDIRECCIONES para mantener compatibilidad con URLs en inglés
          - Útil para links externos, bookmarks, APIs que usen URLs en inglés
          - Replace=true para no agregar a history
        */}
        <Route 
          path="/campaigns" 
          element={<Navigate to="/campañas" replace />} 
        />
        <Route 
          path="/contacts" 
          element={<Navigate to="/contactos" replace />} 
        />
        <Route 
          path="/messages" 
          element={<Navigate to="/mensajes" replace />} 
        />
        <Route 
          path="/knowledge" 
          element={<Navigate to="/conocimiento" replace />} 
        />
        <Route 
          path="/team" 
          element={<Navigate to="/equipo" replace />} 
        />
        <Route 
          path="/settings" 
          element={<Navigate to="/configuración" replace />} 
        />

        {/* ===== RUTAS ADICIONALES PARA FUTURO ===== */}
        {/*
          RUTAS PREPARADAS para funcionalidades futuras
          - Fácil activar cuando se implementen
        */}
        <Route 
          path="/reports" 
          element={<Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/analytics" 
          element={<Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/integrations" 
          element={<Navigate to="/configuración" replace />} 
        />

        {/* ===== RUTA CATCH-ALL ===== */}
        {/* 
          IMPORTANTE: Esta ruta DEBE ir AL FINAL
          - Captura todas las rutas no definidas arriba
          - Muestra página 404 personalizada
          - Para debugging: logs de rutas no encontradas
        */}
        <Route 
          path="*" 
          element={<NotFound />} 
        />
      </Route>
    </Routes>
  );
}

/**
 * CHECKLIST DE QA - NAVEGACIÓN SPA
 * 
 * PRUEBAS MANUALES REQUERIDAS:
 * □ Navegar a todas las rutas desde la UI
 * □ Refrescar (F5) en cada ruta - NO debe dar 404
 * □ Deep linking - copiar/pegar URL en nueva pestaña  
 * □ Login/logout - redirección correcta
 * □ Rutas protegidas sin sesión → redirige a /login
 * □ Rutas de compatibilidad (inglés) → redireccionan
 * □ Ruta inexistente → muestra NotFound
 * □ Logs aparecen en consola para cada navegación
 * 
 * LOGS ESPERADOS EN CONSOLA:
 * 🧭 [NAVIGATION] Cambio de ruta detectado
 * 🚀 [ROUTES] Sistema de rutas inicializado  
 * 📄 Título de página actualizado
 * 🔐 [AUTH] RequireAuth logs (desde RequireAuth.tsx)
 * 
 * COMANDOS DE VERIFICACIÓN:
 * npm run build    # Debe compilar sin errores
 * npm run preview  # Test local de build de producción
 * 
 * DESPLIEGUE EN VERCEL:
 * - vercel.json configurado con rewrites SPA
 * - Todas las rutas deben funcionar post-deploy
 * - No debe aparecer página 404 de Vercel
 */ 