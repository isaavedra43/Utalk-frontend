import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Sun, 
  Moon
} from 'lucide-react';
import { LoginForm } from './components/LoginForm';
import { BenefitsCarousel } from './components/BenefitsCarousel';
import { Brand } from './components/Brand';
import { useAuthContext } from '../../contexts/useAuthContext';
import { useInitialModule } from '../../hooks/useInitialModule';
import '../../styles/login-animations.css';

export const AuthModule = () => {
  const [isDark, setIsDark] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  const { isAuthenticated } = useAuthContext();
  const { getInitialModule, loading: permissionsLoading } = useInitialModule();

  // Animación flotante
  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
  }, [controls]);

  // Tracking del mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  // Si ya está autenticado, redirigir al módulo inicial basado en permisos
  if (isAuthenticated) {
    // Si los permisos están cargando, mostrar loading
    if (permissionsLoading) {
      return (
        <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cargando permisos...
            </h3>
            <p className="text-gray-600">
              Determinando módulos disponibles
            </p>
          </div>
        </div>
      );
    }

    // Obtener el módulo inicial basado en permisos
    const initialModule = getInitialModule();
    
    // Si no hay módulo inicial (no hay permisos), mostrar error
    if (!initialModule) {
      return (
        <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sin permisos de acceso
            </h3>
            <p className="text-gray-500 mb-4">
              No tienes permisos para acceder a ningún módulo del sistema
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      );
    }

    const modulePath = `/${initialModule}`;
    return <Navigate to={modulePath} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Efectos de Fondo Animados - Mejorados para móvil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Orbe 1 - Azul/Púrpura - Visible en móvil también */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
        />
        
        {/* Orbe 2 - Cyan/Azul - Visible en móvil también */}
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/3 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gradient-to-l from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl"
        />
        
        {/* Orbe 3 - Amber/Naranja con rotación - Visible en móvil también */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 right-1/4 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-tr from-amber-400/10 to-orange-500/10 rounded-full blur-2xl"
        />

        {/* Nuevos orbes para móvil */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/6 left-1/6 w-24 h-24 sm:w-32 sm:h-32 lg:hidden bg-gradient-to-r from-pink-400/20 to-rose-500/20 rounded-full blur-2xl"
        />
        
        <motion.div
          animate={{ 
            x: [0, 20, 0],
            y: [0, -15, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/6 left-1/3 w-20 h-20 sm:w-28 sm:h-28 lg:hidden bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-full blur-2xl"
        />
      </div>

      {/* Aura que sigue el cursor - Solo en desktop */}
      <motion.div
        className="absolute w-96 h-96 pointer-events-none hidden lg:block"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      >
        <div className="w-full h-full bg-gradient-radial from-blue-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Botón Toggle Theme - Responsivo */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-4 right-4 lg:top-6 lg:right-6 z-50"
      >
        <button
          onClick={toggleTheme}
          className="backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg p-2 lg:p-2"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </motion.div>

      {/* Panel Izquierdo - Responsivo */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative order-2 lg:order-1">
        {/* Fondo Animado Dinámico - Mejorado para móvil */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
          animate={{
            background: [
              "linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #3730a3 100%)",
              "linear-gradient(135deg, #1e293b 0%, #1d4ed8 50%, #4338ca 100%)",
              "linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #3730a3 100%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Overlay mesh animado - Mejorado */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-cyan-500/20 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
          
          {/* Patrones geométricos adicionales para móvil */}
          <div className="absolute inset-0 lg:hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:20px_20px] animate-pulse" />
          </div>
        </div>

        {/* Efectos de partículas flotantes para móvil */}
        <div className="absolute inset-0 lg:hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Contenido del Panel Izquierdo */}
        <div className="relative z-10 max-w-lg mx-auto text-center px-4">
          {/* Brand */}
          <Brand />

          {/* Título Espectacular - Mejorado para móvil */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold leading-tight mt-4 sm:mt-6"
          >
            <motion.span 
              className="text-white block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Una Plataforma para
            </motion.span>
            <br />
            <motion.span 
              className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-extrabold block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Optimizar Online
            </motion.span>
            <br />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-1 sm:gap-2"
            >
              <span className="text-white">Todo el Análisis</span>
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                de Productos
              </span>
            </motion.div>
          </motion.h1>

          {/* Subtítulo - Mejorado para móvil */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm sm:text-base text-blue-100 mt-3 sm:mt-4 font-light leading-relaxed"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="block"
            >
              Crece <strong className="text-yellow-300">20% MoM</strong> con mejores
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent font-semibold"
            >
              herramientas de campaña.
            </motion.span>
          </motion.p>

          {/* Badges de Características - Mejorados para móvil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-4 sm:pt-6"
          >
            <motion.div 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-md border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-white font-semibold">Con IA</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 backdrop-blur-md border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-white font-semibold">Tiempo Real</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-md border border-green-400/30 hover:border-green-400/50 transition-all duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-white font-semibold">Seguro</span>
            </motion.div>
          </motion.div>

          {/* Indicador de scroll para móvil */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.0 }}
            className="mt-6 lg:hidden"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center text-white/60"
            >
              <span className="text-xs font-medium mb-1">Desliza para iniciar sesión</span>
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1 h-3 bg-white/60 rounded-full mt-2"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Benefits Carousel - Solo en desktop */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-8 sm:mt-12 hidden lg:block"
          >
            <BenefitsCarousel />
          </motion.div>
        </div>
      </div>

      {/* Panel Derecho - Formulario - Mejorado para móvil */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative order-1 lg:order-2 min-h-[60vh] lg:min-h-screen">
        {/* Fondo mejorado para móvil */}
        <div className="absolute inset-0">
          {/* Gradiente base */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30" />
          
          {/* Patrón de puntos sutil */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          
          {/* Efectos de luz para móvil */}
          <div className="absolute inset-0 lg:hidden">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Card con Glassmorphism Mejorado - Responsivo */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="relative w-full max-w-sm sm:max-w-md"
        >
          {/* Efectos de fondo animados */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl blur-xl opacity-20 animate-pulse" />
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 rounded-xl blur-lg" />
          
          <div className="relative p-4 sm:p-6 lg:p-8 shadow-2xl border-0 bg-white/90 backdrop-blur-2xl relative overflow-hidden rounded-2xl">
            {/* Borde de gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 rounded-2xl blur-sm animate-pulse" />
            <div className="absolute inset-[2px] bg-white/95 backdrop-blur-2xl rounded-2xl" />
            
            {/* Efectos de brillo */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl pointer-events-none" />
            
            {/* Contenido */}
            <div className="relative z-10">
              <LoginForm />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 