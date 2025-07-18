import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = { email: "", password: "" };
    let isValid = true;

    if (!formData.email) {
      errors.email = "El email es requerido";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = "Por favor ingresa un email válido";
      isValid = false;
    }

    if (!formData.password) {
      errors.password = "La contraseña es requerida";
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    clearError();
    setFieldErrors({ email: "", password: "" });

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      // El login exitoso redirigirá automáticamente
    } catch (err: any) {
      // El error ya está manejado en el contexto de auth
      console.error('Error en login:', err.message);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Limpiar errores de campo cuando el usuario empiece a escribir
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    
    // Limpiar error general
    if (error) {
      clearError();
    }
  };

  const isFormValid = formData.email && formData.password && !isLoading;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormValid) {
      handleSubmit(e as any);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#1A1B22" }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-lg p-8 shadow-2xl border border-gray-700"
          style={{ backgroundColor: "#2A2D3A" }}
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">UTalk</h1>
            <p className="text-gray-400 text-sm">Inicia sesión en tu cuenta</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onKeyPress={handleKeyPress}
                className={cn(
                  "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500",
                  fieldErrors.email &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500",
                )}
                disabled={isLoading}
                autoComplete="email"
                required
              />
              {fieldErrors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-white text-sm font-medium"
              >
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  className={cn(
                    "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 pr-10",
                    fieldErrors.password &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500",
                  )}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* General Error Message from Backend */}
            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error de autenticación</p>
                  <p className="text-xs opacity-90">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid}
              className={cn(
                "w-full h-11 font-medium transition-all duration-200",
                isFormValid && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Info sobre backend */}
          <div className="text-center mt-6">
            <div className="text-xs text-gray-500 bg-gray-800/50 rounded-md p-2">
              <p className="mb-1">🔐 Autenticación JWT habilitada</p>
              <p>Backend: Node.js + Firebase Auth + JWT</p>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => window.location.href = '/forgot-password'}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              disabled={isLoading}
            >
              ¿Olvidaste tu contraseña? Recupérala aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
