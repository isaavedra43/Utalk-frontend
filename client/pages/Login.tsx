import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/utils";
import { AuthDebugPanel } from "@/components/AuthDebugPanel";

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

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Log de inicialización del componente
  useEffect(() => {
    logger.auth('Componente Login inicializado', {
      isAuthenticated,
      loading,
      currentUrl: window.location.href
    });
  }, []);

  // NAVEGACIÓN INMEDIATA cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      logger.navigation('Usuario autenticado detectado - Redirigiendo inmediatamente');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Mostrar loader mientras verifica autenticación inicial
  if (loading) {
    logger.auth('Mostrando loader mientras verifica autenticación inicial');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar el formulario
  if (isAuthenticated) {
    return null; // Se redirige en el useEffect
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      logger.auth('Iniciando login desde formulario', { 
        email: data.email,
        hasPassword: !!data.password
      });

      // Mostrar feedback visual inmediato
      toast({
        title: "Verificando credenciales...",
        description: "Por favor espera mientras validamos tu información.",
      });

      // Llamar al AuthContext login
      await login(data.email, data.password);
      
      // El AuthContext actualiza el estado y el useEffect redirige automáticamente
      logger.auth('Login exitoso - Estado actualizado, navegación automática');

    } catch (error: any) {
      logger.auth('Error en login desde formulario', {
        error: error.message,
        email: data.email
      }, true);

      // El error ya se maneja en AuthContext con toast
      // Aquí solo agregamos log adicional si es necesario
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
      <div className="w-full max-w-md">
        {/* Panel de Debug en desarrollo */}
        <AuthDebugPanel />
        
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
                    onClick={() => setShowPassword(!showPassword)}
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
                    Verificando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>

              {/* Estado de loading */}
              {isSubmitting && (
                <div className="text-center text-sm text-gray-400">
                  🔐 Validando credenciales con el servidor...
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