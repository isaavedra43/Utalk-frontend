import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle, 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useSkills } from '../../../hooks/useSkills';
import { useNotifications } from '../../../contexts/NotificationContext';
import SkillModal from './SkillModal';
import CertificationModal from './CertificationModal';
import DevelopmentPlanModal from './DevelopmentPlanModal';
import SkillEvaluationModal from './SkillEvaluationModal';
import type { Skill, CreateSkillRequest, CreateCertificationRequest, CreateDevelopmentPlanRequest, CreateSkillEvaluationRequest } from '../../../services/skillsService';

interface EmployeeSkillsViewProps {
  employeeId: string;
  employeeName?: string;
  onBack: () => void;
}

const EmployeeSkillsView: React.FC<EmployeeSkillsViewProps> = ({ 
  employeeId, 
  employeeName = 'Empleado',
  onBack 
}: EmployeeSkillsViewProps) => {
  const { showSuccess, showError } = useNotifications();

  // Usar hook personalizado con datos reales (debe estar antes de cualquier early return)
  const {
    skills,
    skillsSummary,
    skillsLoading,
    skillsError,
    certifications,
    certificationsSummary,
    certificationsLoading,
    certificationsError,
    developmentPlans,
    developmentPlansSummary,
    developmentPlansLoading,
    developmentPlansError,
    evaluations,
    evaluationsSummary,
    evaluationsLoading,
    evaluationsError,
    createSkill,
    updateSkill,
    deleteSkill,
    createCertification,
    updateCertification,
    deleteCertification,
    createDevelopmentPlan,
    updateDevelopmentPlan,
    deleteDevelopmentPlan,
    createSkillEvaluation,
    updateSkillEvaluation,
    deleteSkillEvaluation,
    uploadSkillFiles,
    exportSkillsData,
    generateSkillsReport,
    refreshData
  } = useSkills({ employeeId });

  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'certifications' | 'development' | 'assessment'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showNewSkill, setShowNewSkill] = useState(false);
  const [showNewCertification, setShowNewCertification] = useState(false);
  const [showNewDevelopmentPlan, setShowNewDevelopmentPlan] = useState(false);
  const [showNewEvaluation, setShowNewEvaluation] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedCertification, setSelectedCertification] = useState<any>(null);
  const [selectedDevelopmentPlan, setSelectedDevelopmentPlan] = useState<any>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);

  // Debug logging (debe estar antes de cualquier return condicional)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 EmployeeSkillsView - Estado actual:', {
        employeeId,
        skills: skills?.length || 0,
        searchTerm,
        filterCategory,
        filterLevel,
        skillsData: skills
      });
    }
  }, [employeeId, skills, searchTerm, filterCategory, filterLevel]);

  // Validar que employeeId esté presente (después de los hooks)
  if (!employeeId || typeof employeeId !== 'string' || employeeId.trim() === '') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-red-800 mb-1">Error</h3>
          <p className="text-red-600 text-sm">ID de empleado inválido. No se pueden cargar las habilidades.</p>
        </div>
      </div>
    );
  }

  // Handlers para Skills
  const handleCreateSkill = async (skillData: CreateSkillRequest, files: File[]) => {
    try {
      console.log('🚀 Iniciando creación de habilidad...');
      await createSkill(skillData);
      console.log('✅ Habilidad creada, refrescando datos...');
      
      // Forzar refresh de datos después de crear
      await refreshData();
      
      if (files.length > 0) {
        await uploadSkillFiles(files, 'evidence');
      }
      showSuccess('Habilidad creada exitosamente');
      setShowNewSkill(false);
    } catch (error) {
      console.error('❌ Error creando habilidad:', error);
      showError(error instanceof Error ? error.message : 'Error creando habilidad');
    }
  };

  const handleUpdateSkill = async (skillId: string, skillData: Partial<CreateSkillRequest>, files: File[]) => {
    try {
      await updateSkill(skillId, skillData);
      if (files.length > 0) {
        await uploadSkillFiles(files, 'evidence');
      }
      showSuccess('Habilidad actualizada exitosamente');
      setSelectedSkill(null);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error actualizando habilidad');
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta habilidad?')) return;
    
    try {
      await deleteSkill(skillId);
      showSuccess('Habilidad eliminada exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error eliminando habilidad');
    }
  };

  // Handlers para Certificaciones
  const handleCreateCertification = async (certData: CreateCertificationRequest, files: any) => {
    try {
      await createCertification(certData);
      if (files && files.length > 0) {
        console.log('Archivos de certificación:', files);
      }
      showSuccess('Certificación creada exitosamente');
      setShowNewCertification(false);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error creando certificación');
    }
  };

  const handleUpdateCertification = async (certId: string, certData: Partial<CreateCertificationRequest>, files: any) => {
    try {
      await updateCertification(certId, certData);
      if (files && files.length > 0) {
        console.log('Archivos de certificación:', files);
      }
      showSuccess('Certificación actualizada exitosamente');
      setSelectedCertification(null);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error actualizando certificación');
    }
  };

  // Handlers para Planes de Desarrollo
  const handleCreateDevelopmentPlan = async (planData: CreateDevelopmentPlanRequest, files: any) => {
    try {
      await createDevelopmentPlan(planData);
      if (files && files.length > 0) {
        console.log('Archivos de plan de desarrollo:', files);
      }
      showSuccess('Plan de desarrollo creado exitosamente');
      setShowNewDevelopmentPlan(false);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error creando plan de desarrollo');
    }
  };

  const handleUpdateDevelopmentPlan = async (planId: string, planData: Partial<CreateDevelopmentPlanRequest>, files: any) => {
    try {
      await updateDevelopmentPlan(planId, planData);
      if (files && files.length > 0) {
        console.log('Archivos de plan de desarrollo:', files);
      }
      showSuccess('Plan de desarrollo actualizado exitosamente');
      setSelectedDevelopmentPlan(null);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error actualizando plan de desarrollo');
    }
  };

  // Handlers para Evaluaciones
  const handleCreateEvaluation = async (evaluationData: CreateSkillEvaluationRequest, files: any) => {
    try {
      await createSkillEvaluation(evaluationData);
      if (files && files.length > 0) {
        console.log('Archivos de evaluación:', files);
      }
      showSuccess('Evaluación creada exitosamente');
      setShowNewEvaluation(false);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error creando evaluación');
    }
  };

  const handleUpdateEvaluation = async (evaluationId: string, evaluationData: Partial<CreateSkillEvaluationRequest>, files: any) => {
    try {
      await updateSkillEvaluation(evaluationId, evaluationData);
      if (files && files.length > 0) {
        console.log('Archivos de evaluación:', files);
      }
      showSuccess('Evaluación actualizada exitosamente');
      setSelectedEvaluation(null);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error actualizando evaluación');
    }
  };

  // Filtros
  const filteredSkills = (skills || []).filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (skill.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || skill.level === filterLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Loading state
  if (skillsLoading || certificationsLoading || developmentPlansLoading || evaluationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando habilidades...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (skillsError || certificationsError || developmentPlansError || evaluationsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar habilidades</h3>
          <p className="text-gray-600 mb-4">
            {skillsError || certificationsError || developmentPlansError || evaluationsError}
          </p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Habilidades - {employeeName}
                </h1>
                <p className="text-sm text-gray-500">
                  Gestión de habilidades, certificaciones y desarrollo profesional
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshData}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                title="Actualizar datos"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-medium">Actualizar</span>
              </button>
              <button
                onClick={() => exportSkillsData('excel')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Resumen', icon: Award },
              { id: 'skills', name: 'Habilidades', icon: Award },
              { id: 'certifications', name: 'Certificaciones', icon: Award },
              { id: 'development', name: 'Desarrollo', icon: Award },
              { id: 'assessment', name: 'Evaluaciones', icon: CheckCircle }
              ].map((tab) => {
              const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'skills' | 'certifications' | 'development' | 'assessment')}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Habilidades</p>
                    <p className="text-2xl font-bold text-gray-900">{skillsSummary?.totalSkills || 0}</p>
                        </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Certificaciones</p>
                    <p className="text-2xl font-bold text-gray-900">{certificationsSummary?.totalCertifications || 0}</p>
                      </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                          <div>
                    <p className="text-sm font-medium text-gray-500">Planes Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{developmentPlansSummary?.activePlans || 0}</p>
                            </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                        </div>
                      </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Evaluaciones</p>
                    <p className="text-2xl font-bold text-gray-900">{evaluationsSummary?.totalEvaluations || 0}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  </div>
                </div>
              </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                {(skills || []).slice(0, 5).map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Award className="h-4 w-4 text-blue-600" />
                      </div>
                          <div>
                        <p className="font-medium text-gray-900">{skill.name}</p>
                        <p className="text-sm text-gray-500">Nivel: {skill.level}</p>
                            </div>
                          </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{skill.score}/{skill.maxScore || 5}</p>
                      <p className="text-xs text-gray-500">Puntuación</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar habilidades..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                <div className="flex items-center gap-3">
                    <select
                      value={filterCategory}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="all">Todas las categorías</option>
                      <option value="technical">Técnicas</option>
                      <option value="soft">Blandas</option>
                      <option value="leadership">Liderazgo</option>
                    <option value="communication">Comunicación</option>
                    </select>
                    <select
                      value={filterLevel}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterLevel(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="all">Todos los niveles</option>
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                      <option value="expert">Experto</option>
                    </select>
                  <button
                    onClick={() => setShowNewSkill(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Nueva Habilidad</span>
                  </button>
                  </div>
                </div>
              </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSkills.map((skill) => (
                <div key={skill.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Award className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{skill.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{skill.category}</p>
                          </div>
                        </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setSelectedSkill(skill)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      >
                            <Edit className="h-4 w-4" />
                          </button>
                  <button 
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                        <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

                  <p className="text-sm text-gray-600 mb-4">{skill.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Nivel</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">{skill.level}</span>
                            </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Puntuación</span>
                      <span className="text-sm font-medium text-gray-900">{skill.score}/{skill.maxScore || 5}</span>
                            </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(skill.score / (skill.maxScore || 5)) * 100}%` }}
                      ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

            {filteredSkills.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-1">No se encontraron habilidades</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {skills.length === 0
                    ? 'Comienza agregando la primera habilidad'
                    : 'Intenta ajustar los filtros de búsqueda'
                  }
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-xs text-gray-400 mb-4">
                    Debug: Total habilidades cargadas: {skills.length} | Empleado ID: {employeeId}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => setShowNewSkill(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Agregar Habilidad</span>
                  </button>
                  <button
                    onClick={refreshData}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm font-medium">Actualizar</span>
                  </button>
                </div>
              </div>
            )}
            </div>
        )}

        {/* Similar content for other tabs... */}
        {activeTab === 'certifications' && (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Módulo de Certificaciones</h3>
            <p className="text-gray-500">Contenido en desarrollo...</p>
          </div>
        )}

        {activeTab === 'development' && (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Módulo de Desarrollo</h3>
            <p className="text-gray-500">Contenido en desarrollo...</p>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Módulo de Evaluaciones</h3>
            <p className="text-gray-500">Contenido en desarrollo...</p>
          </div>
        )}
                    </div>

      {/* Modals */}
      {showNewSkill && (
        <SkillModal
          isOpen={showNewSkill}
          onClose={() => setShowNewSkill(false)}
          onSubmit={handleCreateSkill}
          employeeId={employeeId}
          employeeName={employeeName}
        />
      )}

      {selectedSkill && (
        <SkillModal
          isOpen={!!selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onSubmit={(data: any, files: any) => handleUpdateSkill(selectedSkill.id, data, files)}
          employeeId={employeeId}
          employeeName={employeeName}
          skill={selectedSkill}
          mode="edit"
        />
      )}

      {showNewCertification && (
        <CertificationModal
          isOpen={showNewCertification}
          onClose={() => setShowNewCertification(false)}
          onSubmit={handleCreateCertification}
          employeeId={employeeId}
          employeeName={employeeName}
        />
      )}

      {selectedCertification && (
        <CertificationModal
          isOpen={!!selectedCertification}
          onClose={() => setSelectedCertification(null)}
          onSubmit={(data: any, files: any) => handleUpdateCertification(selectedCertification.id, data, files)}
          employeeId={employeeId}
          employeeName={employeeName}
          certification={selectedCertification}
          mode="edit"
        />
      )}

      {showNewDevelopmentPlan && (
        <DevelopmentPlanModal
          isOpen={showNewDevelopmentPlan}
          onClose={() => setShowNewDevelopmentPlan(false)}
          onSubmit={handleCreateDevelopmentPlan}
          employeeId={employeeId}
          employeeName={employeeName}
        />
      )}

      {selectedDevelopmentPlan && (
        <DevelopmentPlanModal
          isOpen={!!selectedDevelopmentPlan}
          onClose={() => setSelectedDevelopmentPlan(null)}
          onSubmit={(data: any, files: any) => handleUpdateDevelopmentPlan(selectedDevelopmentPlan.id, data, files)}
          employeeId={employeeId}
          employeeName={employeeName}
          developmentPlan={selectedDevelopmentPlan}
          mode="edit"
        />
      )}

      {showNewEvaluation && (
        <SkillEvaluationModal
          isOpen={showNewEvaluation}
          onClose={() => setShowNewEvaluation(false)}
          onSubmit={handleCreateEvaluation}
          employeeId={employeeId}
          employeeName={employeeName}
        />
      )}

      {selectedEvaluation && (
        <SkillEvaluationModal
          isOpen={!!selectedEvaluation}
          onClose={() => setSelectedEvaluation(null)}
          onSubmit={(data: any, files: any) => handleUpdateEvaluation(selectedEvaluation.id, data, files)}
          employeeId={employeeId}
          employeeName={employeeName}
          evaluation={selectedEvaluation}
          mode="edit"
        />
      )}
    </div>
  );
};

export { EmployeeSkillsView };
export default EmployeeSkillsView;
