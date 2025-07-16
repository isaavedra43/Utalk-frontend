import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";

// Schema de validación para el formulario
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresa un email válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Función helper para logs del login
const logLogin = (action: string, data?: any, isError = false) => {
  const timestamp = new Date().toISOString();
  const logLevel = isError ? 'ERROR' : 'INFO';
  const message = `[LOGIN ${logLevel}] ${action}`;
  
  if (isError) {
    console.error(message, data);
  } else {
    console.log(message, data || '');
  }
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Logs de inicialización del componente
  useEffect(() => {
    logLogin('Componente Login inicializado', {
      isAuthenticated,
      loading,
      currentUrl: window.location.href
    });
  }, []);

  // Log de cambios en el estado de autenticación
  useEffect(() => {
    logLogin('Estado de autenticación actualizado', {
      isAuthenticated,
      loading
    });
  }, [isAuthenticated, loading]);

  // Redirección si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      logLogin('Usuario ya autenticado, redirigiendo a la bandeja principal');
      // Pequeño delay para mostrar mensaje de éxito si acaba de hacer login
      const redirectDelay = loginSuccess ? 1500 : 0;
      
      setTimeout(() => {
        logLogin('Ejecutando redirección a /');
        navigate('/', { replace: true });
      }, redirectDelay);
    }
  }, [isAuthenticated, loading, loginSuccess, navigate]);

  // Si ya está autenticado y no está cargando, mostrar mensaje de redirección
  if (isAuthenticated && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
        <div className="w-full max-w-md">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                ¡Acceso autorizado!
              </h2>
              <p className="text-gray-400 mb-4">
                Redirigiendo a la bandeja principal...
              </p>
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      logLogin('Iniciando proceso de login desde formulario', { 
        email: data.email,
        hasPassword: !!data.password
      });

      // Mostrar feedback visual inmediato
      toast({
        title: "Verificando credenciales...",
        description: "Por favor espera mientras validamos tu información.",
      });

      logLogin('Enviando credenciales al AuthContext');
      await login(data.email!, data.password!);
      
      // Login exitoso
      logLogin('Login exitoso desde formulario - Preparando redirección');
      setLoginSuccess(true);
      
      // Mostrar mensaje de éxito
      toast({
        title: "¡Acceso concedido!",
        description: "Redirigiendo a la bandeja principal...",
      });

      // La redirección se manejará en el useEffect
      logLogin('Login completado - Esperando redirección automática');

    } catch (error: any) {
      logLogin('Error en el proceso de login desde formulario', {
        error: error.message,
        email: data.email
      }, true);

      setLoginSuccess(false);
      
      // El error ya se maneja en el AuthContext, pero agregamos log adicional
      logLogin('Login fallido - Manteniendo usuario en formulario', {
        errorType: error.name,
        errorMessage: error.message
      }, true);
    } finally {
      setIsSubmitting(false);
      logLogin('Finalizando proceso de submit del formulario');
    }
  };

  // Log de cambios en el formulario (solo en desarrollo)
  const watchedEmail = watch("email");
  useEffect(() => {
    if (import.meta.env.DEV && watchedEmail) {
      logLogin('Email actualizado en formulario', { email: watchedEmail });
    }
  }, [watchedEmail]);

  // Mostrar loader mientras verifica autenticación inicial
  if (loading) {
    logLogin('Mostrando loader mientras verifica autenticación inicial');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              UTalk
            </CardTitle>
            <p className="text-gray-400 text-sm mt-2">
              Inicia sesión en tu cuenta
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                  disabled={isSubmitting}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 pr-10"
                    disabled={isSubmitting}
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => {
                      setShowPassword(!showPassword);
                      logLogin('Toggle visibilidad de contraseña', { showPassword: !showPassword });
                    }}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* Botón Submit */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loginSuccess ? "Entrando..." : "Verificando..."}
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>

              {/* Indicador de estado */}
              {isSubmitting && (
                <div className="text-center text-sm text-gray-400">
                  {loginSuccess 
                    ? "✅ Credenciales válidas - Configurando sesión..." 
                    : "🔐 Validando credenciales con el servidor..."
                  }
                </div>
              )}
            </form>

            {/* Información adicional */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                ¿Olvidaste tu contraseña?{" "}
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300 underline"
                  onClick={() => {
                    logLogin('Usuario clickeó en recuperar contraseña');
                    toast({
                      title: "Funcionalidad pendiente",
                      description: "La recuperación de contraseña estará disponible pronto.",
                    });
                  }}
                >
                  Recupérala aquí
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información de desarrollo */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-xs text-center mb-2">
              <strong>Modo de desarrollo</strong>
            </p>
            <p className="text-gray-500 text-xs text-center">
              Credenciales de prueba: admin@utalk.com / 123456
            </p>
            <div className="mt-2 text-xs text-gray-600 text-center">
              Revisa la consola para logs detallados del proceso
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 