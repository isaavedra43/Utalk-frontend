#!/usr/bin/env node
/**
 * Health Check Script
 * Valida que todos los servicios estén funcionando correctamente
 * Usado para monitoreo y validación post-deploy
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const DEFAULT_BASE_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:3000';
const TIMEOUT = parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 10000;

console.log('🏥 Iniciando health check completo...');

class HealthChecker {
  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
    this.results = {
      overall: 'UNKNOWN',
      timestamp: new Date().toISOString(),
      checks: {},
      errors: [],
      warnings: []
    };
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        method: 'GET',
        timeout: TIMEOUT,
        headers: {
          'User-Agent': 'HealthCheck/1.0',
          'Accept': 'application/json',
          ...options.headers
        },
        ...options
      };

      const req = client.request(parsedUrl, requestOptions, (res) => {
        let data = '';
        
        res.on('data', chunk => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : null;
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: jsonData,
              rawData: data
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: null,
              rawData: data
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${TIMEOUT}ms`));
      });

      req.end();
    });
  }

  async checkBackendHealth() {
    console.log('🔍 Verificando backend health...');
    
    try {
      const response = await this.makeRequest(`${this.baseUrl}/health`);
      
      if (response.statusCode === 200 && response.data) {
        this.results.checks.backend = {
          status: 'HEALTHY',
          responseTime: Date.now(),
          data: response.data
        };
        console.log('✅ Backend health: OK');
        return true;
      } else {
        this.results.checks.backend = {
          status: 'UNHEALTHY',
          statusCode: response.statusCode,
          data: response.data || response.rawData
        };
        this.results.errors.push(`Backend health check failed: HTTP ${response.statusCode}`);
        console.log(`❌ Backend health: FAILED (${response.statusCode})`);
        return false;
      }
    } catch (error) {
      this.results.checks.backend = {
        status: 'ERROR',
        error: error.message
      };
      this.results.errors.push(`Backend health check error: ${error.message}`);
      console.log(`💥 Backend health: ERROR (${error.message})`);
      return false;
    }
  }

  async checkApiHealth() {
    console.log('🔍 Verificando API health...');
    
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/health`);
      
      if (response.statusCode === 200) {
        this.results.checks.api = {
          status: 'HEALTHY',
          data: response.data
        };
        console.log('✅ API health: OK');
        return true;
      } else {
        this.results.checks.api = {
          status: 'UNHEALTHY',
          statusCode: response.statusCode
        };
        this.results.errors.push(`API health check failed: HTTP ${response.statusCode}`);
        console.log(`❌ API health: FAILED (${response.statusCode})`);
        return false;
      }
    } catch (error) {
      this.results.checks.api = {
        status: 'ERROR',
        error: error.message
      };
      this.results.errors.push(`API health check error: ${error.message}`);
      console.log(`💥 API health: ERROR (${error.message})`);
      return false;
    }
  }

  async checkFrontendHealth() {
    console.log('🔍 Verificando frontend...');
    
    try {
      const response = await this.makeRequest(this.baseUrl);
      
      if (response.statusCode === 200 && response.rawData.includes('<html')) {
        this.results.checks.frontend = {
          status: 'HEALTHY',
          size: response.rawData.length
        };
        console.log('✅ Frontend: OK');
        return true;
      } else {
        this.results.checks.frontend = {
          status: 'UNHEALTHY',
          statusCode: response.statusCode
        };
        this.results.errors.push(`Frontend check failed: HTTP ${response.statusCode}`);
        console.log(`❌ Frontend: FAILED (${response.statusCode})`);
        return false;
      }
    } catch (error) {
      this.results.checks.frontend = {
        status: 'ERROR',
        error: error.message
      };
      this.results.errors.push(`Frontend check error: ${error.message}`);
      console.log(`💥 Frontend: ERROR (${error.message})`);
      return false;
    }
  }

  async checkSpaRouting() {
    console.log('🔍 Verificando SPA routing...');
    
    const testRoutes = ['/dashboard', '/campaigns', '/crm', '/settings'];
    let successCount = 0;
    
    for (const route of testRoutes) {
      try {
        const response = await this.makeRequest(`${this.baseUrl}${route}`);
        
        if (response.statusCode === 200 && response.rawData.includes('<html')) {
          successCount++;
        } else {
          this.results.warnings.push(`SPA route ${route} returned ${response.statusCode}`);
        }
      } catch (error) {
        this.results.warnings.push(`SPA route ${route} error: ${error.message}`);
      }
    }
    
    const success = successCount === testRoutes.length;
    this.results.checks.spaRouting = {
      status: success ? 'HEALTHY' : 'DEGRADED',
      successfulRoutes: successCount,
      totalRoutes: testRoutes.length
    };
    
    if (success) {
      console.log('✅ SPA Routing: OK');
    } else {
      console.log(`⚠️ SPA Routing: DEGRADED (${successCount}/${testRoutes.length})`);
    }
    
    return success;
  }

  async checkApi404Handling() {
    console.log('🔍 Verificando manejo de 404 en API...');
    
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/nonexistent-endpoint`);
      
      if (response.statusCode === 404 && response.data) {
        this.results.checks.api404 = {
          status: 'HEALTHY',
          properly404: true
        };
        console.log('✅ API 404 handling: OK');
        return true;
      } else {
        this.results.checks.api404 = {
          status: 'UNHEALTHY',
          statusCode: response.statusCode,
          expected404: true
        };
        this.results.warnings.push(`API 404 handling incorrect: got ${response.statusCode} instead of 404`);
        console.log(`⚠️ API 404 handling: INCORRECT (${response.statusCode})`);
        return false;
      }
    } catch (error) {
      this.results.checks.api404 = {
        status: 'ERROR',
        error: error.message
      };
      this.results.warnings.push(`API 404 check error: ${error.message}`);
      console.log(`💥 API 404 handling: ERROR (${error.message})`);
      return false;
    }
  }

  checkLocalFiles() {
    console.log('🔍 Verificando archivos locales...');
    
    const criticalFiles = [
      'dist/index.html',
      'package.json',
      'server.js',
      'src/app.js'
    ];
    
    const missingFiles = [];
    const presentFiles = [];
    
    for (const file of criticalFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        presentFiles.push(file);
      } else {
        missingFiles.push(file);
      }
    }
    
    this.results.checks.localFiles = {
      status: missingFiles.length === 0 ? 'HEALTHY' : 'UNHEALTHY',
      presentFiles,
      missingFiles
    };
    
    if (missingFiles.length === 0) {
      console.log('✅ Archivos locales: OK');
      return true;
    } else {
      this.results.errors.push(`Missing critical files: ${missingFiles.join(', ')}`);
      console.log(`❌ Archivos locales: MISSING (${missingFiles.join(', ')})`);
      return false;
    }
  }

  async runAllChecks() {
    console.log(`🏥 Health check iniciado para: ${this.baseUrl}\n`);
    
    const checks = [
      () => this.checkLocalFiles(),
      () => this.checkBackendHealth(),
      () => this.checkApiHealth(),
      () => this.checkFrontendHealth(),
      () => this.checkSpaRouting(),
      () => this.checkApi404Handling()
    ];
    
    let healthyCount = 0;
    
    for (const check of checks) {
      try {
        const isHealthy = await check();
        if (isHealthy) healthyCount++;
      } catch (error) {
        this.results.errors.push(`Check failed: ${error.message}`);
      }
    }
    
    // Determinar estado general
    if (healthyCount === checks.length) {
      this.results.overall = 'HEALTHY';
    } else if (healthyCount >= checks.length * 0.7) {
      this.results.overall = 'DEGRADED';
    } else {
      this.results.overall = 'UNHEALTHY';
    }
    
    this.generateReport();
    return this.results.overall === 'HEALTHY';
  }

  generateReport() {
    console.log('\n📋 REPORTE DE HEALTH CHECK');
    console.log('═'.repeat(50));
    console.log(`Estado general: ${this.getStatusIcon(this.results.overall)} ${this.results.overall}`);
    console.log(`Timestamp: ${this.results.timestamp}`);
    console.log(`URL base: ${this.baseUrl}`);
    
    console.log('\n🔍 Checks individuales:');
    Object.entries(this.results.checks).forEach(([name, check]) => {
      console.log(`  ${this.getStatusIcon(check.status)} ${name}: ${check.status}`);
    });
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 Errores:');
      this.results.errors.forEach(error => console.log(`  ❌ ${error}`));
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️ Advertencias:');
      this.results.warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
    }
    
    console.log('\n' + '═'.repeat(50));
  }

  getStatusIcon(status) {
    switch (status) {
      case 'HEALTHY': return '✅';
      case 'DEGRADED': return '⚠️';
      case 'UNHEALTHY': return '❌';
      case 'ERROR': return '💥';
      default: return '❓';
    }
  }
}

// Ejecutar health check
if (require.main === module) {
  const checker = new HealthChecker();
  checker.runAllChecks()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Health check failed:', error);
      process.exit(1);
    });
}

module.exports = HealthChecker; 