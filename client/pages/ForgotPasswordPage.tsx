import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("El email es requerido");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al enviar el email");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al enviar el email de recuperación");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email && validateEmail(email) && !isLoading;

  if (isSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#1A1B22" }}
      >
        <div className="w-full max-w-md">
          <div
            className="rounded-lg p-8 shadow-2xl border border-gray-700 text-center"
            style={{ backgroundColor: "#2A2D3A" }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Email enviado
            </h1>
            <p className="text-gray-400 mb-6">
              Hemos enviado las instrucciones de recuperación a{" "}
              <span className="text-white font-medium">{email}</span>
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Revisa tu bandeja de entrada y sigue las instrucciones para
              restablecer tu contraseña.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Volver al inicio de sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate("/login")}
              className="text-gray-400 hover:text-white transition-colors mr-3"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Recuperar contraseña
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Ingresa tu email para recibir instrucciones
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className={cn(
                  "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500",
                  error &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500",
                )}
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={!isFormValid}
              className={cn(
                "w-full h-11 font-medium transition-all duration-200",
                isFormValid
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar instrucciones"
              )}
            </Button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/login")}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
