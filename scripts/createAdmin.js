/**
 * Script para crear el primer usuario administrador
 * Ejecutar una sola vez al inicializar el sistema
 * 
 * Uso: node scripts/createAdmin.js
 */

require('dotenv').config();
const userModel = require('../src/models/userModel');
const logger = require('../src/utils/logger');

async function createAdmin() {
  try {
    console.log('🔧 Iniciando creación del usuario administrador...\n');

    // Datos del admin por defecto
    const adminData = {
      username: 'admin',
      email: 'admin@company.com',
      password: 'Admin123!@#', // Cambiar inmediatamente después de crear
      role: 'admin',
      name: 'Administrador del Sistema',
      department: 'admin'
    };

    // Verificar si ya existe un admin
    const existingAdmin = await userModel.findByEmailOrUsername(adminData.email, adminData.username);
    if (existingAdmin) {
      console.log('❌ Ya existe un usuario administrador en el sistema');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   ID: ${existingAdmin.id}\n`);
      console.log('💡 Si necesitas resetear la contraseña, usa el endpoint de cambio de contraseña');
      return;
    }

    // Crear el usuario admin
    const admin = await userModel.create(adminData);

    console.log('✅ Usuario administrador creado exitosamente!\n');
    console.log('📋 Detalles del usuario:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Created: ${admin.timestamps.created}\n`);

    console.log('🔑 Credenciales de acceso:');
    console.log(`   Username/Email: ${admin.username} o ${admin.email}`);
    console.log(`   Password: ${adminData.password}\n`);

    console.log('⚠️  IMPORTANTE:');
    console.log('   1. Cambia la contraseña inmediatamente después del primer login');
    console.log('   2. Guarda estas credenciales en un lugar seguro');
    console.log('   3. No compartas estas credenciales por medios inseguros\n');

    console.log('🚀 Ahora puedes hacer login usando:');
    console.log('   POST /api/users/auth/login');
    console.log('   Body: { "identifier": "admin", "password": "Admin123!@#" }\n');

    logger.info('Admin user created successfully', {
      username: admin.username,
      email: admin.email,
      userId: admin.id
    });

  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error.message);
    logger.error('Failed to create admin user', error);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  createAdmin()
    .then(() => {
      console.log('✨ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = createAdmin; 