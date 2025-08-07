// Ejemplos de uso de validaciones - Extraído de PLAN_FRONTEND_UTALK_COMPLETO.md
// Documento sección "Implementación de Validaciones"

import { formatDateForDisplay, safeDateToISOString } from '../utils/dates';
import {
    formatFileSize,
    getFileTypeFromExtension,
    validateEmail,
    validateFileUpload,
    validateMessage,
    validatePassword,
    validatePhone,
    validateUUID
} from '../utils/validation';

// Ejemplo 1: Validación de teléfono - Documento: "Validación de Teléfonos"
export const phoneValidationExample = () => {
    console.log('=== Ejemplos de Validación de Teléfono ===');

    const validPhones = [
        '+521234567890',
        '+1234567890',
        '+447911123456'
    ];

    const invalidPhones = [
        '1234567890', // Sin +
        '+123', // Muy corto
        'abc', // No es número
        '+1234567890123456' // Muy largo
    ];

    validPhones.forEach(phone => {
        const isValid = validatePhone(phone);
        console.log(`${phone}: ${isValid ? '✅ Válido' : '❌ Inválido'}`);
    });

    invalidPhones.forEach(phone => {
        const isValid = validatePhone(phone);
        console.log(`${phone}: ${isValid ? '✅ Válido' : '❌ Inválido'}`);
    });
};

// Ejemplo 2: Validación de mensaje con emojis - Documento: "Consideraciones Especiales con Emojis"
export const messageValidationExample = () => {
    console.log('=== Ejemplos de Validación de Mensaje ===');

    const messages = [
        'Hola mundo', // Texto simple
        'Hola mundo 👋', // Con emoji
        'A'.repeat(4097), // Muy largo
        'Texto normal con algunos emojis 🚀🎉💯' // Múltiples emojis
    ];

    messages.forEach(message => {
        const result = validateMessage(message);
        console.log(`"${message}": ${result.valid ? '✅ Válido' : '❌ Inválido'}`);
        if (result.error) console.log(`  Error: ${result.error}`);
        if (result.remaining) console.log(`  Caracteres restantes: ${result.remaining}`);
    });
};

// Ejemplo 3: Validación de archivos - Documento: "Validación de Archivos"
export const fileValidationExample = () => {
    console.log('=== Ejemplos de Validación de Archivos ===');

    // Simular archivos para el ejemplo
    const mockFiles = [
        { name: 'documento.pdf', size: 1024 * 1024, type: 'application/pdf' }, // 1MB PDF
        { name: 'imagen.jpg', size: 5 * 1024 * 1024, type: 'image/jpeg' }, // 5MB JPG
        { name: 'video.mp4', size: 150 * 1024 * 1024, type: 'video/mp4' }, // 150MB MP4 (muy grande)
        { name: 'script.js', size: 1024, type: 'application/javascript' }, // JS bloqueado
        { name: 'documento.exe', size: 1024, type: 'application/x-msdownload' } // EXE bloqueado
    ] as File[];

    // Validar archivos individuales
    mockFiles.forEach(file => {
        const result = validateFileUpload([file]);
        console.log(`${file.name} (${formatFileSize(file.size)}): ${result.valid ? '✅ Válido' : '❌ Inválido'}`);
        if (result.error) console.log(`  Error: ${result.error}`);
    });

    // Validar múltiples archivos
    const multipleFiles = mockFiles.slice(0, 3); // Solo los válidos
    const result = validateFileUpload(multipleFiles);
    console.log(`Múltiples archivos (${multipleFiles.length}): ${result.valid ? '✅ Válido' : '❌ Inválido'}`);
    if (result.error) console.log(`  Error: ${result.error}`);
};

// Ejemplo 4: Validación de fechas - Documento: "Manejo de Datos: Formatos, Fechas e IDs"
export const dateValidationExample = () => {
    console.log('=== Ejemplos de Validación de Fechas ===');

    const dates = [
        '2025-01-15T10:30:00Z', // ISO string
        { _seconds: 1705312200, _nanoseconds: 0 }, // Firestore timestamp
        1705312200000, // Timestamp numérico
        new Date(), // Instancia de Date
        null, // null
        undefined // undefined
    ];

    dates.forEach((date, index) => {
        const isoString = safeDateToISOString(date);
        const displayDate = formatDateForDisplay(date);
        console.log(`Fecha ${index + 1}: ${isoString ? '✅ Válida' : '❌ Inválida'}`);
        console.log(`  ISO: ${isoString}`);
        console.log(`  Display: ${displayDate}`);
    });
};

// Ejemplo 5: Validación de UUID - Documento: "Validación de IDs"
export const uuidValidationExample = () => {
    console.log('=== Ejemplos de Validación de UUID ===');

    const uuids = [
        '123e4567-e89b-12d3-a456-426614174000', // UUID válido
        '550e8400-e29b-41d4-a716-446655440000', // UUID válido
        'invalid-uuid', // UUID inválido
        '123e4567-e89b-12d3-a456', // UUID incompleto
        '550e8400-e29b-41d4-a716-44665544000x' // UUID con caracteres inválidos
    ];

    uuids.forEach(uuid => {
        const isValid = validateUUID(uuid);
        console.log(`${uuid}: ${isValid ? '✅ Válido' : '❌ Inválido'}`);
    });
};

// Ejemplo 6: Validación de email y contraseña - Documento: "Validaciones en Formularios"
export const authValidationExample = () => {
    console.log('=== Ejemplos de Validación de Autenticación ===');

    const emails = [
        'admin@company.com', // Email válido
        'user@example.com', // Email válido
        'invalid-email', // Email inválido
        '', // Email vacío
        'user@' // Email incompleto
    ];

    const passwords = [
        '123456', // Contraseña válida
        'password123', // Contraseña válida
        '123', // Contraseña muy corta
        '', // Contraseña vacía
        'abcdefghijklmnopqrstuvwxyz' // Contraseña muy larga
    ];

    console.log('--- Validación de Emails ---');
    emails.forEach(email => {
        const result = validateEmail(email);
        console.log(`${email}: ${result.valid ? '✅ Válido' : '❌ Inválido'}`);
        if (result.error) console.log(`  Error: ${result.error}`);
    });

    console.log('--- Validación de Contraseñas ---');
    passwords.forEach(password => {
        const result = validatePassword(password);
        console.log(`${password}: ${result.valid ? '✅ Válido' : '❌ Inválido'}`);
        if (result.error) console.log(`  Error: ${result.error}`);
    });
};

// Ejemplo 7: Utilidades de archivos - Documento: "Validación de Archivos"
export const fileUtilityExample = () => {
    console.log('=== Ejemplos de Utilidades de Archivos ===');

    const files = [
        { name: 'documento.pdf', size: 1024 * 1024 },
        { name: 'imagen.jpg', size: 5 * 1024 * 1024 },
        { name: 'video.mp4', size: 150 * 1024 * 1024 },
        { name: 'audio.mp3', size: 2 * 1024 * 1024 }
    ];

    files.forEach(file => {
        const size = formatFileSize(file.size);
        const type = getFileTypeFromExtension(file.name);
        console.log(`${file.name}: ${size} (${type})`);
    });
};

// Función para ejecutar todos los ejemplos
export const runAllValidationExamples = () => {
    console.log('🚀 Ejecutando todos los ejemplos de validación...\n');

    phoneValidationExample();
    console.log('\n');

    messageValidationExample();
    console.log('\n');

    fileValidationExample();
    console.log('\n');

    dateValidationExample();
    console.log('\n');

    uuidValidationExample();
    console.log('\n');

    authValidationExample();
    console.log('\n');

    fileUtilityExample();
    console.log('\n');

    console.log('✅ Todos los ejemplos completados');
}; 