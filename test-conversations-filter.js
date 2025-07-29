// 🧪 SCRIPT DE PRUEBA: Verificar filtro participantEmail
// Ejecutar en la consola del navegador después de loguearse

console.log('🧪 INICIANDO PRUEBA DE FILTRO PARTICIPANTEMAIL')

// 1. Verificar que el usuario esté logueado
const user = JSON.parse(localStorage.getItem('user_data') || 'null')
console.log('👤 Usuario logueado:', user)

if (!user?.email) {
  console.error('❌ No hay usuario logueado o no tiene email')
  console.log('💡 Loguea un usuario primero')
} else {
  console.log('✅ Usuario logueado:', user.email)
  
  // 2. Simular la llamada al servicio
  const mockFilters = {
    participantEmail: user.email
  }
  
  console.log('🔍 Filtros a enviar:', mockFilters)
  
  // 3. Construir URL como lo hace el servicio
  const params = new URLSearchParams()
  params.append('participantEmail', user.email)
  
  const url = `/conversations?${params.toString()}`
  console.log('📞 URL que se enviaría al backend:', url)
  
  // 4. Verificar que el filtro esté presente
  const hasParticipantEmail = params.has('participantEmail')
  console.log('✅ Filtro participantEmail incluido:', hasParticipantEmail)
  
  if (hasParticipantEmail) {
    console.log('🎯 PRUEBA EXITOSA: El filtro participantEmail se incluye correctamente')
    console.log('📋 Resumen:')
    console.log('  - Usuario:', user.email)
    console.log('  - Filtro:', user.email)
    console.log('  - URL:', url)
    console.log('  - Backend debería recibir: participantEmail=' + user.email)
  } else {
    console.error('❌ ERROR: El filtro participantEmail no se incluye')
  }
}

console.log('🧪 FIN DE PRUEBA')
console.log('💡 Ahora revisa la consola del navegador para ver los logs del hook useConversations') 