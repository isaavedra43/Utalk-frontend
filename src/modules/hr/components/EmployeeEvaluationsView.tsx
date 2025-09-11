import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Activity, 
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
  Send, 
  Save, 
  Archive, 
  Flag, 
  Zap, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  FileText, 
  Users, 
  Briefcase, 
  BookOpen, 
  Lightbulb, 
  Trophy, 
  Medal, 
  Crown, 
  Gem, 
  Heart, 
  Smile, 
  Frown, 
  Meh
} from 'lucide-react';

interface Evaluation {
  id: string;
  type: 'performance' | 'objectives' | 'competencies' | '360_feedback' | 'probation' | 'annual' | 'quarterly' | 'monthly';
  period: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'archived';
  evaluator: string;
  evaluatorRole: string;
  employee: string;
  overallScore: number;
  maxScore: number;
  categories: {
    name: string;
    score: number;
    maxScore: number;
    weight: number;
    description: string;
  }[];
  objectives: {
    id: string;
    title: string;
    description: string;
    target: string;
    actual: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'exceeded' | 'not_met';
    weight: number;
    score: number;
    maxScore: number;
    dueDate: string;
    completionDate?: string;
  }[];
  competencies: {
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    score: number;
    maxScore: number;
    description: string;
    evidence: string[];
  }[];
  feedback: {
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
    comments: string;
  };
  developmentPlan: {
    goals: string[];
    training: string[];
    mentoring: string[];
    timeline: string;
  };
  nextReviewDate: string;
  isConfidential: boolean;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

interface EmployeeEvaluationsData {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  totalEvaluations: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  averageScore: number;
  evaluations: Evaluation[];
  summary: {
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byPeriod: Record<string, number>;
    scoreTrend: Array<{ period: string; score: number }>;
  };
  recentEvaluations: Evaluation[];
  topPerformances: Evaluation[];
  objectives: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  competencies: {
    total: number;
    assessed: number;
    developing: number;
    mastered: number;
  };
}

interface EmployeeEvaluationsViewProps {
  employeeId: string;
  onBack: () => void;
}

const EmployeeEvaluationsView: React.FC<EmployeeEvaluationsViewProps> = ({ 
  employeeId, 
  onBack 
}) => {
  const [evaluationsData, setEvaluationsData] = useState<EmployeeEvaluationsData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'evaluations' | 'objectives' | 'competencies' | 'reports'>('overview');
  const [showNewEvaluation, setShowNewEvaluation] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  // Simular datos de evaluaciones
  useEffect(() => {
    const mockEvaluationsData: EmployeeEvaluationsData = {
      employeeId: 'EMP241001',
      employeeName: 'Ana García',
      position: 'Gerente de Marketing',
      department: 'Marketing',
      totalEvaluations: 12,
      completedEvaluations: 10,
      pendingEvaluations: 2,
      averageScore: 4.2,
      evaluations: [
        {
          id: '1',
          type: 'annual',
          period: '2024',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          status: 'completed',
          evaluator: 'Juan Pérez',
          evaluatorRole: 'Director de Marketing',
          employee: 'Ana García',
          overallScore: 4.3,
          maxScore: 5,
          categories: [
            {
              name: 'Liderazgo',
              score: 4.5,
              maxScore: 5,
              weight: 25,
              description: 'Capacidad de liderar equipos y tomar decisiones'
            },
            {
              name: 'Comunicación',
              score: 4.2,
              maxScore: 5,
              weight: 20,
              description: 'Habilidades de comunicación verbal y escrita'
            },
            {
              name: 'Innovación',
              score: 4.0,
              maxScore: 5,
              weight: 20,
              description: 'Creatividad e innovación en proyectos'
            },
            {
              name: 'Resultados',
              score: 4.5,
              maxScore: 5,
              weight: 35,
              description: 'Cumplimiento de objetivos y resultados'
            }
          ],
          objectives: [
            {
              id: '1',
              title: 'Aumentar ventas en 15%',
              description: 'Incrementar las ventas del departamento en un 15% respecto al año anterior',
              target: '15%',
              actual: '18%',
              status: 'exceeded',
              weight: 30,
              score: 5,
              maxScore: 5,
              dueDate: '2024-12-31',
              completionDate: '2024-12-15'
            },
            {
              id: '2',
              title: 'Implementar nueva estrategia digital',
              description: 'Desarrollar e implementar una nueva estrategia de marketing digital',
              target: '100%',
              actual: '100%',
              status: 'completed',
              weight: 25,
              score: 5,
              maxScore: 5,
              dueDate: '2024-09-30',
              completionDate: '2024-09-25'
            },
            {
              id: '3',
              title: 'Capacitar al equipo',
              description: 'Capacitar al equipo en nuevas herramientas de marketing',
              target: '100%',
              actual: '80%',
              status: 'in_progress',
              weight: 20,
              score: 4,
              maxScore: 5,
              dueDate: '2024-12-31'
            }
          ],
          competencies: [
            {
              id: '1',
              name: 'Liderazgo de Equipos',
              level: 'advanced',
              score: 4.5,
              maxScore: 5,
              description: 'Capacidad para liderar y motivar equipos',
              evidence: ['Proyecto exitoso Q3', 'Feedback del equipo']
            },
            {
              id: '2',
              name: 'Análisis de Datos',
              level: 'intermediate',
              score: 3.5,
              maxScore: 5,
              description: 'Habilidad para analizar datos y tomar decisiones',
              evidence: ['Reportes mensuales', 'Dashboard de KPIs']
            },
            {
              id: '3',
              name: 'Comunicación Efectiva',
              level: 'advanced',
              score: 4.2,
              maxScore: 5,
              description: 'Comunicación clara y efectiva',
              evidence: ['Presentaciones ejecutivas', 'Reuniones de equipo']
            }
          ],
          feedback: {
            strengths: [
              'Excelente liderazgo y motivación del equipo',
              'Creatividad en estrategias de marketing',
              'Cumplimiento consistente de objetivos'
            ],
            areasForImprovement: [
              'Mejorar habilidades de análisis de datos',
              'Desarrollar más experiencia en marketing digital'
            ],
            recommendations: [
              'Tomar curso de análisis de datos',
              'Participar en conferencias de marketing digital'
            ],
            comments: 'Ana ha demostrado un excelente desempeño durante el año, superando las expectativas en la mayoría de los objetivos. Su liderazgo y creatividad son destacables.'
          },
          developmentPlan: {
            goals: [
              'Mejorar habilidades de análisis de datos',
              'Desarrollar expertise en marketing digital',
              'Liderar proyecto de transformación digital'
            ],
            training: [
              'Curso de Excel avanzado',
              'Certificación en Google Analytics',
              'Workshop de marketing digital'
            ],
            mentoring: [
              'Mentoría con Director de Analytics',
              'Sesiones con consultor externo'
            ],
            timeline: '6 meses'
          },
          nextReviewDate: '2025-01-15',
          isConfidential: false,
          attachments: ['evaluacion_2024.pdf', 'objetivos_2024.pdf'],
          createdAt: '2024-01-15',
          updatedAt: '2024-12-20'
        },
        {
          id: '2',
          type: 'quarterly',
          period: 'Q4 2024',
          startDate: '2024-10-01',
          endDate: '2024-12-31',
          status: 'in_progress',
          evaluator: 'Juan Pérez',
          evaluatorRole: 'Director de Marketing',
          employee: 'Ana García',
          overallScore: 0,
          maxScore: 5,
          categories: [],
          objectives: [],
          competencies: [],
          feedback: {
            strengths: [],
            areasForImprovement: [],
            recommendations: [],
            comments: ''
          },
          developmentPlan: {
            goals: [],
            training: [],
            mentoring: [],
            timeline: ''
          },
          nextReviewDate: '2025-01-15',
          isConfidential: false,
          attachments: [],
          createdAt: '2024-10-01',
          updatedAt: '2024-10-01'
        }
      ],
      summary: {
        byType: {
          annual: 3,
          quarterly: 4,
          monthly: 3,
          performance: 2
        },
        byStatus: {
          completed: 10,
          in_progress: 2,
          draft: 0,
          approved: 8,
          rejected: 0,
          archived: 2
        },
        byPeriod: {
          '2024': 4,
          '2023': 4,
          '2022': 4
        },
        scoreTrend: [
          { period: '2022', score: 3.8 },
          { period: '2023', score: 4.0 },
          { period: '2024', score: 4.2 }
        ]
      },
      recentEvaluations: [],
      topPerformances: [],
      objectives: {
        total: 15,
        completed: 12,
        inProgress: 2,
        overdue: 1
      },
      competencies: {
        total: 12,
        assessed: 10,
        developing: 2,
        mastered: 8
      }
    };

    // Calcular evaluaciones recientes y mejores desempeños
    mockEvaluationsData.recentEvaluations = mockEvaluationsData.evaluations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    mockEvaluationsData.topPerformances = mockEvaluationsData.evaluations
      .filter(evaluation => evaluation.overallScore >= 4.0)
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 3);

    setTimeout(() => {
      setEvaluationsData(mockEvaluationsData);
      setLoading(false);
    }, 1000);
  }, [employeeId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <BarChart3 className="h-4 w-4" />;
      case 'objectives': return <Target className="h-4 w-4" />;
      case 'competencies': return <Star className="h-4 w-4" />;
      case '360_feedback': return <Users className="h-4 w-4" />;
      case 'probation': return <Clock className="h-4 w-4" />;
      case 'annual': return <Award className="h-4 w-4" />;
      case 'quarterly': return <Calendar className="h-4 w-4" />;
      case 'monthly': return <Activity className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'performance': return 'Rendimiento';
      case 'objectives': return 'Objetivos';
      case 'competencies': return 'Competencias';
      case '360_feedback': return '360° Feedback';
      case 'probation': return 'Período de Prueba';
      case 'annual': return 'Anual';
      case 'quarterly': return 'Trimestral';
      case 'monthly': return 'Mensual';
      default: return 'Otro';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'archived': return 'Archivada';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Square className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'approved': return <Award className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'archived': return <Archive className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getObjectiveStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'exceeded': return 'bg-purple-100 text-purple-800';
      case 'not_met': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getObjectiveStatusText = (status: string) => {
    switch (status) {
      case 'not_started': return 'No Iniciado';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'exceeded': return 'Superado';
      case 'not_met': return 'No Cumplido';
      default: return 'Desconocido';
    }
  };

  const getCompetencyLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-red-100 text-red-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompetencyLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      case 'expert': return 'Experto';
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

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredEvaluations = evaluationsData?.evaluations.filter(evaluation => {
    const matchesSearch = evaluation.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || evaluation.type === filterType;
    const matchesStatus = filterStatus === 'all' || evaluation.status === filterStatus;
    const matchesPeriod = filterPeriod === 'all' || evaluation.period.includes(filterPeriod);
    return matchesSearch && matchesType && matchesStatus && matchesPeriod;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de evaluaciones...</p>
        </div>
      </div>
    );
  }

  if (!evaluationsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontró información</h3>
          <p className="text-gray-600">No hay datos de evaluaciones disponibles para este empleado.</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Evaluaciones</h1>
                <p className="text-gray-600">{evaluationsData.employeeName} - {evaluationsData.position}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Evaluaciones</p>
                <p className="text-2xl font-bold text-blue-600">{evaluationsData.totalEvaluations}</p>
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
                <p className="text-sm font-medium text-gray-600">Puntuación Promedio</p>
                <p className={`text-2xl font-bold ${getScoreColor(evaluationsData.averageScore, 5)}`}>
                  {evaluationsData.averageScore.toFixed(1)}
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
                <p className="text-sm font-medium text-gray-600">Objetivos Completados</p>
                <p className="text-2xl font-bold text-purple-600">{evaluationsData.objectives.completed}</p>
                <p className="text-xs text-gray-500">de {evaluationsData.objectives.total}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Competencias Dominadas</p>
                <p className="text-2xl font-bold text-orange-600">{evaluationsData.competencies.mastered}</p>
                <p className="text-xs text-gray-500">de {evaluationsData.competencies.total}</p>
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
                { id: 'evaluations', label: 'Evaluaciones', icon: Star },
                { id: 'objectives', label: 'Objetivos', icon: Target },
                { id: 'competencies', label: 'Competencias', icon: Award },
                { id: 'reports', label: 'Reportes', icon: FileText }
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
            {/* Estadísticas por tipo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Evaluaciones por Tipo</h4>
                  <div className="space-y-3">
                    {Object.entries(evaluationsData.summary.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(type)}
                          <span className="text-sm text-gray-600">{getTypeText(type)}</span>
                        </div>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Evaluaciones por Estado</h4>
                  <div className="space-y-3">
                    {Object.entries(evaluationsData.summary.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mejores desempeños */}
            {evaluationsData.topPerformances.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Mejores Desempeños</h4>
                  <div className="space-y-4">
                    {evaluationsData.topPerformances.map((evaluation) => (
                      <div key={evaluation.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-green-900">{evaluation.period}</h5>
                            <p className="text-sm text-green-700 mt-1">{getTypeText(evaluation.type)}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-green-600">
                                Puntuación: {evaluation.overallScore.toFixed(1)}/5.0
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(evaluation.status)}`}>
                                {getStatusText(evaluation.status)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-green-100 rounded text-green-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 hover:bg-green-100 rounded text-green-600">
                              <Download className="h-4 w-4" />
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

        {activeTab === 'evaluations' && (
          <div className="space-y-6">
            {/* Filtros y botón de nueva evaluación */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Evaluaciones Registradas</h3>
                  <button 
                    onClick={() => setShowNewEvaluation(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nueva Evaluación</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar evaluaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los tipos</option>
                      <option value="annual">Anual</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="monthly">Mensual</option>
                      <option value="performance">Rendimiento</option>
                      <option value="objectives">Objetivos</option>
                      <option value="competencies">Competencias</option>
                      <option value="360_feedback">360° Feedback</option>
                      <option value="probation">Período de Prueba</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-4 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="draft">Borrador</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="completed">Completada</option>
                      <option value="approved">Aprobada</option>
                      <option value="rejected">Rechazada</option>
                      <option value="archived">Archivada</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value)}
                      className="pl-4 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los períodos</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lista de evaluaciones */}
              <div className="p-6">
                <div className="space-y-4">
                  {filteredEvaluations.map((evaluation) => (
                    <div key={evaluation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(evaluation.type)}
                            <h4 className="font-medium text-gray-900">{evaluation.period}</h4>
                            <span className="text-sm text-gray-600">({getTypeText(evaluation.type)})</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(evaluation.status)}`}>
                              {getStatusText(evaluation.status)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>Evaluador: {evaluation.evaluator}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(evaluation.startDate)} - {formatDate(evaluation.endDate)}</span>
                            </span>
                            {evaluation.overallScore > 0 && (
                              <span className={`font-medium ${getScoreColor(evaluation.overallScore, evaluation.maxScore)}`}>
                                Puntuación: {evaluation.overallScore.toFixed(1)}/{evaluation.maxScore}
                              </span>
                            )}
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
                            <Download className="h-4 w-4" />
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

        {activeTab === 'objectives' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Objetivos y Metas</h3>
                <div className="space-y-4">
                  {evaluationsData.evaluations
                    .flatMap(evaluation => evaluation.objectives)
                    .map((objective) => (
                      <div key={objective.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{objective.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{objective.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">
                                Meta: {objective.target} | Actual: {objective.actual}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getObjectiveStatusColor(objective.status)}`}>
                                {getObjectiveStatusText(objective.status)}
                              </span>
                              <span className="text-xs text-gray-500">
                                Vence: {formatDateShort(objective.dueDate)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className={`font-medium ${getScoreColor(objective.score, objective.maxScore)}`}>
                              {objective.score}/{objective.maxScore}
                            </span>
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

        {activeTab === 'competencies' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Competencias y Habilidades</h3>
                <div className="space-y-4">
                  {evaluationsData.evaluations
                    .flatMap(evaluation => evaluation.competencies)
                    .map((competency) => (
                      <div key={competency.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{competency.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{competency.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCompetencyLevelColor(competency.level)}`}>
                                {getCompetencyLevelText(competency.level)}
                              </span>
                              <span className={`font-medium ${getScoreColor(competency.score, competency.maxScore)}`}>
                                {competency.score}/{competency.maxScore}
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

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generar Reportes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Reporte de Rendimiento</span>
                    </div>
                    <p className="text-sm text-gray-600">Análisis completo de rendimiento</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">Reporte de Objetivos</span>
                    </div>
                    <p className="text-sm text-gray-600">Seguimiento de objetivos y metas</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <Star className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Reporte de Competencias</span>
                    </div>
                    <p className="text-sm text-gray-600">Evaluación de competencias</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-gray-900">Reporte de Tendencias</span>
                    </div>
                    <p className="text-sm text-gray-600">Análisis de tendencias de rendimiento</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <Users className="h-5 w-5 text-pink-600" />
                      <span className="font-medium text-gray-900">360° Feedback</span>
                    </div>
                    <p className="text-sm text-gray-600">Evaluación de 360 grados</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium text-gray-900">Reporte Consolidado</span>
                    </div>
                    <p className="text-sm text-gray-600">Reporte completo de evaluaciones</p>
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

export { EmployeeEvaluationsView };
export default EmployeeEvaluationsView;
