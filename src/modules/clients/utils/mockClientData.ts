import type { 
  Client, 
  ClientActivity, 
  ClientDeal, 
  ClientMetrics,
  ClientAIRecommendation,
  ClientSource,
  ClientSegment,
  ClientTag,
  ActivityType
} from '../../../types/client';

// Generar nombres y empresas realistas
const mockNames = [
  'Gabriela Vega', 'Raúl Gutiérrez', 'Emilio Guerrero', 'Diego Martín', 'Andrés Vargas',
  'Sergio Delgado', 'Alberto Peña', 'Mónica Castro', 'Carlos Ruiz', 'Ana Martínez',
  'Pedro Sánchez', 'Elena Torres', 'Luis Fernández', 'María González', 'Javier López',
  'Carmen Rodríguez', 'Francisco Pérez', 'Isabel Moreno', 'Miguel Jiménez', 'Rosa García',
  'Antonio Silva', 'Patricia Herrera', 'Roberto Díaz', 'Laura Morales', 'Fernando Castro',
  'Natalia Romero', 'Ricardo Mendoza', 'Sofia Vargas', 'Héctor Reyes', 'Valeria Luna',
  'Óscar Ramos', 'Daniela Cruz', 'Manuel Ortega', 'Adriana Flores', 'José Mendoza',
  'Claudia Ríos', 'Alejandro Vega', 'Lucía Herrera', 'Eduardo Morales', 'Paula Silva',
  'Roberto Torres', 'Mariana López', 'Felipe Castro', 'Camila Rojas', 'Andrés Mendoza',
  'Valentina Herrera', 'Sebastián Vega', 'Isabella Morales', 'Nicolás Silva', 'Sofía Torres'
];

const mockCompanies = [
  'TechAdvantage', 'TechLeaders', 'DataFlow', 'InnovateNow', 'FutureTech',
  'DigitalFirst', 'CloudSolutions', 'SmartBusiness', 'ProSolutions', 'NextGen Systems',
  'InnovationHub', 'TechVision', 'DataDriven', 'SmartAnalytics', 'CloudWorks',
  'DigitalEdge', 'TechPulse', 'InnovationLab', 'DataMasters', 'SmartConnect',
  'CloudBridge', 'TechFlow', 'InnovationCore', 'DataSync', 'SmartLogic',
  'DigitalCore', 'TechMatrix', 'InnovationEdge', 'DataWorks', 'SmartFlow',
  'CloudLogic', 'TechSync', 'InnovationMatrix', 'DataCore', 'SmartWorks',
  'DigitalMatrix', 'TechCore', 'InnovationSync', 'DataLogic', 'SmartMatrix',
  'CloudCore', 'TechLogic', 'InnovationWorks', 'DataMatrix', 'SmartCore',
  'DigitalLogic', 'TechWorks', 'InnovationMatrix', 'DataCore', 'SmartLogic'
];

const mockEmails = [
  'gabriela.vega@techadvantage.com', 'raul.gutierrez@techleaders.com', 'emilio.guerrero@dataflow.com',
  'diego.martin@techadvantage.com', 'andres.vargas@futuretech.com', 'sergio.delgado@innovatenow.com',
  'alberto.pena@digitalfirst.com', 'monica.castro@cloudsolutions.com', 'carlos.ruiz@smartbusiness.com',
  'ana.martinez@prosolutions.com', 'pedro.sanchez@nextgen.com', 'elena.torres@innovationhub.com',
  'luis.fernandez@techvision.com', 'maria.gonzalez@datadriven.com', 'javier.lopez@smartanalytics.com',
  'carmen.rodriguez@cloudworks.com', 'francisco.perez@digitaledge.com', 'isabel.moreno@techpulse.com',
  'miguel.jimenez@innovationlab.com', 'rosa.garcia@datamasters.com', 'antonio.silva@smartconnect.com',
  'patricia.herrera@cloudbridge.com', 'roberto.diaz@techflow.com', 'laura.morales@innovationcore.com',
  'fernando.castro@datasync.com', 'natalia.romero@smartlogic.com', 'ricardo.mendoza@digitalcore.com',
  'sofia.vargas@techmatrix.com', 'hector.reyes@innovationedge.com', 'valeria.luna@dataworks.com',
  'oscar.ramos@smartflow.com', 'daniela.cruz@cloudlogic.com', 'manuel.ortega@techsync.com',
  'adriana.flores@innovationmatrix.com', 'jose.mendoza@datacore.com', 'claudia.rios@smartworks.com',
  'alejandro.vega@digitalmatrix.com', 'lucia.herrera@techcore.com', 'eduardo.morales@innovationsync.com',
  'paula.silva@datalogic.com', 'roberto.torres@smartmatrix.com', 'mariana.lopez@cloudcore.com',
  'felipe.castro@techlogic.com', 'camila.rojas@innovationworks.com', 'andres.mendoza@datamatrix.com',
  'valentina.herrera@smartcore.com', 'sebastian.vega@digitallogic.com', 'isabella.morales@techworks.com',
  'nicolas.silva@innovationmatrix.com', 'sofia.torres@datacore.com'
];

const mockPhones = [
  '+52 55 5529 5710', '+52 55 1234 5678', '+52 55 9876 5432', '+52 55 1111 2222',
  '+52 55 3333 4444', '+52 55 5555 6666', '+52 55 7777 8888', '+52 55 9999 0000',
  '+52 55 1212 3434', '+52 55 5656 7878', '+52 55 9090 1212', '+52 55 3434 5656',
  '+52 55 7878 9090', '+52 55 2323 4545', '+52 55 6767 8989', '+52 55 0101 2323',
  '+52 55 4545 6767', '+52 55 8989 0101', '+52 55 3434 5656', '+52 55 7878 9090',
  '+52 55 2323 4545', '+52 55 6767 8989', '+52 55 0101 2323', '+52 55 4545 6767',
  '+52 55 8989 0101', '+52 55 3434 5656', '+52 55 7878 9090', '+52 55 2323 4545',
  '+52 55 6767 8989', '+52 55 0101 2323', '+52 55 4545 6767', '+52 55 8989 0101',
  '+52 55 3434 5656', '+52 55 7878 9090', '+52 55 2323 4545', '+52 55 6767 8989',
  '+52 55 0101 2323', '+52 55 4545 6767', '+52 55 8989 0101', '+52 55 3434 5656',
  '+52 55 7878 9090', '+52 55 2323 4545', '+52 55 6767 8989', '+52 55 0101 2323',
  '+52 55 4545 6767', '+52 55 8989 0101', '+52 55 3434 5656', '+52 55 7878 9090',
  '+52 55 2323 4545', '+52 55 6767 8989', '+52 55 0101 2323', '+52 55 4545 6767'
];

// Generar clientes mock
export const generateMockClients = (): Client[] => {
  return mockNames.map((name, index) => {
    const company = mockCompanies[index];
    const email = mockEmails[index];
    const phone = mockPhones[index];
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    // Distribuir etapas de manera realista
    const stages: Array<'lead' | 'prospect' | 'demo' | 'propuesta' | 'negociacion' | 'ganado' | 'perdido'> = [
      'lead', 'prospect', 'demo', 'propuesta', 'negociacion', 'ganado', 'perdido'
    ];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    
    // Generar valores realistas basados en la etapa
    const getValueByStage = (stage: string) => {
      switch (stage) {
        case 'lead': return Math.floor(Math.random() * 50000) + 10000;
        case 'prospect': return Math.floor(Math.random() * 100000) + 50000;
        case 'demo': return Math.floor(Math.random() * 200000) + 100000;
        case 'propuesta': return Math.floor(Math.random() * 500000) + 200000;
        case 'negociacion': return Math.floor(Math.random() * 800000) + 300000;
        case 'ganado': return Math.floor(Math.random() * 1000000) + 500000;
        case 'perdido': return Math.floor(Math.random() * 300000) + 100000;
        default: return Math.floor(Math.random() * 500000) + 100000;
      }
    };

    const expectedValue = getValueByStage(stage);
    const probability = Math.floor(Math.random() * 40) + 60; // 60-100%
    const score = Math.floor(Math.random() * 30) + 70; // 70-100%
    const winRate = stage === 'ganado' ? 100 : Math.floor(Math.random() * 40) + 60;

    return {
      id: `client-${index + 1}`,
      name,
      company,
      email,
      phone,
      whatsapp: phone,
      avatar: undefined,
      initials,
      status: stage === 'ganado' ? 'won' : stage === 'perdido' ? 'lost' : 'pending',
      stage,
      score,
      winRate,
      expectedValue,
      probability,
      source: ['facebook', 'linkedin', 'website', 'referral', 'cold_call', 'event'][Math.floor(Math.random() * 6)] as ClientSource,
      segment: ['startup', 'sme', 'enterprise', 'freelancer', 'agency'][Math.floor(Math.random() * 5)] as ClientSegment,
      tags: ['VIP', 'Empresa', 'Startup', 'Premium', 'Hot Lead', 'Cold Lead'].slice(0, Math.floor(Math.random() * 3) + 1) as ClientTag[],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      nextContact: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      assignedTo: `agent-${Math.floor(Math.random() * 5) + 1}`,
      assignedToName: ['María González', 'Carlos Ruiz', 'Ana Martín', 'Pedro Sánchez', 'Elena Torres'][Math.floor(Math.random() * 5)],
      description: `Cliente ${stage} con potencial alto. ${Math.random() > 0.5 ? 'Interesado en soluciones empresariales.' : 'Buscando optimización de procesos.'}`,
      notes: Math.random() > 0.7 ? 'Cliente VIP - Requiere atención especial' : undefined,
      metadata: {}
    };
  });
};

// Generar actividades mock
export const generateMockActivities = (clientId: string): ClientActivity[] => {
  const activityTypes: ActivityType[] = [
    'whatsapp', 'call', 'email', 'meeting', 'demo', 'proposal', 'follow_up'
  ];
  
  const activities: ClientActivity[] = [];
  const numActivities = Math.floor(Math.random() * 5) + 2; // 2-6 actividades
  
  for (let i = 0; i < numActivities; i++) {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    activities.push({
      id: `activity-${clientId}-${i}`,
      clientId,
      type,
      title: getActivityTitle(type),
      description: getActivityDescription(type),
      timestamp,
      duration: type === 'call' || type === 'meeting' ? Math.floor(Math.random() * 60) + 15 : undefined,
      metadata: {}
    });
  }
  
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generar deals mock
export const generateMockDeals = (clientId: string): ClientDeal[] => {
  const deals: ClientDeal[] = [];
  const numDeals = Math.floor(Math.random() * 3) + 1; // 1-3 deals
  
  for (let i = 0; i < numDeals; i++) {
    const value = Math.floor(Math.random() * 500000) + 50000;
    const probability = Math.floor(Math.random() * 40) + 60;
    const closeDate = new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000);
    
    deals.push({
      id: `deal-${clientId}-${i}`,
      clientId,
      title: getDealTitle(i),
      value,
      probability,
      stage: getDealStage(probability),
      expectedCloseDate: closeDate,
      description: `Oportunidad de ${value.toLocaleString()} USD con ${probability}% de probabilidad de cierre.`,
      currency: 'USD',
      dealType: 'new_business',
      winProbability: probability,
      daysInStage: Math.floor(Math.random() * 30) + 1,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      metadata: {}
    });
  }
  
  return deals.sort((a, b) => b.value - a.value);
};

// Generar métricas mock
export const generateMockMetrics = (): ClientMetrics => {
  return {
    totalClients: 50,
    totalValue: 8548000,
    totalOpportunities: 27,
    winRate: 100,
    averageDaysToClose: 45,
    contactsToContactToday: 0,
    projectedRevenue: 13228990,
    stageMetrics: {
      lead: { count: 0, value: 0, averageProbability: 0 },
      prospect: { count: 0, value: 0, averageProbability: 0 },
      demo: { count: 0, value: 0, averageProbability: 0 },
      propuesta: { count: 4, value: 1697000, averageProbability: 64 },
      negociacion: { count: 23, value: 6851000, averageProbability: 78 },
      ganado: { count: 23, value: 0, averageProbability: 0 },
      perdido: { count: 0, value: 0, averageProbability: 0 }
    },
    agentMetrics: {
      'agent-1': { name: 'María González', clientsCount: 10, totalValue: 2000000, winRate: 85, averageScore: 85 },
      'agent-2': { name: 'Carlos Ruiz', clientsCount: 12, totalValue: 2500000, winRate: 78, averageScore: 82 },
      'agent-3': { name: 'Ana Martín', clientsCount: 8, totalValue: 1800000, winRate: 92, averageScore: 88 },
      'agent-4': { name: 'Pedro Sánchez', clientsCount: 15, totalValue: 3000000, winRate: 75, averageScore: 79 },
      'agent-5': { name: 'Elena Torres', clientsCount: 5, totalValue: 1000000, winRate: 90, averageScore: 91 }
    },
    sourceMetrics: {
      facebook: { count: 8, value: 1200000, conversionRate: 15 },
      linkedin: { count: 12, value: 1800000, conversionRate: 22 },
      website: { count: 10, value: 1500000, conversionRate: 18 },
      referral: { count: 6, value: 900000, conversionRate: 25 },
      cold_call: { count: 8, value: 1200000, conversionRate: 12 },
      event: { count: 6, value: 900000, conversionRate: 20 },
      advertising: { count: 0, value: 0, conversionRate: 0 }
    },
    segmentMetrics: {
      startup: { count: 15, value: 2250000, averageValue: 150000 },
      sme: { count: 20, value: 3000000, averageValue: 150000 },
      enterprise: { count: 10, value: 2000000, averageValue: 200000 },
      freelancer: { count: 3, value: 450000, averageValue: 150000 },
      agency: { count: 2, value: 300000, averageValue: 150000 }
    },
    trends: {
      newClientsThisMonth: 8,
      newClientsLastMonth: 6,
      valueGrowth: 15,
      winRateChange: 5
    }
  };
};

// Generar recomendaciones de IA mock
export const generateMockAIRecommendations = (clientId: string): ClientAIRecommendation[] => {
  const recommendations: ClientAIRecommendation[] = [];
  const numRecommendations = Math.floor(Math.random() * 3) + 1; // 1-3 recomendaciones
  
  for (let i = 0; i < numRecommendations; i++) {
    recommendations.push({
      id: `ai-${clientId}-${i}`,
      clientId,
      type: ['next_action', 'upsell_opportunity', 'risk_alert', 'success_story'][Math.floor(Math.random() * 4)] as 'next_action' | 'upsell_opportunity' | 'risk_alert' | 'success_story',
      title: getAIRecommendationTitle(i),
      description: getAIRecommendationDescription(i),
      priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as 'low' | 'medium' | 'high' | 'urgent',
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      suggestedActions: getSuggestedActions(i),
      createdAt: new Date()
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 4, medium: 3, low: 2, urgent: 5 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

// Funciones auxiliares
function getActivityTitle(type: string): string {
  const titles = {
    message: 'Mensaje de WhatsApp',
    call: 'Llamada comercial',
    meeting: 'Reunión de seguimiento',
    proposal: 'Envío de propuesta',
    demo: 'Demo del producto'
  };
  return titles[type as keyof typeof titles] || 'Actividad';
}

function getActivityDescription(type: string): string {
  const descriptions = {
    message: 'Cliente pregunta sobre tiempo de implementación',
    call: 'Demo del producto - 45 minutos. Cliente muy interesado.',
    meeting: 'Revisión de propuesta y próximos pasos',
    proposal: 'Propuesta técnica enviada por email',
    demo: 'Presentación completa de funcionalidades'
  };
  return descriptions[type as keyof typeof descriptions] || 'Descripción de actividad';
}

function getDealTitle(index: number): string {
  const titles = [
    'Implementación CRM Enterprise',
    'Solución de Analytics Avanzado',
    'Migración a la Nube',
    'Optimización de Procesos',
    'Integración de Sistemas'
  ];
  return titles[index] || `Deal ${index + 1}`;
}

function getDealStage(probability: number): 'lead' | 'prospect' | 'demo' | 'propuesta' | 'negociacion' | 'ganado' | 'perdido' {
  if (probability >= 90) return 'ganado';
  if (probability >= 70) return 'negociacion';
  if (probability >= 50) return 'propuesta';
  if (probability >= 30) return 'demo';
  return 'prospect';
}

function getAIRecommendationTitle(index: number): string {
  const titles = [
    'Enviar caso de éxito similar',
    'Agendar demo personalizada',
    'Enviar ROI calculator',
    'Contactar para feedback',
    'Actualizar información'
  ];
  return titles[index] || `Recomendación ${index + 1}`;
}

function getAIRecommendationDescription(index: number): string {
  const descriptions = [
    'El cliente muestra interés pero necesita validación. Un caso de éxito similar aceleraría la decisión.',
    'El cliente está en etapa de evaluación. Una demo personalizada aumentaría las probabilidades.',
    'El cliente está evaluando el ROI. Un calculator personalizado ayudaría en la decisión.',
    'Es momento de obtener feedback sobre la propuesta enviada.',
    'La información del cliente necesita actualización para mejor seguimiento.'
  ];
  return descriptions[index] || 'Descripción de recomendación';
}

function getSuggestedActions(index: number): { id: string; title: string; description: string; type: 'email' | 'call' | 'meeting' | 'demo' | 'proposal' | 'follow_up' }[] {
  const actions = [
    [
      { id: '1', title: 'Compartir caso de éxito', description: 'Enviar caso de éxito similar', type: 'email' as const },
      { id: '2', title: 'Agendar reunión', description: 'Programar reunión de seguimiento', type: 'meeting' as const },
      { id: '3', title: 'Enviar material adicional', description: 'Enviar documentación complementaria', type: 'email' as const }
    ],
    [
      { id: '4', title: 'Preparar demo personalizada', description: 'Demo específica para necesidades del cliente', type: 'demo' as const },
      { id: '5', title: 'Incluir casos de uso específicos', description: 'Casos de uso relevantes al sector', type: 'proposal' as const },
      { id: '6', title: 'Seguir en 3 días', description: 'Llamada de seguimiento programada', type: 'call' as const }
    ],
    [
      { id: '7', title: 'Crear ROI calculator', description: 'Calculadora de retorno de inversión', type: 'proposal' as const },
      { id: '8', title: 'Incluir métricas del sector', description: 'Métricas específicas del sector', type: 'email' as const },
      { id: '9', title: 'Programar llamada de seguimiento', description: 'Llamada para revisar propuesta', type: 'call' as const }
    ],
    [
      { id: '10', title: 'Enviar encuesta de feedback', description: 'Encuesta para obtener feedback', type: 'email' as const },
      { id: '11', title: 'Agendar llamada', description: 'Llamada para discutir feedback', type: 'call' as const },
      { id: '12', title: 'Preparar propuesta de mejora', description: 'Propuesta basada en feedback', type: 'proposal' as const }
    ],
    [
      { id: '13', title: 'Actualizar información de contacto', description: 'Verificar y actualizar datos', type: 'follow_up' as const },
      { id: '14', title: 'Verificar datos comerciales', description: 'Revisar información comercial', type: 'follow_up' as const },
      { id: '15', title: 'Revisar historial', description: 'Revisar historial de interacciones', type: 'follow_up' as const }
    ]
  ];
  return actions[index] || [{ id: 'default', title: 'Acción sugerida', description: 'Acción por defecto', type: 'follow_up' as const }];
}

// Exportar todos los datos mock
export const mockClientData = {
  clients: generateMockClients(),
  metrics: generateMockMetrics(),
  activities: generateMockClients().map(client => generateMockActivities(client.id)).flat(),
  deals: generateMockClients().map(client => generateMockDeals(client.id)).flat(),
  aiRecommendations: generateMockClients().map(client => generateMockAIRecommendations(client.id)).flat()
}; 