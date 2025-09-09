import React from 'react';
import { BookOpen, Search, FileText, Lightbulb, Database, HelpCircle } from 'lucide-react';

const KnowledgeBaseModule: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Base de Conocimiento
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Centraliza toda la información, documentación y recursos de tu empresa. 
            Acceso rápido a procedimientos, políticas y soluciones.
          </p>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Database className="w-8 h-8 text-orange-600" />
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
                  <Search className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Búsqueda Avanzada</h3>
                  <p className="text-sm text-gray-600">Encuentra información rápidamente</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Documentación</h3>
                  <p className="text-sm text-gray-600">Manuales y procedimientos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">FAQ y Soluciones</h3>
                  <p className="text-sm text-gray-600">Respuestas a preguntas frecuentes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Soporte Integrado</h3>
                  <p className="text-sm text-gray-600">Ayuda contextual y tutoriales</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseModule;
