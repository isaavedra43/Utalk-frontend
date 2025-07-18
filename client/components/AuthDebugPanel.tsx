import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AuthDebugPanel() {
  const { user, loading, isAuthenticated, token } = useAuth();
  
  const localStorageToken = localStorage.getItem('authToken');
  
  const checkAuthStatus = () => {
    console.group('🔍 [AUTH DEBUG PANEL] Estado actual:');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('loading:', loading);
    console.log('user:', user);
    console.log('token en contexto:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
    console.log('token en localStorage:', localStorageToken ? `${localStorageToken.substring(0, 20)}...` : 'NO HAY TOKEN');
    console.log('Tokens coinciden:', token === localStorageToken);
    console.groupEnd();
  };

  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    console.log('🔍 [AUTH DEBUG PANEL] Token eliminado de localStorage');
    window.location.reload();
  };

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <Card className="mb-4 border-yellow-500 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800">🔍 Panel de Debug - Autenticación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Estado:</strong>
            <Badge variant={isAuthenticated ? "default" : "destructive"} className="ml-2">
              {isAuthenticated ? "Autenticado" : "No autenticado"}
            </Badge>
          </div>
          <div>
            <strong>Loading:</strong>
            <Badge variant={loading ? "default" : "secondary"} className="ml-2">
              {loading ? "Cargando" : "Listo"}
            </Badge>
          </div>
          <div>
            <strong>Usuario:</strong>
            <span className="ml-2">{user?.email || "No hay usuario"}</span>
          </div>
          <div>
            <strong>Token en contexto:</strong>
            <span className="ml-2">{token ? "✅ Presente" : "❌ Ausente"}</span>
          </div>
          <div>
            <strong>Token en localStorage:</strong>
            <span className="ml-2">{localStorageToken ? "✅ Presente" : "❌ Ausente"}</span>
          </div>
          <div>
            <strong>Tokens coinciden:</strong>
            <span className="ml-2">{token === localStorageToken ? "✅ Sí" : "❌ No"}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={checkAuthStatus} variant="outline" size="sm">
            Verificar Estado
          </Button>
          <Button onClick={clearAuthData} variant="destructive" size="sm">
            Limpiar Token
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 