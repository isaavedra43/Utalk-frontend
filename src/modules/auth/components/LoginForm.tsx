import React, { useState } from 'react';
import { infoLog } from '../../../config/logger';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SocialButton } from './SocialButton';
import { PasswordField } from './PasswordField';
import { useAuthContext } from '../../../contexts/useAuthContext';
import { Link } from 'react-router-dom';


const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { login } = useAuthContext();
  const navigate = useNavigate();


  // SOLUCIONADO: Removido el useEffect que limpiaba localStorage
  // Este useEffect estaba interfiriendo con el flujo de autenticación exitoso
  // y causando que el usuario fuera deslogueado después del login exitoso

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const email = watch('email');
  const password = watch('password');

  const prefetchChat = async () => {
    try {
      await import('../../../components/chat/ChatModule');
    } catch {
      // no-op prefetch fallback
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      // ✅ NO NAVEGAR DIRECTAMENTE - Dejar que AuthModule maneje la redirección basada en permisos
      infoLog('✅ Login exitoso, AuthModule manejará la redirección basada en permisos...');
      
    } catch (error) {
      infoLog('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      setSocialLoading(provider);
      // Implementar login social aquí
      infoLog(`Login con ${provider}`);
    } catch (error) {
      infoLog(`Error en login con ${provider}:`, error);
    } finally {
      setSocialLoading(null);
    }
  };

  // Función para bypass de desarrollo
  const handleDevBypass = async () => {
    try {
      setIsLoading(true);
      
      // Simular datos de usuario mock
      const mockUser = {
        id: 'dev-user-123',
        email: 'dev@utalk.com',
        displayName: 'Usuario Desarrollo',
        photoURL: 'https://via.placeholder.com/150',
        role: 'agent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simular tokens
      const mockTokens = {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      };

      // Guardar en localStorage
      localStorage.setItem('access_token', mockTokens.accessToken);
      localStorage.setItem('refresh_token', mockTokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Simular Firebase user
      const mockFirebaseUser = {
        uid: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        photoURL: mockUser.photoURL,
        getIdToken: async () => 'mock-firebase-token'
      };

      // Disparar evento de cambio de estado (simular Firebase auth state change)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('firebase-auth-state-changed', {
          detail: { user: mockFirebaseUser }
        }));
      }, 100);

    } catch (error) {
      infoLog('Error en bypass de desarrollo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header del Formulario - Mejorado */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-3 text-center"
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 border border-blue-200/50 mb-4 sm:mb-5 shadow-sm hover-lift animate-float"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
            Bienvenido de vuelta
          </span>
        </motion.div>
        
        <motion.h2 
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient-animated leading-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Inicia sesión en UTalk
        </motion.h2>
        
        <motion.p 
          className="text-gray-600 text-sm sm:text-base font-medium leading-relaxed max-w-xs mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Ingresa tus credenciales para acceder a tu cuenta
        </motion.p>
      </motion.div>

      {/* Botón de Bypass para Desarrollo */}
      {import.meta.env.VITE_DEV_MODE === 'true' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={handleDevBypass}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-9 sm:h-10 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            {isLoading ? 'Conectando...' : '🚀 Modo Desarrollo - Bypass Login'}
          </button>
        </motion.div>
      )}

      {/* Botones Sociales - Mejorados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-3"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <SocialButton
            icon="google"
            text="Continuar con Google"
            onClick={() => handleSocialLogin('google')}
            loading={socialLoading === 'google'}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <SocialButton
            icon="apple"
            text="Continuar con Apple"
            onClick={() => handleSocialLogin('apple')}
            loading={socialLoading === 'apple'}
          />
        </motion.div>
      </motion.div>

      {/* Separador - Mejorado */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative mt-4"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 py-1 bg-white text-gray-500 text-xs sm:text-sm font-medium rounded-full border border-gray-200 shadow-sm">
            O continúa con email
          </span>
        </div>
      </motion.div>

      {/* Formulario */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        {/* Campo Email - Mejorado */}
        <div className="space-y-2">
          <label className="block text-sm sm:text-base font-semibold text-gray-700">
            Correo electrónico
          </label>
          <div className="relative">
            <input
              {...register('email')}
              type="email"
              placeholder="tu@empresa.com"
              disabled={isLoading}
              className={`w-full px-4 py-3 sm:py-3.5 border rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md input-focus-effect ${
                errors.email 
                  ? 'border-red-300 bg-red-50/50' 
                  : 'border-gray-300 hover:border-gray-400 bg-white/80'
              } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {errors.email && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 left-0 text-xs sm:text-sm text-red-600 font-medium"
              >
                {errors.email.message}
              </motion.div>
            )}
          </div>
        </div>

        {/* Campo Password */}
        <PasswordField
          value={password || ''}
          onChange={(value) => setValue('password', value)}
          placeholder="mínimo 8 caracteres"
          label="Contraseña"
          error={errors.password?.message}
          disabled={isLoading}
        />

        {/* Botón de Envío - Mejorado */}
        <motion.div
          className="pt-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white h-12 sm:h-14 font-bold transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden group rounded-2xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed button-glow animate-gradient-shift"
            disabled={isLoading || !email || !password}
          >
            {/* Efecto shine mejorado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 group-hover:animate-shine" />
            
            {/* Efectos de fondo animados */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Contenido del botón */}
            <div className="flex items-center justify-center gap-3 relative z-10">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </div>
          </button>
        </motion.div>
      </motion.form>

      {/* Enlaces de Ayuda - Mejorados */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="text-center space-y-3 pt-2"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/forgot-password" 
            className="inline-block text-sm sm:text-base text-blue-600 hover:text-blue-800 font-semibold transition-all duration-200 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </motion.div>
        
        <motion.div 
          className="text-sm sm:text-base text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          ¿No tienes una cuenta?{' '}
          <motion.a 
            href="/signup" 
            className="text-blue-600 hover:text-blue-800 font-semibold transition-all duration-200 hover:underline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Registrarse
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Enlaces Legales - Mejorados */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="text-center pt-4 sm:pt-6 border-t border-gray-200/50"
      >
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
          <motion.a 
            href="/privacy" 
            className="hover:text-gray-700 transition-all duration-200 hover:underline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Política de Privacidad
          </motion.a>
          <motion.a 
            href="/support" 
            className="hover:text-gray-700 transition-all duration-200 hover:underline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Soporte
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}; 