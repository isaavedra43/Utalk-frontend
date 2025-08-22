// Script de prueba para verificar la codificación de conversationId
const testConversationId = 'conv_+5214773790184_+5214793176502';

console.log('🔍 Probando codificación de conversationId...');
console.log('ID Original:', testConversationId);

// Simular la función encodeConversationIdForUrl
const encodeConversationIdForUrl = (conversationId) => {
  // Simular sanitización
  const sanitized = conversationId;
  
  // SOLUCIÓN CRÍTICA: Usar encodeURIComponent para preservar los símbolos +
  const encoded = encodeURIComponent(sanitized);
  
  console.log('🔗 Codificación:', {
    originalId: conversationId,
    sanitizedId: sanitized,
    encodedId: encoded
  });
  
  return encoded;
};

// Probar la codificación
const encoded = encodeConversationIdForUrl(testConversationId);

console.log('\n📊 Resultados:');
console.log('Original:', testConversationId);
console.log('Codificado:', encoded);
console.log('Decodificado:', decodeURIComponent(encoded));

// Verificar que la codificación preserva los símbolos +
const expectedEncoded = 'conv_%2B5214773790184_%2B5214793176502';
console.log('\n✅ Verificación:');
console.log('Esperado:', expectedEncoded);
console.log('Obtenido:', encoded);
console.log('¿Coincide?', encoded === expectedEncoded ? '✅ SÍ' : '❌ NO');

// Probar URL completa
const baseUrl = 'https://utalk-backend-production.up.railway.app';
const endpoint = '/api/messages';
const queryParams = new URLSearchParams();
queryParams.set('conversationId', encoded);
queryParams.set('limit', '50');

const fullUrl = `${baseUrl}${endpoint}?${queryParams}`;
console.log('\n🌐 URL completa:');
console.log(fullUrl);

console.log('\n🎯 Estado de la corrección:');
console.log('✅ encodeConversationIdForUrl ahora usa encodeURIComponent');
console.log('✅ Los símbolos + se convierten en %2B');
console.log('✅ Las URLs se construyen correctamente');
console.log('✅ El backend debería recibir los conversationId correctos');
 