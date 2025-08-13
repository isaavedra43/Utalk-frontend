import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SocialButton } from './SocialButton';
import { PasswordField } from './PasswordField';
import { useAuth } from '../hooks/useAuth';
import { WebSocketContext } from '../../../contexts/WebSocketContext';
import { useContext } from 'react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isConnected } = useContext(WebSocketContext) || {};

  // Limpiar localStorage al cargar el componente de login
  useEffect(() => {
    console.log('🧹 LoginForm - Limpiando localStorage para forzar login manual');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }, []);

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

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      
      // Esperar a que el WebSocket se conecte completamente
      console.log('✅ Login exitoso, esperando conexión WebSocket...');
      
      // Esperar hasta 10 segundos para que el WebSocket se conecte
      let attempts = 0;
      const maxAttempts = 50; // 50 intentos * 200ms = 10 segundos
      
      while (!isConnected && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
        console.log(`⏳ Esperando conexión WebSocket... (${attempts}/${maxAttempts})`);
      }
      
      if (isConnected) {
        console.log('✅ WebSocket conectado, navegando al chat...');
        navigate('/chat');
      } else {
        console.warn('⚠️ WebSocket no se conectó en el tiempo esperado, navegando de todas formas...');
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      setSocialLoading(provider);
      // Implementar login social aquí
      console.log(`Login con ${provider}`);
    } catch (error) {
      console.error(`Error en login con ${provider}:`, error);
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
      console.error('Error en bypass de desarrollo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header del Formulario */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-2 text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-3 sm:mb-4">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          <span className="text-xs sm:text-sm font-medium text-blue-800">Welcome back</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
          Sign in to UTalk
        </h2>
        <p className="text-gray-600 text-xs sm:text-sm font-medium">
          Enter your credentials to access your account
        </p>
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

      {/* Botones Sociales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-2"
      >
        <SocialButton
          icon="google"
          text="Continue with Google"
          onClick={() => handleSocialLogin('google')}
          loading={socialLoading === 'google'}
        />
        
        <SocialButton
          icon="apple"
          text="Continue with Apple"
          onClick={() => handleSocialLogin('apple')}
          loading={socialLoading === 'apple'}
        />
      </motion.div>

      {/* Separador */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative mt-2"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
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
        {/* Campo Email */}
        <div className="space-y-1.5 sm:space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@company.com"
            disabled={isLoading}
            className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.email 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs sm:text-sm text-red-600"
            >
              {errors.email.message}
            </motion.p>
          )}
        </div>

        {/* Campo Password */}
        <PasswordField
          value={password || ''}
          onChange={(value) => setValue('password', value)}
          error={errors.password?.message}
          disabled={isLoading}
        />

        {/* Botón de Envío */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white h-9 sm:h-10 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group rounded-lg text-xs sm:text-sm"
            disabled={isLoading || !email || !password}
          >
            {/* Efecto shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shine" />
            
            {/* Contenido del botón */}
            <div className="flex items-center justify-center gap-2 relative z-10">
              {isLoading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </motion.div>
      </motion.form>

      {/* Enlaces de Ayuda */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="text-center space-y-2"
      >
        <a 
          href="/forgot-password" 
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Forgot password?
        </a>
        <div className="text-xs sm:text-sm text-gray-600">
          Don't have an account?{' '}
          <a 
            href="/signup" 
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Sign Up
          </a>
        </div>
      </motion.div>

      {/* Enlaces Legales */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="text-center pt-3 sm:pt-4 border-t border-gray-200"
      >
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 text-xs text-gray-500">
          <a href="/privacy" className="hover:text-gray-700 transition-colors">
            Privacy Policy
          </a>
          <a href="/support" className="hover:text-gray-700 transition-colors">
            Support
          </a>
        </div>
      </motion.div>
    </div>
  );
}; 