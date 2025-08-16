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

export const AuthModule = () => {
  const [isDark, setIsDark] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  const { isAuthenticated } = useAuthContext();

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

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Efectos de Fondo Animados - Solo en desktop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        {/* Orbe 1 - Azul/Púrpura */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
        />
        
        {/* Orbe 2 - Cyan/Azul */}
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-gradient-to-l from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl"
        />
        
        {/* Orbe 3 - Amber/Naranja con rotación */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-tr from-amber-400/10 to-orange-500/10 rounded-full blur-2xl"
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
        {/* Fondo Animado Dinámico */}
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

        {/* Overlay mesh animado */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-cyan-500/20 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
        </div>

        {/* Contenido del Panel Izquierdo */}
        <div className="relative z-10 max-w-lg mx-auto text-center px-4">
          {/* Brand */}
          <Brand />

          {/* Título Espectacular - Responsivo */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold leading-tight mt-4 sm:mt-6"
          >
            <span className="text-white">Una Plataforma para</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-extrabold">
              Optimizar Online
            </span>
            <br />
            <span className="text-white">Todo el Análisis</span>
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent ml-2 sm:ml-4">
              de Productos
            </span>
          </motion.h1>

          {/* Subtítulo - Responsivo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm sm:text-base text-blue-100 mt-3 sm:mt-4 font-light"
          >
            Crece <strong>20% MoM</strong> con mejores herramientas de campaña.
          </motion.p>

          {/* Badges de Características - Responsivo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-4 sm:pt-6"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="text-xs sm:text-sm text-white font-medium">Con IA</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
              <span className="text-xs sm:text-sm text-white font-medium">Tiempo Real</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              <span className="text-xs sm:text-sm text-white font-medium">Seguro</span>
            </div>
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

      {/* Panel Derecho - Formulario - Responsivo */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative order-1 lg:order-2 min-h-[60vh] lg:min-h-screen">
        {/* Patrón de puntos */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        {/* Card con Glassmorphism - Responsivo */}
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-sm sm:max-w-md"
        >
          <div className="p-4 sm:p-6 lg:p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-xl relative overflow-hidden rounded-xl">
            {/* Borde de gradiente */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl blur-sm" />
            <div className="absolute inset-[1px] bg-white/90 backdrop-blur-xl rounded-xl" />
            
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