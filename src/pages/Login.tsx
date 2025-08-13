import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  ArrowRight, 
  Sun, 
  Moon,
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { BenefitsCarousel } from '../components/auth/BenefitsCarousel';
import { Brand } from '../components/auth/Brand';
import { SocialButton } from '../components/auth/SocialButton';
import { PasswordField } from '../components/auth/PasswordField';

const benefits = [
  {
    icon: BarChart3,
    title: "Real-time Insights",
    description: "Track performance metrics and user engagement in real-time with detailed analytics dashboards."
  },
  {
    icon: MessageSquare,
    title: "Unified Inbox",
    description: "Manage all your communications from one place with our integrated messaging platform."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work seamlessly with your team using advanced collaboration tools and shared workspaces."
  },
  {
    icon: TrendingUp,
    title: "Growth Analytics",
    description: "Monitor your business growth with comprehensive analytics and predictive insights."
  }
];

export const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const controls = useAnimation();

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

  // Carousel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % benefits.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular carga
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    
    // Simular carga
    setTimeout(() => {
      setSocialLoading(null);
    }, 2000);
  };

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
          className="backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg p-2 transition-all duration-300"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </motion.div>

      {/* Panel Izquierdo */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-8 lg:p-12">
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

        {/* Contenido */}
        <div className="relative z-10 max-w-md mx-auto text-center">
          {/* Brand */}
          <Brand />

          {/* Título Espectacular */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl xl:text-6xl font-bold leading-tight mt-8"
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
            className="text-xl text-blue-100 mt-6 font-light"
          >
            Grow <span className="font-bold">20% MoM</span> with better campaign tools.
          </motion.p>

          {/* Benefits Carousel */}
          <div className="mt-12">
            <BenefitsCarousel 
              benefits={benefits}
              currentSlide={currentSlide}
              setCurrentSlide={setCurrentSlide}
            />
          </div>

          {/* Badges de Características */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center gap-4 pt-8 flex-wrap"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-white font-medium">Real-time</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white font-medium">Secure</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Panel Derecho */}
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
          <div className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-xl relative overflow-hidden rounded-2xl">
            {/* Borde de gradiente */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl blur-sm" />
            <div className="absolute inset-[1px] bg-white/90 backdrop-blur-xl rounded-xl" />
            
            {/* Contenido */}
            <div className="relative z-10">
              {/* Header del Formulario */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-3 mb-8 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-4">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Welcome back</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Sign in to UTalk
                </h2>
                <p className="text-gray-600 font-medium">
                  Enter your credentials to access your account
                </p>
              </motion.div>

              {/* Botones Sociales */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-3 mb-6"
              >
                <SocialButton
                  provider="google"
                  isLoading={socialLoading === 'google'}
                  onClick={() => handleSocialLogin('google')}
                />
                <SocialButton
                  provider="apple"
                  isLoading={socialLoading === 'apple'}
                  onClick={() => handleSocialLogin('apple')}
                />
              </motion.div>

              {/* Separador */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </motion.div>

              {/* Formulario */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="minimum 8 characters"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Botón de Submit */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-4"
                >
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white h-12 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group rounded-lg"
                    disabled={isLoading}
                  >
                    {/* Efecto shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shine" />
                    
                    {/* Contenido del botón */}
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </motion.div>
              </motion.form>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-6 text-center space-y-4"
              >
                <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Forgot password?
                </a>
                <div className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a href="/signup" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Sign Up
                  </a>
                </div>
              </motion.div>

              {/* Legal Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mt-8 pt-6 border-t border-gray-200 text-center"
              >
                <div className="flex justify-center space-x-4 text-xs text-gray-500">
                  <a href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
                  <a href="/support" className="hover:text-gray-700 transition-colors">Support</a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 