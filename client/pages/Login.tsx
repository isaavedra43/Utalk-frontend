/**
 * Login Page Component
 * Handles user authentication with form validation and error handling
 */

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/lib/auth.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, UserPlus, LogIn } from "lucide-react";
import { config } from '@/lib/config';
import { cn } from '@/lib/utils';

interface LoginFormData {
  identifier: string;
  password: string;
}

interface LoginFormErrors {
  identifier?: string;
  password?: string;
  general?: string;
}

const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Clear errors when form data changes
  if (error) {
    clearError();
  }
  setFormErrors({});

  // Validate form data
  const validateForm = (): boolean => {
    const errors: LoginFormErrors = {};

    if (!formData.identifier.trim()) {
      errors.identifier = 'El email o nombre de usuario es requerido';
    } else if (formData.identifier.length < 3) {
      errors.identifier = 'El email o nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(formData);
      // Redirect will happen automatically via useEffect
    } catch (err) {
      // Error is handled by auth context
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle key press (Enter to submit)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  // Show loading state during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido a UNIK AI
          </h1>
          <p className="text-gray-400">
            Inicia sesión para acceder a tu panel de control
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-400">
              Ingresa tu email o nombre de usuario y contraseña
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error Alert */}
              {error && (
                <Alert className="bg-red-900/20 border-red-800 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Identifier Field */}
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-gray-300">
                  Email o Nombre de Usuario
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  value={formData.identifier}
                  onChange={(e) => handleInputChange('identifier', e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="admin@empresa.com o admin"
                  className={cn(
                    "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500",
                    formErrors.identifier && "border-red-500 focus:border-red-500"
                  )}
                  disabled={isSubmitting}
                />
                {formErrors.identifier && (
                  <p className="text-sm text-red-400">{formErrors.identifier}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ingresa tu contraseña"
                    className={cn(
                      "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 pr-10",
                      formErrors.password && "border-red-500 focus:border-red-500"
                    )}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-red-400">{formErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Sistema de Comunicación Omnicanal
          </p>
          <p className="mt-1">
            ¿Problemas para acceder?{' '}
            <a href="mailto:soporte@empresa.com" className="text-blue-400 hover:text-blue-300">
              Contacta al soporte
            </a>
          </p>
        </div>

        {/* Demo Credentials (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-yellow-900/20 border-yellow-800">
            <CardContent className="pt-6">
              <div className="text-center text-yellow-300">
                <p className="text-sm font-medium mb-2">Credenciales de Demo:</p>
                <div className="space-y-1 text-xs">
                  <p><strong>Usuario:</strong> admin</p>
                  <p><strong>Contraseña:</strong> Admin123!@#</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 border-yellow-600 text-yellow-300 hover:bg-yellow-900/30"
                  onClick={() => {
                    setFormData({
                      identifier: 'admin',
                      password: 'Admin123!@#',
                    });
                  }}
                  disabled={isSubmitting}
                >
                  Usar credenciales de demo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login; 