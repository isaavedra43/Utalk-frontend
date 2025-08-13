import React, { useState, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  memory: {
    used: number;
    total: number;
    limit: number;
    percentage: number;
  };
  timing: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  fps: {
    current: number;
    average: number;
    min: number;
    max: number;
  };
  api: {
    averageResponseTime: number;
    totalRequests: number;
    successRate: number;
  };
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memory: { used: 0, total: 0, limit: 0, percentage: 0 },
    timing: { loadTime: 0, domContentLoaded: 0, firstPaint: 0, firstContentfulPaint: 0 },
    fps: { current: 0, average: 0, min: 60, max: 0 },
    api: { averageResponseTime: 0, totalRequests: 0, successRate: 100 }
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationId = useRef<number | undefined>(undefined);

  // Función para obtener métricas de memoria
  const getMemoryMetrics = () => {
    const perf = performance as Performance & { 
      memory?: { 
        usedJSHeapSize: number; 
        totalJSHeapSize: number; 
        jsHeapSizeLimit: number 
      } 
    };
    
    if (perf.memory) {
      const used = perf.memory.usedJSHeapSize / 1024 / 1024;
      const total = perf.memory.totalJSHeapSize / 1024 / 1024;
      const limit = perf.memory.jsHeapSizeLimit / 1024 / 1024;
      const percentage = (used / limit) * 100;
      
      return { used, total, limit, percentage };
    }
    
    return { used: 0, total: 0, limit: 0, percentage: 0 };
  };

  // Función para obtener métricas de timing
  const getTimingMetrics = () => {
    const navigationEntries = performance.getEntriesByType('navigation');
    const navigation = navigationEntries[0] as PerformanceNavigationTiming | undefined;
    
    if (navigation) {
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: 0, // Se obtiene de PerformanceObserver
        firstContentfulPaint: 0 // Se obtiene de PerformanceObserver
      };
    }
    
    return { loadTime: 0, domContentLoaded: 0, firstPaint: 0, firstContentfulPaint: 0 };
  };

  // Función para calcular FPS
  const calculateFPS = (currentTime: number) => {
    frameCount.current++;
    
    if (currentTime - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
      
      setFpsHistory(prev => {
        const newHistory = [...prev, fps].slice(-60); // Mantener últimos 60 frames
        const average = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
        const min = Math.min(...newHistory);
        const max = Math.max(...newHistory);
        
        setMetrics(prevMetrics => ({
          ...prevMetrics,
          fps: { current: fps, average: Math.round(average), min, max }
        }));
        
        return newHistory;
      });
      
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
    
    if (isMonitoring) {
      animationId.current = requestAnimationFrame(calculateFPS);
    }
  };

  // Función para interceptar requests de API
  const setupAPIMonitoring = () => {
    const originalFetch = window.fetch;
    let totalRequests = 0;
    let totalResponseTime = 0;
    let successfulRequests = 0;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      totalRequests++;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        totalResponseTime += responseTime;
        if (response.ok) successfulRequests++;
        
        const averageResponseTime = totalResponseTime / totalRequests;
        const successRate = (successfulRequests / totalRequests) * 100;
        
        setMetrics(prevMetrics => ({
          ...prevMetrics,
          api: {
            averageResponseTime: Math.round(averageResponseTime),
            totalRequests,
            successRate: Math.round(successRate)
          }
        }));
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        totalResponseTime += (endTime - startTime);
        
        const averageResponseTime = totalResponseTime / totalRequests;
        const successRate = (successfulRequests / totalRequests) * 100;
        
        setMetrics(prevMetrics => ({
          ...prevMetrics,
          api: {
            averageResponseTime: Math.round(averageResponseTime),
            totalRequests,
            successRate: Math.round(successRate)
          }
        }));
        
        throw error;
      }
    };
  };

  // Función para monitorear performance
  const startMonitoring = () => {
    setIsMonitoring(true);
    setupAPIMonitoring();
    animationId.current = requestAnimationFrame(calculateFPS);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
    }
  };

  // Actualizar métricas cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        memory: getMemoryMetrics(),
        timing: getTimingMetrics()
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Configurar PerformanceObserver para First Paint y First Contentful Paint
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          const paintEntry = entry as PerformancePaintTiming;
          if (paintEntry.name === 'first-paint') {
            setMetrics(prev => ({
              ...prev,
              timing: { ...prev.timing, firstPaint: Math.round(paintEntry.startTime) }
            }));
          } else if (paintEntry.name === 'first-contentful-paint') {
            setMetrics(prev => ({
              ...prev,
              timing: { ...prev.timing, firstContentfulPaint: Math.round(paintEntry.startTime) }
            }));
          }
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });

    return () => observer.disconnect();
  }, []);

  const getMemoryColor = (percentage: number) => {
    if (percentage > 80) return 'text-red-600';
    if (percentage > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getFPSColor = (fps: number) => {
    if (fps < 30) return 'text-red-600';
    if (fps < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAPIColor = (successRate: number) => {
    if (successRate < 80) return 'text-red-600';
    if (successRate < 95) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">⚡ Performance Monitor</h3>
        <div className="flex gap-2">
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`px-3 py-1 rounded text-sm ${
              isMonitoring 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>
      </div>

      {/* Métricas de Memoria */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
        <h4 className="font-semibold mb-2">🧠 Memory Usage</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Used</div>
            <div className={`font-semibold ${getMemoryColor(metrics.memory.percentage)}`}>
              {metrics.memory.used.toFixed(1)} MB
            </div>
          </div>
          <div>
            <div className="text-gray-600">Total</div>
            <div className="font-semibold">{metrics.memory.total.toFixed(1)} MB</div>
          </div>
          <div>
            <div className="text-gray-600">Limit</div>
            <div className="font-semibold">{metrics.memory.limit.toFixed(1)} MB</div>
          </div>
          <div>
            <div className="text-gray-600">Usage %</div>
            <div className={`font-semibold ${getMemoryColor(metrics.memory.percentage)}`}>
              {metrics.memory.percentage.toFixed(1)}%
            </div>
          </div>
        </div>
        {/* Barra de progreso de memoria */}
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              metrics.memory.percentage > 80 ? 'bg-red-500' :
              metrics.memory.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(metrics.memory.percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Métricas de FPS */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100">
        <h4 className="font-semibold mb-2">🎬 Frame Rate</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Current FPS</div>
            <div className={`font-semibold ${getFPSColor(metrics.fps.current)}`}>
              {metrics.fps.current}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Average FPS</div>
            <div className={`font-semibold ${getFPSColor(metrics.fps.average)}`}>
              {metrics.fps.average}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Min FPS</div>
            <div className="font-semibold text-red-600">{metrics.fps.min}</div>
          </div>
          <div>
            <div className="text-gray-600">Max FPS</div>
            <div className="font-semibold text-green-600">{metrics.fps.max}</div>
          </div>
        </div>
        {/* Gráfico de FPS */}
        <div className="mt-2 h-8 bg-gray-100 rounded flex items-end gap-px">
          {fpsHistory.slice(-20).map((fps, index) => (
            <div
              key={index}
              className={`flex-1 transition-all duration-300 ${
                fps < 30 ? 'bg-red-500' :
                fps < 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ height: `${(fps / 60) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Métricas de API */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100">
        <h4 className="font-semibold mb-2">🌐 API Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Avg Response Time</div>
            <div className="font-semibold">{metrics.api.averageResponseTime}ms</div>
          </div>
          <div>
            <div className="text-gray-600">Total Requests</div>
            <div className="font-semibold">{metrics.api.totalRequests}</div>
          </div>
          <div>
            <div className="text-gray-600">Success Rate</div>
            <div className={`font-semibold ${getAPIColor(metrics.api.successRate)}`}>
              {metrics.api.successRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Timing */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-yellow-100">
        <h4 className="font-semibold mb-2">⏱️ Page Load Times</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Load Time</div>
            <div className="font-semibold">{metrics.timing.loadTime}ms</div>
          </div>
          <div>
            <div className="text-gray-600">DOM Ready</div>
            <div className="font-semibold">{metrics.timing.domContentLoaded}ms</div>
          </div>
          <div>
            <div className="text-gray-600">First Paint</div>
            <div className="font-semibold">{metrics.timing.firstPaint}ms</div>
          </div>
          <div>
            <div className="text-gray-600">First Contentful Paint</div>
            <div className="font-semibold">{metrics.timing.firstContentfulPaint}ms</div>
          </div>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <h4 className="font-semibold mb-2">💻 System Info</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>User Agent: <span className="text-gray-600 font-mono text-xs break-all">{navigator.userAgent}</span></div>
          <div>Platform: <span className="text-gray-600">{navigator.platform}</span></div>
          <div>Language: <span className="text-gray-600">{navigator.language}</span></div>
          <div>Online: <span className={navigator.onLine ? 'text-green-600' : 'text-red-600'}>{navigator.onLine ? 'Yes' : 'No'}</span></div>
          <div>Connection: <span className="text-gray-600">{(navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'Unknown'}</span></div>
          <div>Hardware Concurrency: <span className="text-gray-600">{navigator.hardwareConcurrency || 'Unknown'}</span></div>
        </div>
      </div>
    </div>
  );
}; 