// import React from "react"; // TODO: Usar cuando se necesite React específicamente
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = "Cargando...",
}: LoadingScreenProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#1A1B22" }}
    >
      <div className="text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
            <span className="text-white font-bold text-xl">U</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">UTalk</h1>
        </div>
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <p className="text-gray-400 text-lg">{message}</p>
        </div>
      </div>
    </div>
  );
}
