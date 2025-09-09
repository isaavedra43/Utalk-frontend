import React from 'react';
import { Settings, Phone, Users, Clock, Shield, Globe } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

interface AdminPanelProps {
  config: any;
  phoneNumbers: any[];
  ivrMenus: any[];
  loading: boolean;
  onConfigUpdate: (config: any) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  config,
  phoneNumbers,
  ivrMenus,
  loading,
  onConfigUpdate
}) => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administración</h1>
        <p className="text-gray-600 mt-1">Configuración del sistema de llamadas</p>
      </div>

      <Tabs defaultValue="numbers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="numbers">Números</TabsTrigger>
          <TabsTrigger value="ivr">IVR</TabsTrigger>
          <TabsTrigger value="queues">Colas</TabsTrigger>
          <TabsTrigger value="recording">Grabación</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="numbers" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Números de Teléfono</h2>
              <Button>
                <Phone className="w-4 h-4 mr-2" />
                Comprar Número
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">+1 555 0123</p>
                  <p className="text-sm text-gray-600">Local • Asignado a Cola de Ventas</p>
                </div>
                <Badge className="text-green-600 bg-green-100">Activo</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ivr" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Menús IVR</h2>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Crear Menú
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Menú Principal</p>
                  <p className="text-sm text-gray-600">Presiona 1 para Ventas, 2 para Soporte</p>
                </div>
                <Badge className="text-green-600 bg-green-100">Activo</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="queues" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Colas</h2>
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Crear Cola
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Ventas</p>
                  <p className="text-sm text-gray-600">5 agentes • Tiempo máximo: 5 min</p>
                </div>
                <Badge className="text-green-600 bg-green-100">Activa</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="recording" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Políticas de Grabación</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Grabación habilitada</p>
                  <p className="text-sm text-gray-600">Todas las llamadas se graban automáticamente</p>
                </div>
                <Badge className="text-green-600 bg-green-100">Habilitada</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Anuncio de grabación</p>
                  <p className="text-sm text-gray-600">Se reproduce un mensaje al inicio de la llamada</p>
                </div>
                <Badge className="text-green-600 bg-green-100">Habilitado</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Seguridad</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enmascaramiento de PII</p>
                  <p className="text-sm text-gray-600">Datos personales se enmascaran en transcripciones</p>
                </div>
                <Badge className="text-green-600 bg-green-100">Habilitado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Retención de datos</p>
                  <p className="text-sm text-gray-600">Grabaciones se conservan por 90 días</p>
                </div>
                <Badge className="text-blue-600 bg-blue-100">90 días</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

