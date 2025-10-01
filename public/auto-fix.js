/**
 * Script de auto-reparación para UTalk
 * Se ejecuta automáticamente para detectar y corregir problemas comunes
 */

(function() {
    'use strict';
    
    console.log('🔧 Auto-fix script iniciado');
    
    // ✅ Detectar y corregir problemas comunes
    function detectAndFixIssues() {
        const issues = [];
        
        // 1. Verificar si hay tokens corruptos
        try {
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            
            if (accessToken && accessToken.includes('undefined') || accessToken === 'null') {
                issues.push('Token de acceso corrupto detectado');
                localStorage.removeItem('access_token');
            }
            
            if (refreshToken && refreshToken.includes('undefined') || refreshToken === 'null') {
                issues.push('Token de refresh corrupto detectado');
                localStorage.removeItem('refresh_token');
            }
        } catch (error) {
            console.warn('Error verificando tokens:', error);
        }
        
        // 2. Verificar si hay datos de usuario corruptos
        try {
            const backendUser = localStorage.getItem('backend_user');
            if (backendUser && (backendUser.includes('undefined') || backendUser === 'null')) {
                issues.push('Datos de usuario corruptos detectados');
                localStorage.removeItem('backend_user');
            }
        } catch (error) {
            console.warn('Error verificando datos de usuario:', error);
        }
        
        // 3. Verificar si hay cache corrupto
        try {
            const cacheKeys = Object.keys(localStorage);
            const corruptKeys = cacheKeys.filter(key => {
                try {
                    const value = localStorage.getItem(key);
                    return value && (value.includes('undefined') || value === 'null');
                } catch {
                    return true;
                }
            });
            
            if (corruptKeys.length > 0) {
                issues.push(`${corruptKeys.length} claves de cache corruptas detectadas`);
                corruptKeys.forEach(key => localStorage.removeItem(key));
            }
        } catch (error) {
            console.warn('Error verificando cache:', error);
        }
        
        return issues;
    }
    
    // ✅ Limpiar service workers problemáticos
    function cleanupServiceWorkers() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    if (registration.scope.includes('utalk') || registration.scope.includes('localhost')) {
                        console.log('🔧 Limpiando service worker problemático:', registration.scope);
                        registration.unregister();
                    }
                });
            }).catch(error => {
                console.warn('Error limpiando service workers:', error);
            });
        }
    }
    
    // ✅ Verificar si la página está cargando correctamente
    function checkPageHealth() {
        setTimeout(() => {
            const root = document.getElementById('root');
            if (root && root.children.length === 0) {
                console.warn('⚠️ Página no cargando correctamente, verificando problemas...');
                
                // Verificar si hay errores de consola
                const originalError = console.error;
                let errorCount = 0;
                
                console.error = function(...args) {
                    errorCount++;
                    if (errorCount > 5) {
                        console.warn('🚨 Múltiples errores detectados, sugiriendo limpieza');
                        showRecoveryOptions();
                    }
                    originalError.apply(console, args);
                };
            }
        }, 3000);
    }
    
    // ✅ Mostrar opciones de recuperación
    function showRecoveryOptions() {
        const recoveryDiv = document.createElement('div');
        recoveryDiv.id = 'auto-recovery-banner';
        recoveryDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 12px 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        recoveryDiv.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
                <span>⚠️ Problemas detectados en la aplicación</span>
                <button id="auto-fix-btn" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 6px;
                    padding: 6px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                ">🔧 Auto-reparar</button>
                <button id="manual-fix-btn" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 6px;
                    padding: 6px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                ">🧹 Limpieza Manual</button>
                <button id="dismiss-banner" style="
                    background: none;
                    color: white;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                ">×</button>
            </div>
        `;
        
        document.body.appendChild(recoveryDiv);
        
        // Event listeners
        document.getElementById('auto-fix-btn')?.addEventListener('click', () => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        });
        
        document.getElementById('manual-fix-btn')?.addEventListener('click', () => {
            window.location.href = '/force-clean-reload.html';
        });
        
        document.getElementById('dismiss-banner')?.addEventListener('click', () => {
            recoveryDiv.remove();
        });
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            if (document.getElementById('auto-recovery-banner')) {
                recoveryDiv.remove();
            }
        }, 10000);
    }
    
    // ✅ Ejecutar auto-reparación
    function runAutoFix() {
        const issues = detectAndFixIssues();
        
        if (issues.length > 0) {
            console.log('🔧 Problemas detectados y corregidos:', issues);
        } else {
            console.log('✅ No se detectaron problemas');
        }
        
        cleanupServiceWorkers();
        checkPageHealth();
    }
    
    // ✅ Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAutoFix);
    } else {
        runAutoFix();
    }
    
    // ✅ Ejecutar también después de un pequeño delay para capturar problemas tardíos
    setTimeout(runAutoFix, 2000);
    
})();
