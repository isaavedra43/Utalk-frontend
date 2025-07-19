// 🧪 DATOS MOCK - Centro de Conocimiento
// Datos de prueba realistas para desarrollo y testing

import type { 
  KnowledgeDocument, 
  KnowledgeFAQ, 
  KnowledgeCourse, 
  KnowledgeCategory,
  KnowledgeStats,
  KnowledgeActivity,
  
  
} from '../types'

/**
 * 🎯 CATEGORÍAS MOCK
 */
export const mockCategories: KnowledgeCategory[] = [
  {
    id: 'cat_001',
    name: 'Productos y Servicios',
    description: 'Información sobre nuestros productos y servicios',
    icon: '📦',
    color: '#3B82F6',
    path: 'productos',
    documentCount: 45,
    isExpanded: true,
    order: 1
  },
  {
    id: 'cat_002',
    name: 'Configuración Técnica',
    description: 'Manuales técnicos y configuraciones',
    icon: '⚙️',
    color: '#10B981',
    path: 'configuracion',
    documentCount: 32,
    isExpanded: false,
    order: 2
  },
  {
    id: 'cat_003',
    name: 'Políticas y Procedimientos',
    description: 'Políticas internas y procedimientos operativos',
    icon: '📋',
    color: '#F59E0B',
    path: 'politicas',
    documentCount: 28,
    isExpanded: false,
    order: 3
  },
  {
    id: 'cat_004',
    name: 'Capacitación y Formación',
    description: 'Materiales de capacitación y cursos',
    icon: '🎓',
    color: '#8B5CF6',
    path: 'capacitacion',
    documentCount: 67,
    isExpanded: false,
    order: 4
  },
  {
    id: 'cat_005',
    name: 'Plantillas y Recursos',
    description: 'Plantillas reutilizables y recursos compartidos',
    icon: '📄',
    color: '#EF4444',
    path: 'plantillas',
    documentCount: 23,
    isExpanded: false,
    order: 5
  },
  {
    id: 'cat_006',
    name: 'FAQ y Soporte',
    description: 'Preguntas frecuentes y documentos de soporte',
    icon: '❓',
    color: '#06B6D4',
    path: 'soporte',
    documentCount: 41,
    isExpanded: false,
    order: 6
  }
]

/**
 * 🎯 DOCUMENTOS MOCK
 */
export const mockDocuments: KnowledgeDocument[] = [
  {
    id: 'doc_001',
    title: 'Manual de Configuración de UTalk',
    type: 'pdf',
    status: 'published',
    description: 'Guía completa para configurar y personalizar la plataforma UTalk para tu empresa.',
    fileUrl: 'https://example.com/docs/utalk-manual.pdf',
    fileName: 'utalk-manual-v2.3.pdf',
    fileSize: 2048000, // 2MB
    mimeType: 'application/pdf',
    category: mockCategories[1], // Configuración Técnica
    tags: ['configuración', 'manual', 'setup', 'administración'],
    createdBy: 'admin_001',
    updatedBy: 'admin_001',
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-11-20T14:30:00Z'),
    views: 1247,
    downloads: 356,
    favorites: 89,
    isFavorite: true,
    visibility: 'public',
    version: '2.3',
    metadata: {
      language: 'es',
      difficulty: 'intermediate',
      estimatedReadTime: 45,
      keywords: ['utalk', 'configuración', 'plataforma', 'setup'],
      thumbnail: 'https://example.com/thumbnails/utalk-manual.jpg'
    }
  },
  
  {
    id: 'doc_002',
    title: 'Video Tutorial: Primeros Pasos en UTalk',
    type: 'video',
    status: 'published',
    description: 'Video tutorial paso a paso para nuevos usuarios de la plataforma UTalk.',
    fileUrl: 'https://example.com/videos/utalk-tutorial.mp4',
    fileName: 'utalk-primeros-pasos.mp4',
    fileSize: 125829120, // 120MB
    mimeType: 'video/mp4',
    category: mockCategories[3], // Capacitación
    tags: ['video', 'tutorial', 'principiantes', 'introducción'],
    createdBy: 'trainer_001',
    updatedBy: 'trainer_001',
    createdAt: new Date('2024-02-10T11:20:00Z'),
    updatedAt: new Date('2024-02-10T11:20:00Z'),
    views: 2134,
    downloads: 89,
    favorites: 156,
    isFavorite: false,
    visibility: 'public',
    version: '1.0',
    metadata: {
      language: 'es',
      difficulty: 'beginner',
      estimatedReadTime: 25,
      keywords: ['tutorial', 'video', 'principiantes'],
      thumbnail: 'https://example.com/thumbnails/tutorial-video.jpg',
      transcription: 'Bienvenidos a UTalk, en este video aprenderemos...'
    }
  },

  {
    id: 'doc_003',
    title: 'Plantilla de Contrato de Servicios',
    type: 'word',
    status: 'published',
    description: 'Plantilla estándar para contratos de servicios de telecomunicaciones.',
    fileUrl: 'https://example.com/docs/contrato-servicios.docx',
    fileName: 'plantilla-contrato-servicios-v1.2.docx',
    fileSize: 524288, // 512KB
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: mockCategories[4], // Plantillas
    tags: ['contrato', 'plantilla', 'servicios', 'legal'],
    createdBy: 'legal_001',
    updatedBy: 'legal_002',
    createdAt: new Date('2024-03-05T16:45:00Z'),
    updatedAt: new Date('2024-10-12T09:15:00Z'),
    views: 543,
    downloads: 198,
    favorites: 67,
    isFavorite: false,
    visibility: 'restricted',
    allowedRoles: ['admin', 'legal', 'sales'],
    version: '1.2',
    metadata: {
      language: 'es',
      difficulty: 'intermediate',
      estimatedReadTime: 15,
      keywords: ['contrato', 'legal', 'servicios']
    }
  },

  {
    id: 'doc_004',
    title: 'Dashboard de Métricas - Plantilla Excel',
    type: 'excel',
    status: 'published',
    description: 'Plantilla de Excel para crear dashboards de métricas y KPIs de ventas.',
    fileUrl: 'https://example.com/docs/dashboard-metricas.xlsx',
    fileName: 'dashboard-metricas-template.xlsx',
    fileSize: 1572864, // 1.5MB
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: mockCategories[4], // Plantillas
    tags: ['excel', 'dashboard', 'métricas', 'kpi', 'ventas'],
    createdBy: 'analyst_001',
    createdAt: new Date('2024-04-20T13:30:00Z'),
    updatedAt: new Date('2024-04-20T13:30:00Z'),
    views: 892,
    downloads: 234,
    favorites: 45,
    isFavorite: true,
    visibility: 'public',
    version: '1.0',
    metadata: {
      language: 'es',
      difficulty: 'advanced',
      estimatedReadTime: 30,
      keywords: ['excel', 'métricas', 'dashboard', 'análisis']
    }
  },

  {
    id: 'doc_005',
    title: 'Políticas de Seguridad de la Información',
    type: 'pdf',
    status: 'published',
    description: 'Documento oficial con las políticas de seguridad de la información de la empresa.',
    fileUrl: 'https://example.com/docs/politicas-seguridad.pdf',
    fileName: 'politicas-seguridad-v3.1.pdf',
    fileSize: 3145728, // 3MB
    mimeType: 'application/pdf',
    category: mockCategories[2], // Políticas
    tags: ['seguridad', 'políticas', 'información', 'compliance'],
    createdBy: 'security_001',
    updatedBy: 'security_001',
    createdAt: new Date('2024-01-08T08:00:00Z'),
    updatedAt: new Date('2024-09-15T17:45:00Z'),
    views: 1876,
    downloads: 445,
    favorites: 123,
    isFavorite: false,
    visibility: 'restricted',
    allowedRoles: ['admin', 'hr', 'security'],
    version: '3.1',
    metadata: {
      language: 'es',
      difficulty: 'intermediate',
      estimatedReadTime: 60,
      keywords: ['seguridad', 'políticas', 'compliance', 'información']
    }
  },

  {
    id: 'doc_006',
    title: 'Catálogo de Productos 2024',
    type: 'image',
    status: 'published',
    description: 'Catálogo visual de todos nuestros productos y servicios para el año 2024.',
    fileUrl: 'https://example.com/images/catalogo-2024.png',
    fileName: 'catalogo-productos-2024.png',
    fileSize: 8388608, // 8MB
    mimeType: 'image/png',
    category: mockCategories[0], // Productos
    tags: ['catálogo', 'productos', '2024', 'servicios'],
    createdBy: 'marketing_001',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    views: 3421,
    downloads: 678,
    favorites: 234,
    isFavorite: true,
    visibility: 'public',
    version: '1.0',
    metadata: {
      language: 'es',
      difficulty: 'beginner',
      estimatedReadTime: 10,
      keywords: ['catálogo', 'productos', 'servicios'],
      thumbnail: 'https://example.com/thumbnails/catalogo-2024.jpg'
    }
  }
]

/**
 * 🎯 FAQs MOCK
 */
export const mockFAQs: KnowledgeFAQ[] = [
  {
    id: 'faq_001',
    question: '¿Cómo puedo configurar mi número de WhatsApp Business en UTalk?',
    answer: 'Para configurar tu número de WhatsApp Business en UTalk, sigue estos pasos:\n\n1. Ve a Configuración > Canales > WhatsApp\n2. Haz clic en "Agregar Número"\n3. Introduce tu número en formato internacional (+52...)\n4. Verifica el número con el código que recibirás\n5. Configura tu perfil de empresa\n\nUna vez completado, podrás enviar y recibir mensajes de WhatsApp desde UTalk.',
    category: mockCategories[1], // Configuración
    tags: ['whatsapp', 'configuración', 'número', 'business'],
    createdBy: 'support_001',
    updatedBy: 'support_002',
    createdAt: new Date('2024-02-15T10:30:00Z'),
    updatedAt: new Date('2024-11-10T16:20:00Z'),
    views: 2847,
    likes: 234,
    dislikes: 12,
    isHelpful: true,
    status: 'published',
    priority: 'high',
    relatedDocuments: ['doc_001', 'doc_002'],
    metadata: {
      keywords: ['whatsapp', 'configuración', 'business', 'número'],
      difficulty: 'beginner',
      estimatedReadTime: 3
    }
  },

  {
    id: 'faq_002',
    question: '¿Cuántos agentes puedo tener en mi plan actual?',
    answer: 'El número de agentes depende de tu plan:\n\n• Plan Básico: Hasta 5 agentes\n• Plan Profesional: Hasta 25 agentes\n• Plan Empresarial: Hasta 100 agentes\n• Plan Enterprise: Agentes ilimitados\n\nPuedes ver tu plan actual y límites en Configuración > Suscripción. Si necesitas más agentes, puedes actualizar tu plan en cualquier momento.',
    category: mockCategories[0], // Productos
    tags: ['plan', 'agentes', 'límites', 'suscripción'],
    createdBy: 'sales_001',
    createdAt: new Date('2024-03-20T14:15:00Z'),
    updatedAt: new Date('2024-03-20T14:15:00Z'),
    views: 1592,
    likes: 156,
    dislikes: 8,
    isHelpful: true,
    status: 'published',
    priority: 'medium',
    metadata: {
      keywords: ['plan', 'agentes', 'límites'],
      difficulty: 'beginner',
      estimatedReadTime: 2
    }
  },

  {
    id: 'faq_003',
    question: '¿Cómo puedo integrar UTalk con mi CRM existente?',
    answer: 'UTalk ofrece varias opciones de integración:\n\n**APIs REST:**\n- API de contactos para sincronizar datos\n- API de conversaciones para exportar historial\n- Webhooks para eventos en tiempo real\n\n**Integraciones nativas:**\n- Salesforce\n- HubSpot\n- Pipedrive\n- Zoho CRM\n\n**Zapier:**\n- Conecta con más de 5000 aplicaciones\n- Automatiza flujos de trabajo\n\nPara más información, consulta nuestra documentación de API o contacta a soporte técnico.',
    category: mockCategories[1], // Configuración
    tags: ['integración', 'crm', 'api', 'salesforce', 'hubspot'],
    createdBy: 'tech_001',
    updatedBy: 'tech_001',
    createdAt: new Date('2024-04-10T09:45:00Z'),
    updatedAt: new Date('2024-10-05T11:30:00Z'),
    views: 876,
    likes: 89,
    dislikes: 5,
    isHelpful: true,
    status: 'published',
    priority: 'high',
    relatedDocuments: ['doc_001'],
    metadata: {
      keywords: ['integración', 'crm', 'api', 'salesforce'],
      difficulty: 'advanced',
      estimatedReadTime: 5
    }
  }
]

/**
 * 🎯 CURSOS MOCK
 */
export const mockCourses: KnowledgeCourse[] = [
  {
    id: 'course_001',
    title: 'Fundamentos de UTalk para Agentes',
    description: 'Curso introductorio que cubre todos los aspectos básicos de UTalk para nuevos agentes de servicio al cliente.',
    lessons: [
      {
        id: 'lesson_001',
        title: 'Introducción a UTalk',
        description: 'Conoce la plataforma y sus principales características',
        order: 1,
        type: 'video',
        resourceUrl: 'https://example.com/videos/intro-utalk.mp4',
        duration: 15,
        isRequired: true,
        allowSkip: false
      },
      {
        id: 'lesson_002',
        title: 'Configuración del Perfil de Agente',
        description: 'Aprende a configurar tu perfil y preferencias',
        order: 2,
        type: 'document',
        resourceUrl: 'https://example.com/docs/perfil-agente.pdf',
        duration: 10,
        isRequired: true,
        allowSkip: false
      },
      {
        id: 'lesson_003',
        title: 'Gestión de Conversaciones',
        description: 'Manejo efectivo de conversaciones con clientes',
        order: 3,
        type: 'video',
        resourceUrl: 'https://example.com/videos/conversaciones.mp4',
        duration: 20,
        isRequired: true,
        allowSkip: false
      },
      {
        id: 'lesson_004',
        title: 'Evaluación Final',
        description: 'Quiz para evaluar conocimientos adquiridos',
        order: 4,
        type: 'quiz',
        duration: 15,
        isRequired: true,
        allowSkip: false,
        quiz: {
          id: 'quiz_001',
          title: 'Evaluación: Fundamentos de UTalk',
          description: 'Evaluación de conocimientos básicos',
          questions: [
            {
              id: 'q1',
              question: '¿Cuál es la función principal de UTalk?',
              type: 'multiple_choice',
              options: [
                'Gestión de inventarios',
                'Atención al cliente omnicanal',
                'Contabilidad empresarial',
                'Gestión de recursos humanos'
              ],
              correctAnswer: 1,
              explanation: 'UTalk es una plataforma de atención al cliente omnicanal.',
              points: 10
            }
          ],
          passingScore: 70,
          maxAttempts: 3,
          timeLimit: 15
        }
      }
    ],
    totalLessons: 4,
    estimatedDuration: 60,
    category: mockCategories[3], // Capacitación
    tags: ['fundamentos', 'agentes', 'introducción', 'básico'],
    difficulty: 'beginner',
    createdBy: 'trainer_001',
    createdAt: new Date('2024-01-10T08:00:00Z'),
    updatedAt: new Date('2024-06-15T10:30:00Z'),
    status: 'published',
    isActive: true,
    enrolledCount: 145,
    completedCount: 98,
    averageRating: 4.6,
    requiresEnrollment: true,
    thumbnail: 'https://example.com/thumbnails/course-fundamentos.jpg',
    userProgress: {
      courseId: 'course_001',
      userId: 'user_001',
      isEnrolled: true,
      isCompleted: false,
      enrolledAt: new Date('2024-11-01T09:00:00Z'),
      lastAccessedAt: new Date('2024-11-20T14:30:00Z'),
      completedLessons: 2,
      totalLessons: 4,
      progressPercentage: 50,
      timeSpent: 45,
      lessonProgress: {
        'lesson_001': {
          isCompleted: true,
          completedAt: new Date('2024-11-01T09:30:00Z'),
          timeSpent: 15
        },
        'lesson_002': {
          isCompleted: true,
          completedAt: new Date('2024-11-05T11:15:00Z'),
          timeSpent: 12
        },
        'lesson_003': {
          isCompleted: false,
          timeSpent: 8
        }
      },
      quizResults: []
    }
  },

  {
    id: 'course_002',
    title: 'Gestión Avanzada de Campañas',
    description: 'Curso avanzado para crear y gestionar campañas de marketing efectivas en UTalk.',
    lessons: [
      {
        id: 'lesson_005',
        title: 'Estrategias de Segmentación',
        order: 1,
        type: 'video',
        duration: 25,
        isRequired: true,
        allowSkip: false
      },
      {
        id: 'lesson_006',
        title: 'Diseño de Mensajes Efectivos',
        order: 2,
        type: 'document',
        duration: 20,
        isRequired: true,
        allowSkip: false
      },
      {
        id: 'lesson_007',
        title: 'Análisis de Resultados',
        order: 3,
        type: 'video',
        duration: 30,
        isRequired: true,
        allowSkip: false
      }
    ],
    totalLessons: 3,
    estimatedDuration: 75,
    category: mockCategories[3], // Capacitación
    tags: ['campañas', 'marketing', 'avanzado', 'segmentación'],
    difficulty: 'advanced',
    createdBy: 'trainer_002',
    createdAt: new Date('2024-05-01T10:00:00Z'),
    updatedAt: new Date('2024-05-01T10:00:00Z'),
    status: 'published',
    isActive: true,
    enrolledCount: 67,
    completedCount: 34,
    averageRating: 4.8,
    requiresEnrollment: true,
    prerequisites: ['course_001'],
    thumbnail: 'https://example.com/thumbnails/course-campanas.jpg'
  }
]

/**
 * 🎯 ESTADÍSTICAS MOCK
 */
export const mockStats: KnowledgeStats = {
  totalDocuments: 236,
  totalFAQs: 89,
  totalCourses: 12,
  totalCategories: 6,
  totalViews: 15847,
  totalDownloads: 4521,
  totalFavorites: 892,
  activeUsers: 145,
  totalEnrollments: 298,
  completedCourses: 156,
  documentsByType: {
    pdf: 89,
    video: 45,
    image: 32,
    excel: 28,
    word: 24,
    powerpoint: 12,
    text: 4,
    markdown: 2,
    link: 0,
    blog: 0,
    audio: 0,
    zip: 0,
    other: 0
  },
  recentActivity: [],
  averageViewTime: 12.5,
  averageCourseCompletion: 68.5,
  mostViewedDocuments: mockDocuments.slice(0, 3),
  mostPopularCourses: mockCourses.slice(0, 2),
  mostHelpfulFAQs: mockFAQs.slice(0, 3)
}

/**
 * 🎯 ACTIVIDADES MOCK
 */
export const mockActivities: KnowledgeActivity[] = [
  {
    id: 'activity_001',
    type: 'document_created',
    userId: 'user_001',
    userName: 'Ana García',
    userAvatar: 'https://example.com/avatars/ana.jpg',
    resourceType: 'document',
    resourceId: 'doc_001',
    resourceTitle: 'Manual de Configuración de UTalk',
    action: 'created',
    description: 'Ana García creó el documento "Manual de Configuración de UTalk"',
    timestamp: new Date('2024-11-20T14:30:00Z')
  },
  {
    id: 'activity_002',
    type: 'course_completed',
    userId: 'user_002',
    userName: 'Carlos López',
    userAvatar: 'https://example.com/avatars/carlos.jpg',
    resourceType: 'course',
    resourceId: 'course_001',
    resourceTitle: 'Fundamentos de UTalk para Agentes',
    action: 'completed',
    description: 'Carlos López completó el curso "Fundamentos de UTalk para Agentes"',
    timestamp: new Date('2024-11-20T11:15:00Z'),
    metadata: {
      score: 85,
      duration: 65
    }
  },
  {
    id: 'activity_003',
    type: 'faq_created',
    userId: 'user_003',
    userName: 'María Rodríguez',
    userAvatar: 'https://example.com/avatars/maria.jpg',
    resourceType: 'faq',
    resourceId: 'faq_001',
    resourceTitle: '¿Cómo puedo configurar mi número de WhatsApp Business en UTalk?',
    action: 'created',
    description: 'María Rodríguez creó la FAQ "¿Cómo puedo configurar mi número de WhatsApp Business en UTalk?"',
    timestamp: new Date('2024-11-19T16:45:00Z')
  }
]

// Actualizar estadísticas con actividades
mockStats.recentActivity = mockActivities 