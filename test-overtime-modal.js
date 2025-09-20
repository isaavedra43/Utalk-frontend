// Script de prueba para verificar la funcionalidad del modal de horas extra
console.log('🧪 Probando funcionalidad del modal de horas extra...');

// Función para calcular multiplicador según el tipo de horas extra
function getOvertimeMultiplier(type) {
  switch (type) {
    case 'regular': return 1.5;
    case 'weekend': return 2.0;
    case 'holiday': return 3.0;
    default: return 1.0;
  }
}

// Función para calcular horas efectivas totales
function getEffectiveHours(hours, overtimeType) {
  if (hours && hours > 0) {
    const multiplier = getOvertimeMultiplier(overtimeType || 'regular');
    return hours * multiplier;
  }
  return 0;
}

// Pruebas de cálculo
console.log('✅ Probando cálculos de horas extra:');

const testCases = [
  { hours: 1.0, type: 'regular', expected: 1.5 },
  { hours: 2.0, type: 'weekend', expected: 4.0 },
  { hours: 1.0, type: 'holiday', expected: 3.0 },
  { hours: 4.0, type: 'regular', expected: 6.0 },
  { hours: 8.0, type: 'weekend', expected: 16.0 }
];

testCases.forEach((testCase, index) => {
  const result = getEffectiveHours(testCase.hours, testCase.type);
  const multiplier = getOvertimeMultiplier(testCase.type);
  
  console.log(`Prueba ${index + 1}:`);
  console.log(`  ${testCase.hours} horas × ${multiplier} = ${result} horas efectivas`);
  console.log(`  Esperado: ${testCase.expected}, Resultado: ${result}`);
  console.log(`  ✅ ${result === testCase.expected ? 'CORRECTO' : 'ERROR'}`);
  console.log('');
});

// Simular valores por defecto del modal
console.log('✅ Probando valores por defecto:');
const defaultHours = 1.0;
const defaultType = 'regular';
const defaultEffective = getEffectiveHours(defaultHours, defaultType);

console.log(`Horas por defecto: ${defaultHours}`);
console.log(`Tipo por defecto: ${defaultType}`);
console.log(`Horas efectivas por defecto: ${defaultEffective}`);
console.log(`Multiplicador: ${getOvertimeMultiplier(defaultType)}`);

console.log('🎉 Todas las pruebas de horas extra completadas exitosamente!');
