import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Share2, 
  ChevronDown, 
  MoreHorizontal, 
  BookOpen, 
  Zap, 
  Brain, 
  Users, 
  MessageSquare, 
  Lightbulb, 
  Code, 
  Database, 
  Globe, 
  Shield, 
  Heart, 
  Smile, 
  Frown, 
  Meh,
  FileText,
  Upload,
  ExternalLink
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'leadership' | 'language' | 'certification';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  score: number;
  maxScore: number;
  description: string;
  evidence: string[];
  lastAssessed: string;
  nextReview: string;
  isCore: boolean;
  isRequired: boolean;
  developmentPlan: string;
  mentor?: string;
  resources: string[];
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId: string;
  status: 'active' | 'expired' | 'pending' | 'suspended';
  category: string;
  description: string;
  verificationUrl?: string;
  attachments: string[];
}

interface EmployeeSkillsData {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  totalSkills: number;
  coreSkills: number;
  technicalSkills: number;
  softSkills: number;
  certifications: number;
  averageLevel: number;
  skills: Skill[];
  certificationList: Certification[];
  summary: {
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
    byStatus: Record<string, number>;
    skillTrend: Array<{ period: string; score: number }>;
  };
  recentAssessments: Skill[];
  topSkills: Skill[];
  developmentAreas: Skill[];
}

interface EmployeeSkillsViewProps {
  employeeId: string;
  onBack: () => void;
}

const EmployeeSkillsView: React.FC<EmployeeSkillsViewProps> = ({ 
  employeeId, 
  onBack 
}) => {
  const [skillsData, setSkillsData] = useState<EmployeeSkillsData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'certifications' | 'development' | 'assessment'>('overview');
  const [showNewSkill, setShowNewSkill] = useState(false);
  const [showNewCertification, setShowNewCertification] = useState(false);

  // Simular datos de habilidades
  useEffect(() => {
    const mockSkillsData: EmployeeSkillsData = {
      employeeId: 'EMP241001',
      employeeName: 'Ana García',
      position: 'Gerente de Marketing',
      department: 'Marketing',
      totalSkills: 24,
      coreSkills: 8,
      technicalSkills: 12,
      softSkills: 8,
      certifications: 6,
      averageLevel: 3.2,
      skills: [
        {
          id: '1',
          name: 'Liderazgo de Equipos',
          category: 'leadership',
          level: 'advanced',
          score: 4.5,
          maxScore: 5,
          description: 'Capacidad para liderar y motivar equipos de trabajo',
          evidence: ['Proyecto exitoso Q3', 'Feedback del equipo', 'Métricas de productividad'],
          lastAssessed: '2024-12-01',
          nextReview: '2025-03-01',
          isCore: true,
          isRequired: true,
          developmentPlan: 'Curso de liderazgo avanzado, mentoría con director',
          mentor: 'Juan Pérez',
          resources: ['Libro: Liderazgo 2.0', 'Curso online: Team Management']
        },
        {
          id: '2',
          name: 'Marketing Digital',
          category: 'technical',
          level: 'expert',
          score: 4.8,
          maxScore: 5,
          description: 'Estrategias y herramientas de marketing digital',
          evidence: ['Campaña exitosa 2024', 'ROI del 300%', 'Certificación Google Ads'],
          lastAssessed: '2024-11-15',
          nextReview: '2025-02-15',
          isCore: true,
          isRequired: true,
          developmentPlan: 'Mantener certificaciones actualizadas',
          resources: ['Google Analytics Academy', 'HubSpot Academy']
        },
        {
          id: '3',
          name: 'Análisis de Datos',
          category: 'technical',
          level: 'intermediate',
          score: 3.2,
          maxScore: 5,
          description: 'Análisis e interpretación de datos para toma de decisiones',
          evidence: ['Dashboard de KPIs', 'Reportes mensuales'],
          lastAssessed: '2024-10-20',
          nextReview: '2025-01-20',
          isCore: false,
          isRequired: false,
          developmentPlan: 'Curso de Excel avanzado, Power BI',
          resources: ['Excel Advanced Course', 'Power BI Fundamentals']
        },
        {
          id: '4',
          name: 'Comunicación Efectiva',
          category: 'soft',
          level: 'advanced',
          score: 4.3,
          maxScore: 5,
          description: 'Habilidades de comunicación verbal y escrita',
          evidence: ['Presentaciones ejecutivas', 'Reuniones de equipo'],
          lastAssessed: '2024-12-10',
          nextReview: '2025-03-10',
          isCore: true,
          isRequired: true,
          developmentPlan: 'Workshop de presentaciones ejecutivas',
          resources: ['Toastmasters', 'Curso de Oratoria']
        },
        {
          id: '5',
          name: 'Inglés',
          category: 'language',
          level: 'advanced',
          score: 4.0,
          maxScore: 5,
          description: 'Dominio del idioma inglés para comunicación internacional',
          evidence: ['TOEFL 95', 'Reuniones con clientes internacionales'],
          lastAssessed: '2024-09-15',
          nextReview: '2025-06-15',
          isCore: false,
          isRequired: false,
          developmentPlan: 'Práctica conversacional, curso de negocios',
          resources: ['Cambly', 'Business English Course']
        }
      ],
      certificationList: [
        {
          id: '1',
          name: 'Google Ads Certified',
          issuer: 'Google',
          issueDate: '2024-01-15',
          expiryDate: '2025-01-15',
          credentialId: 'GADS-2024-001',
          status: 'active',
          category: 'Marketing Digital',
          description: 'Certificación en Google Ads para gestión de campañas publicitarias',
          verificationUrl: 'https://skillshop.withgoogle.com',
          attachments: ['certificate.pdf']
        },
        {
          id: '2',
          name: 'HubSpot Marketing Certification',
          issuer: 'HubSpot',
          issueDate: '2024-03-20',
          expiryDate: '2025-03-20',
          credentialId: 'HUB-2024-002',
          status: 'active',
          category: 'Marketing Digital',
          description: 'Certificación en marketing inbound y automatización',
          verificationUrl: 'https://academy.hubspot.com',
          attachments: ['certificate.pdf']
        },
        {
          id: '3',
          name: 'Project Management Professional (PMP)',
          issuer: 'PMI',
          issueDate: '2023-06-10',
          expiryDate: '2026-06-10',
          credentialId: 'PMP-2023-003',
          status: 'active',
          category: 'Gestión de Proyectos',
          description: 'Certificación profesional en gestión de proyectos',
          verificationUrl: 'https://www.pmi.org',
          attachments: ['certificate.pdf']
        }
      ],
      summary: {
        byCategory: {
          technical: 12,
          soft: 8,
          leadership: 3,
          language: 2,
          certification: 6
        },
        byLevel: {
          beginner: 2,
          intermediate: 8,
          advanced: 10,
          expert: 4
        },
        byStatus: {
          active: 20,
          developing: 4,
          mastered: 4
        },
        skillTrend: [
          { period: '2022', score: 2.8 },
          { period: '2023', score: 3.0 },
          { period: '2024', score: 3.2 }
        ]
      },
      recentAssessments: [],
      topSkills: [],
      developmentAreas: []
    };

    // Calcular habilidades recientes, top skills y áreas de desarrollo
    mockSkillsData.recentAssessments = mockSkillsData.skills
      .sort((a, b) => new Date(b.lastAssessed).getTime() - new Date(a.lastAssessed).getTime())
      .slice(0, 5);
    
    mockSkillsData.topSkills = mockSkillsData.skills
      .filter(skill => skill.score >= 4.0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    mockSkillsData.developmentAreas = mockSkillsData.skills
      .filter(skill => skill.score < 3.5)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);

    setTimeout(() => {
      setSkillsData(mockSkillsData);
      setLoading(false);
    }, 1000);
  }, [employeeId]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Code className="h-4 w-4" />;
      case 'soft': return <Users className="h-4 w-4" />;
      case 'leadership': return <Award className="h-4 w-4" />;
      case 'language': return <Globe className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'technical': return 'Técnicas';
      case 'soft': return 'Blandas';
      case 'leadership': return 'Liderazgo';
      case 'language': return 'Idiomas';
      case 'certification': return 'Certificaciones';
      default: return 'Otro';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-red-100 text-red-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      case 'expert': return 'Experto';
      default: return 'Desconocido';
    }
  };

  const getCertificationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'expired': return 'Expirada';
      case 'pending': return 'Pendiente';
      case 'suspended': return 'Suspendida';
      default: return 'Desconocido';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredSkills = skillsData?.skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || skill.level === filterLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de habilidades...</p>
        </div>
      </div>
    );
  }

  if (!skillsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontró información</h3>
          <p className="text-gray-600">No hay datos de habilidades disponibles para este empleado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronDown className="h-5 w-5 text-gray-600 rotate-90" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Habilidades</h1>
                <p className="text-gray-600">{skillsData.employeeName} - {skillsData.position}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Compartir</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Habilidades</p>
                <p className="text-2xl font-bold text-blue-600">{skillsData.totalSkills}</p>
                <p className="text-xs text-gray-500">registradas</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nivel Promedio</p>
                <p className={`text-2xl font-bold ${getScoreColor(skillsData.averageLevel, 5)}`}>
                  {skillsData.averageLevel.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">de 5.0</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificaciones</p>
                <p className="text-2xl font-bold text-purple-600">{skillsData.certifications}</p>
                <p className="text-xs text-gray-500">activas</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Habilidades Core</p>
                <p className="text-2xl font-bold text-orange-600">{skillsData.coreSkills}</p>
                <p className="text-xs text-gray-500">de {skillsData.totalSkills}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Resumen', icon: BarChart3 },
                { id: 'skills', label: 'Habilidades', icon: Star },
                { id: 'certifications', label: 'Certificaciones', icon: Award },
                { id: 'development', label: 'Desarrollo', icon: Target },
                { id: 'assessment', label: 'Evaluación', icon: CheckCircle }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Estadísticas por categoría */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Habilidades por Categoría</h4>
                  <div className="space-y-3">
                    {Object.entries(skillsData.summary.byCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category)}
                          <span className="text-sm text-gray-600">{getCategoryText(category)}</span>
                        </div>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Habilidades por Nivel</h4>
                  <div className="space-y-3">
                    {Object.entries(skillsData.summary.byLevel).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(level)}`}>
                          {getLevelText(level)}
                        </span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top habilidades */}
            {skillsData.topSkills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Top Habilidades</h4>
                  <div className="space-y-4">
                    {skillsData.topSkills.map((skill) => (
                      <div key={skill.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-green-900">{skill.name}</h5>
                            <p className="text-sm text-green-700 mt-1">{getCategoryText(skill.category)}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(skill.level)}`}>
                                {getLevelText(skill.level)}
                              </span>
                              <span className={`text-xs font-medium ${getScoreColor(skill.score, skill.maxScore)}`}>
                                {skill.score.toFixed(1)}/{skill.maxScore}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-green-100 rounded text-green-600">
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Áreas de desarrollo */}
            {skillsData.developmentAreas.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Áreas de Desarrollo</h4>
                  <div className="space-y-4">
                    {skillsData.developmentAreas.map((skill) => (
                      <div key={skill.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-yellow-900">{skill.name}</h5>
                            <p className="text-sm text-yellow-700 mt-1">{getCategoryText(skill.category)}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(skill.level)}`}>
                                {getLevelText(skill.level)}
                              </span>
                              <span className={`text-xs font-medium ${getScoreColor(skill.score, skill.maxScore)}`}>
                                {skill.score.toFixed(1)}/{skill.maxScore}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-yellow-100 rounded text-yellow-600">
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            {/* Filtros y botón de nueva habilidad */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Habilidades Registradas</h3>
                  <button 
                    onClick={() => setShowNewSkill(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nueva Habilidad</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar habilidades..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas las categorías</option>
                      <option value="technical">Técnicas</option>
                      <option value="soft">Blandas</option>
                      <option value="leadership">Liderazgo</option>
                      <option value="language">Idiomas</option>
                      <option value="certification">Certificaciones</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="pl-4 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los niveles</option>
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                      <option value="expert">Experto</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lista de habilidades */}
              <div className="p-6">
                <div className="space-y-4">
                  {filteredSkills.map((skill) => (
                    <div key={skill.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getCategoryIcon(skill.category)}
                            <h4 className="font-medium text-gray-900">{skill.name}</h4>
                            {skill.isCore && (
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                Core
                              </span>
                            )}
                            {skill.isRequired && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                Requerida
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(skill.level)}`}>
                              {getLevelText(skill.level)}
                            </span>
                            <span className={`font-medium ${getScoreColor(skill.score, skill.maxScore)}`}>
                              {skill.score.toFixed(1)}/{skill.maxScore}
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Última evaluación: {formatDate(skill.lastAssessed)}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Certificaciones</h3>
                  <button 
                    onClick={() => setShowNewCertification(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nueva Certificación</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {skillsData.certificationList.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Award className="h-5 w-5 text-blue-600" />
                            <h4 className="font-medium text-gray-900">{cert.name}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCertificationStatusColor(cert.status)}`}>
                              {getCertificationStatusText(cert.status)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Emisor:</span> {cert.issuer}
                            </div>
                            <div>
                              <span className="font-medium">ID:</span> {cert.credentialId}
                            </div>
                            <div>
                              <span className="font-medium">Emisión:</span> {formatDate(cert.issueDate)}
                            </div>
                            <div>
                              <span className="font-medium">Expiración:</span> {cert.expiryDate ? formatDate(cert.expiryDate) : 'No expira'}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-2">{cert.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {cert.verificationUrl && (
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          )}
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'development' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan de Desarrollo</h3>
                <div className="space-y-4">
                  {skillsData.skills.map((skill) => (
                    <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{skill.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{skill.developmentPlan}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            {skill.mentor && (
                              <span className="text-xs text-gray-500">
                                Mentor: {skill.mentor}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              Próxima revisión: {formatDate(skill.nextReview)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluación de Habilidades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">Auto-evaluación</span>
                    </div>
                    <p className="text-sm text-gray-600">Evaluación personal de habilidades</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Evaluación 360°</span>
                    </div>
                    <p className="text-sm text-gray-600">Evaluación de múltiples fuentes</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Evaluación por Supervisor</span>
                    </div>
                    <p className="text-sm text-gray-600">Evaluación directa del supervisor</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-gray-900">Evaluación por Objetivos</span>
                    </div>
                    <p className="text-sm text-gray-600">Evaluación basada en resultados</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium text-gray-900">Reporte de Competencias</span>
                    </div>
                    <p className="text-sm text-gray-600">Análisis completo de competencias</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-5 w-5 text-pink-600" />
                      <span className="font-medium text-gray-900">Reporte de Desarrollo</span>
                    </div>
                    <p className="text-sm text-gray-600">Plan de desarrollo personalizado</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { EmployeeSkillsView };
export default EmployeeSkillsView;
