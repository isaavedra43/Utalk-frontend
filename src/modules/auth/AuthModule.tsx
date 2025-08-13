import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Sun, 
  Moon
} from 'lucide-react';
import { LoginForm } from './components/LoginForm';
import { BenefitsCarousel } from './components/BenefitsCarousel.js';
import { Brand } from './components/Brand.js';
import { useAuth } from './hooks/useAuth';

export const AuthModule = () => {
  const [isDark, setIsDark] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  const { isAuthenticated } = useAuth();

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

  // Si ya está autenticado, no mostrar login
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Efectos de Fondo Animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      {/* Aura que sigue el cursor */}
      <motion.div
        className="absolute w-96 h-96 pointer-events-none"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      >
        <div className="w-full h-full bg-gradient-radial from-blue-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Botón Toggle Theme */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 right-6 z-50"
      >
        <button
          onClick={toggleTheme}
          className="backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg p-2"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </motion.div>

      {/* Panel Izquierdo - 50% Desktop */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
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
        <div className="relative z-10 max-w-lg mx-auto text-center">
          {/* Brand */}
          <Brand />

          {/* Título Espectacular */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl xl:text-5xl font-bold leading-tight mt-6"
          >
            <span className="text-white">One Platform to</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-extrabold">
              Streamline Online
            </span>
            <br />
            <span className="text-white">All Product</span>
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent ml-4">
              Analytics
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base text-blue-100 mt-4 font-light"
          >
            Grow <strong>20% MoM</strong> with better campaign tools.
          </motion.p>

          {/* Badges de Características */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center gap-3 pt-6"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-white font-medium">Real-time</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white font-medium">Secure</span>
            </div>
          </motion.div>

          {/* Benefits Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-12"
          >
            <BenefitsCarousel />
          </motion.div>
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative">
        {/* Patrón de puntos */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        {/* Card con Glassmorphism */}
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md"
        >
          <div className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-xl relative overflow-hidden rounded-xl">
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