import React from 'react';
import { Eye, BarChart3, Target, Users, TrendingUp, AlertTriangle } from 'lucide-react';

const SupervisionModule: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Eye className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Supervisión
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Monitorea el rendimiento de tu equipo, métricas de productividad y calidad del servicio. 
            Toma decisiones basadas en datos en tiempo real.
          </p>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Próximamente
            </h2>
            
            <p className="text-gray-600 mb-6">
              Estamos desarrollando esta funcionalidad. Pronto podrás disfrutar de:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dashboard de Métricas</h3>
                  <p className="text-sm text-gray-600">KPIs y rendimiento en tiempo real</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Monitoreo de Agentes</h3>
                  <p className="text-sm text-gray-600">Estado y productividad del equipo</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Objetivos y Metas</h3>
                  <p className="text-sm text-gray-600">Seguimiento de cumplimiento</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Alertas y Notificaciones</h3>
                  <p className="text-sm text-gray-600">Avisos de incumplimiento o problemas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisionModule;
