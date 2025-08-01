// Datos mock para el módulo Knowledge
import { 
  KnowledgeDocument, 
  KnowledgeFAQ, 
  KnowledgeCourse, 
  CourseLesson,
  KnowledgeStats 
} from '../types'

export const mockKnowledgeDocuments: KnowledgeDocument[] = [
  {
    id: '1',
    title: 'Guía de Configuración del Sistema',
    content: 'Esta guía te ayudará a configurar el sistema UTalk paso a paso...',
    category: 'Configuración',
    tags: ['configuración', 'sistema', 'inicio'],
    author: 'Equipo UTalk',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    views: 1250,
    helpful: 89,
    notHelpful: 3
  },
  {
    id: '2',
    title: 'Mejores Prácticas de CRM',
    content: 'Descubre las mejores prácticas para gestionar tu CRM de manera eficiente...',
    category: 'CRM',
    tags: ['crm', 'prácticas', 'gestión'],
    author: 'María García',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    views: 890,
    helpful: 67,
    notHelpful: 2
  },
  {
    id: '3',
    title: 'Integración con APIs Externas',
    content: 'Aprende cómo integrar UTalk con APIs externas para expandir funcionalidades...',
    category: 'Desarrollo',
    tags: ['api', 'integración', 'desarrollo'],
    author: 'Carlos López',
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-19T10:15:00Z',
    views: 567,
    helpful: 45,
    notHelpful: 1
  }
]

export const mockKnowledgeFAQs: KnowledgeFAQ[] = [
  {
    id: '1',
    question: '¿Cómo puedo restablecer mi contraseña?',
    answer: 'Para restablecer tu contraseña, ve a la página de login y haz clic en "¿Olvidaste tu contraseña?"...',
    category: 'Cuenta',
    tags: ['contraseña', 'cuenta', 'seguridad'],
    helpful: 156,
    notHelpful: 8,
    createdAt: '2024-01-05T08:00:00Z'
  },
  {
    id: '2',
    question: '¿Cómo exportar datos del CRM?',
    answer: 'Para exportar datos del CRM, ve al módulo CRM y haz clic en el botón "Exportar" en la barra de herramientas...',
    category: 'CRM',
    tags: ['exportar', 'crm', 'datos'],
    helpful: 234,
    notHelpful: 12,
    createdAt: '2024-01-08T14:20:00Z'
  },
  {
    id: '3',
    question: '¿Qué navegadores son compatibles?',
    answer: 'UTalk es compatible con Chrome 90+, Firefox 88+, Safari 14+ y Edge 90+...',
    category: 'Sistema',
    tags: ['navegador', 'compatibilidad', 'sistema'],
    helpful: 89,
    notHelpful: 5,
    createdAt: '2024-01-03T10:15:00Z'
  }
]

export const mockCourseLessons: CourseLesson[] = [
  {
    id: '1',
    title: 'Introducción al Sistema',
    content: 'En esta lección aprenderás los conceptos básicos del sistema UTalk...',
    duration: 15,
    order: 1
  },
  {
    id: '2',
    title: 'Configuración Inicial',
    content: 'Aprende a configurar tu cuenta y personalizar el sistema...',
    duration: 20,
    order: 2
  },
  {
    id: '3',
    title: 'Gestión de Contactos',
    content: 'Descubre cómo gestionar eficientemente tus contactos en el CRM...',
    duration: 25,
    order: 3
  }
]

export const mockKnowledgeCourses: KnowledgeCourse[] = [
  {
    id: '1',
    title: 'Curso Básico de UTalk',
    description: 'Aprende los fundamentos del sistema UTalk en este curso completo',
    lessons: mockCourseLessons,
    duration: 60,
    difficulty: 'beginner',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'CRM Avanzado',
    description: 'Domina las funcionalidades avanzadas del CRM',
    lessons: [],
    duration: 90,
    difficulty: 'intermediate',
    createdAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '3',
    title: 'Automatización de Procesos',
    description: 'Aprende a automatizar tareas repetitivas en UTalk',
    lessons: [],
    duration: 120,
    difficulty: 'advanced',
    createdAt: '2024-01-10T00:00:00Z'
  }
]

export const mockKnowledgeStats: KnowledgeStats = {
  totalDocuments: 45,
  totalFAQs: 23,
  totalCourses: 8,
  totalViews: 15678,
  averageRating: 4.6,
  searchQueries: 2340
} 