/**
 * 🔧 Script de validación de messageCount
 * 
 * Este script verifica si los campos messageCount en las conversaciones
 * coinciden con el número real de mensajes en la base de datos.
 */

import { api } from '@/lib/apiClient';
import { logger } from '@/lib/utils';

interface ValidationResult {
  conversationId: string;
  reportedCount: number | null;
  actualCount: number;
  isValid: boolean;
  difference: number;
}

interface ValidationSummary {
  totalConversations: number;
  validCounts: number;
  invalidCounts: number;
  missingCounts: number;
  averageDiscrepancy: number;
  maxDiscrepancy: number;
  needsRecalculation: boolean;
}

/**
 * Validar messageCount para una conversación específica
 */
async function validateConversationMessageCount(conversationId: string): Promise<ValidationResult> {
  try {
    console.log(`🔍 Validando messageCount para conversación: ${conversationId}`);

    // 1. Obtener información de la conversación
    const conversation = await api.get<any>(`/conversations/${conversationId}`);
    const reportedCount = conversation?.messageCount || null;

    // 2. Obtener mensajes reales y contar
    const messagesResponse = await api.get<any>(`/conversations/${conversationId}/messages`, {
      limit: 1000 // Obtener muchos mensajes para conteo preciso
    });

    const actualMessages = messagesResponse?.messages || messagesResponse?.data || [];
    const actualCount = Array.isArray(actualMessages) ? actualMessages.length : 0;

    // 3. Comparar y calcular diferencia
    const difference = reportedCount !== null ? Math.abs(reportedCount - actualCount) : 0;
    const isValid = reportedCount === actualCount;

    console.log(`📊 Conversación ${conversationId}:`, {
      reportedCount,
      actualCount,
      difference,
      isValid: isValid ? '✅' : '❌'
    });

    return {
      conversationId,
      reportedCount,
      actualCount,
      isValid,
      difference
    };

  } catch (error) {
    console.error(`❌ Error validando conversación ${conversationId}:`, error);
    return {
      conversationId,
      reportedCount: null,
      actualCount: 0,
      isValid: false,
      difference: 0
    };
  }
}

/**
 * Validar messageCount para todas las conversaciones
 */
export async function validateAllMessageCounts(sampleSize: number = 20): Promise<ValidationSummary> {
  console.log('🔧 Iniciando validación de messageCount...');

  try {
    // 1. Obtener lista de conversaciones
    console.log(`📋 Obteniendo ${sampleSize} conversaciones para validar...`);
    const conversationsResponse = await api.get<any>('/conversations', {
      limit: sampleSize
    });

    const conversations = conversationsResponse?.conversations || 
                         conversationsResponse?.data || 
                         [];

    if (!Array.isArray(conversations) || conversations.length === 0) {
      console.warn('⚠️ No se encontraron conversaciones para validar');
      return {
        totalConversations: 0,
        validCounts: 0,
        invalidCounts: 0,
        missingCounts: 0,
        averageDiscrepancy: 0,
        maxDiscrepancy: 0,
        needsRecalculation: false
      };
    }

    console.log(`✅ Encontradas ${conversations.length} conversaciones`);

    // 2. Validar messageCount para cada conversación
    const validationResults: ValidationResult[] = [];
    
    for (const conversation of conversations) {
      if (conversation?.id) {
        const result = await validateConversationMessageCount(conversation.id);
        validationResults.push(result);
        
        // Pausa pequeña para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 3. Analizar resultados
    const validCounts = validationResults.filter(r => r.isValid).length;
    const invalidCounts = validationResults.filter(r => !r.isValid && r.reportedCount !== null).length;
    const missingCounts = validationResults.filter(r => r.reportedCount === null).length;

    const discrepancies = validationResults
      .filter(r => r.reportedCount !== null)
      .map(r => r.difference);

    const averageDiscrepancy = discrepancies.length > 0 
      ? discrepancies.reduce((sum, diff) => sum + diff, 0) / discrepancies.length 
      : 0;

    const maxDiscrepancy = Math.max(...discrepancies, 0);

    // 4. Determinar si necesita recálculo
    const errorThreshold = 0.1; // 10% de conversaciones con errores
    const errorRate = validationResults.length > 0 
      ? (invalidCounts + missingCounts) / validationResults.length 
      : 0;

    const needsRecalculation = errorRate > errorThreshold || maxDiscrepancy > 10;

    const summary: ValidationSummary = {
      totalConversations: validationResults.length,
      validCounts,
      invalidCounts,
      missingCounts,
      averageDiscrepancy,
      maxDiscrepancy,
      needsRecalculation
    };

    // 5. Mostrar resumen
    console.log('\n📊 RESUMEN DE VALIDACIÓN messageCount:');
    console.log(`📋 Total conversaciones validadas: ${summary.totalConversations}`);
    console.log(`✅ messageCount correcto: ${summary.validCounts} (${((summary.validCounts / summary.totalConversations) * 100).toFixed(1)}%)`);
    console.log(`❌ messageCount incorrecto: ${summary.invalidCounts}`);
    console.log(`❓ messageCount faltante: ${summary.missingCounts}`);
    console.log(`📊 Discrepancia promedio: ${summary.averageDiscrepancy.toFixed(1)}`);
    console.log(`📊 Discrepancia máxima: ${summary.maxDiscrepancy}`);
    console.log(`🔧 Necesita recálculo: ${summary.needsRecalculation ? '✅ SÍ' : '❌ NO'}`);

    // 6. Recomendaciones
    console.log('\n🎯 RECOMENDACIONES:');
    
    if (summary.needsRecalculation) {
      console.log('🔧 ACCIÓN REQUERIDA: messageCount tiene discrepancias significativas');
      console.log('   • Ejecutar script de recálculo en el backend');
      console.log('   • Verificar lógica de conteo en el backend');
      console.log('   • Considerar campo calculado dinámicamente');
    } else if (summary.missingCounts > 0) {
      console.log('ℹ️ OPCIONAL: Algunos messageCount están ausentes');
      console.log('   • Si no se usa en UI, se puede ignorar');
      console.log('   • Si se usa, inicializar valores faltantes');
    } else {
      console.log('✅ CORRECTO: messageCount está en buen estado');
      console.log('   • No se requiere acción');
    }

    // 7. Mostrar conversaciones problemáticas
    const problematicConversations = validationResults.filter(r => !r.isValid || r.difference > 5);
    if (problematicConversations.length > 0) {
      console.log('\n⚠️ CONVERSACIONES PROBLEMÁTICAS:');
      problematicConversations.forEach(conv => {
        console.log(`   ${conv.conversationId}: reportado=${conv.reportedCount}, real=${conv.actualCount}, diff=${conv.difference}`);
      });
    }

    return summary;

  } catch (error) {
    console.error('❌ Error general en validación:', error);
    throw error;
  }
}

/**
 * Verificar impacto en UI del messageCount
 */
export function analyzeMessageCountUsage(): {
  usedInUI: boolean;
  usageLocations: string[];
  recommendation: string;
} {
  console.log('🔍 Analizando uso de messageCount en la UI...');

  // En base al análisis del código, messageCount no se usa en UI crítica
  const usageAnalysis = {
    usedInUI: false,
    usageLocations: [
      'apiUtils.ts - Preservación de datos del backend',
      'useMessages.ts - Logging para debugging',
      'migrateFirestoreMessages.ts - Scripts de migración'
    ],
    recommendation: 'messageCount no se usa en UI crítica. Se puede mantener para compatibilidad con backend o remover sin impacto visual.'
  };

  console.log('📊 Análisis de uso:');
  console.log(`   🎨 Usado en UI: ${usageAnalysis.usedInUI ? 'SÍ' : 'NO'}`);
  console.log('   📍 Ubicaciones de uso:');
  usageAnalysis.usageLocations.forEach(location => {
    console.log(`      • ${location}`);
  });
  console.log(`   💡 Recomendación: ${usageAnalysis.recommendation}`);

  return usageAnalysis;
}

/**
 * Ejecutar validación completa si se llama directamente
 */
if (import.meta.url === new URL(import.meta.resolve('.')).href + 'validateMessageCount.ts') {
  Promise.all([
    validateAllMessageCounts(20),
    analyzeMessageCountUsage()
  ]).catch(console.error);
} 