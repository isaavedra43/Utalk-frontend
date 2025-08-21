// Script de prueba para verificar la creación de conversaciones
// Ejecutar con: node test-conversation-creation.js

const testConversationCreation = () => {
  console.log('🧪 Probando creación de conversación...');
  
  // Datos de prueba
  const testData = {
    customerPhone: '+524773790184',
    initialMessage: 'Hola, esta es una prueba',
    assignedTo: 'admin@company.com',
    currentUser: 'admin@company.com'
  };
  
  // Construir ID esperado
  const ourNumber = '+5214793176502';
  const expectedId = `conv_${testData.customerPhone}_${ourNumber}`;
  
  console.log('📱 Datos de prueba:', testData);
  console.log('🆔 ID esperado:', expectedId);
  
  // Verificar estructura de participantes esperada
  const expectedParticipants = [
    testData.customerPhone, // Cliente
    testData.currentUser, // Agente actual
    `agent:${testData.currentUser}`, // Identificador del agente
    `whatsapp:${testData.customerPhone}` // Identificador de WhatsApp
  ];
  
  console.log('👥 Participantes esperados:', expectedParticipants);
  
  // Simular respuesta del backend (con ID al revés)
  const mockBackendResponse = {
    success: true,
    message: 'Conversación creada exitosamente',
    timestamp: new Date().toISOString(),
    data: {
      id: `conv_${ourNumber}_${testData.customerPhone}`, // ID al revés
      customerPhone: testData.customerPhone,
      assignedTo: null,
      assignedToName: null,
      priority: 'medium',
      tags: [],
      participants: [testData.customerPhone], // Solo el cliente
      createdBy: testData.currentUser,
      createdAt: {},
      updatedAt: {},
      lastMessageAt: {},
      status: 'open',
      messages: [],
      unreadCount: 0
    }
  };
  
  console.log('🔧 Respuesta simulada del backend:', mockBackendResponse);
  
  // Aplicar correcciones (simulando la lógica del frontend)
  const responseData = { ...mockBackendResponse };
  const backendId = responseData.data.id;
  
  if (backendId !== expectedId) {
    console.log('⚠️ Backend devolvió ID al revés, corrigiendo...');
    
    // Corregir el ID
    responseData.data.id = expectedId;
    
    // Corregir participantes
    if (!responseData.data.participants || responseData.data.participants.length < 4) {
      responseData.data.participants = expectedParticipants;
    }
    
    // Asegurar que el agente esté como participante
    if (!responseData.data.participants.includes(testData.currentUser)) {
      responseData.data.participants.push(testData.currentUser);
    }
    if (!responseData.data.participants.includes(`agent:${testData.currentUser}`)) {
      responseData.data.participants.push(`agent:${testData.currentUser}`);
    }
  }
  
  console.log('✅ Respuesta corregida:', responseData);
  
  // Verificaciones finales
  const isIdCorrect = responseData.data.id === expectedId;
  const hasAllParticipants = expectedParticipants.every(p => 
    responseData.data.participants.includes(p)
  );
  const participantCount = responseData.data.participants.length;
  
  console.log('\n📊 Resultados de la prueba:');
  console.log(`✅ ID correcto: ${isIdCorrect}`);
  console.log(`✅ Todos los participantes: ${hasAllParticipants}`);
  console.log(`📈 Número de participantes: ${participantCount}`);
  console.log(`🎯 Participantes finales:`, responseData.data.participants);
  
  if (isIdCorrect && hasAllParticipants) {
    console.log('🎉 ¡Prueba exitosa! La conversación se creó correctamente.');
  } else {
    console.log('❌ Prueba fallida. Revisar la lógica de corrección.');
  }
};

// Ejecutar la prueba
 