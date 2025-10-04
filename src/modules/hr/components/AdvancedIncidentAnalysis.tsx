import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  Shield,
  Clock,
  Users,
  MapPin,
  DollarSign,
  BarChart3,
  Zap,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import type { Incident, IncidentsSummary } from '../../../services/incidentsService';

// ============================================================================
// TYPES
// ============================================================================

interface AIAnalysis {
  id: string;
  timestamp: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  insights: {
    patterns: PatternAnalysis[];
    trends: TrendAnalysis[];
    recommendations: Recommendation[];
    alerts: Alert[];
    predictions: Prediction[];
  };
  confidence: number;
  lastUpdated: string;
}

interface PatternAnalysis {
  type: 'temporal' | 'location' | 'personnel' | 'cost' | 'severity';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  data: any;
}

interface TrendAnalysis {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  period: string;
  significance: 'low' | 'medium' | 'high';
}

interface Recommendation {
  category: 'prevention' | 'process' | 'training' | 'equipment' | 'policy';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: string;
  cost: 'low' | 'medium' | 'high';
}

interface Alert {
  type: 'risk' | 'trend' | 'anomaly' | 'compliance';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  deadline?: string;
}

interface Prediction {
  type: 'risk' | 'cost' | 'frequency' | 'severity';
  timeframe: string;
  prediction: string;
  confidence: number;
  factors: string[];
}

interface AdvancedIncidentAnalysisProps {
  incidents: Incident[];
  summary: IncidentsSummary | null;
  onAnalysisUpdate?: (analysis: AIAnalysis) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const AdvancedIncidentAnalysis: React.FC<AdvancedIncidentAnalysisProps> = ({
  incidents,
  summary,
  onAnalysisUpdate
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // ============================================================================
  // AI ANALYSIS ENGINE
  // ============================================================================

  const generateAIAnalysis = async (): Promise<AIAnalysis> => {
    setIsGenerating(true);
    
    try {
      // Simular delay de IA (en producción sería una llamada real a IA)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const now = new Date();
      const analysisId = `analysis_${now.getTime()}`;
      
      // Análisis de patrones
      const patterns = analyzePatterns(incidents);
      
      // Análisis de tendencias
      const trends = analyzeTrends(incidents, summary);
      
      // Generar recomendaciones
      const recommendations = generateRecommendations(incidents, patterns, trends);
      
      // Generar alertas
      const alerts = generateAlerts(incidents, patterns, trends);
      
      // Predicciones
      const predictions = generatePredictions(incidents, trends);
      
      // Calcular nivel de riesgo general
      const riskLevel = calculateRiskLevel(patterns, trends, alerts);
      
      // Calcular confianza general
      const confidence = calculateConfidence(patterns, trends);
      
      const aiAnalysis: AIAnalysis = {
        id: analysisId,
        timestamp: now.toISOString(),
        riskLevel,
        insights: {
          patterns,
          trends,
          recommendations,
          alerts,
          predictions
        },
        confidence,
        lastUpdated: now.toLocaleString('es-MX')
      };
      
      setAnalysis(aiAnalysis);
      setLastUpdate(now.toLocaleString('es-MX'));
      onAnalysisUpdate?.(aiAnalysis);
      
      return aiAnalysis;
    } catch (error) {
      console.error('Error generando análisis de IA:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // ============================================================================
  // ANALYSIS FUNCTIONS
  // ============================================================================

  const analyzePatterns = (incidents: Incident[]): PatternAnalysis[] => {
    const patterns: PatternAnalysis[] = [];
    
    // Análisis temporal
    const timePatterns = analyzeTimePatterns(incidents);
    if (timePatterns) patterns.push(timePatterns);
    
    // Análisis de ubicación
    const locationPatterns = analyzeLocationPatterns(incidents);
    if (locationPatterns) patterns.push(locationPatterns);
    
    // Análisis de personal
    const personnelPatterns = analyzePersonnelPatterns(incidents);
    if (personnelPatterns) patterns.push(personnelPatterns);
    
    // Análisis de costos
    const costPatterns = analyzeCostPatterns(incidents);
    if (costPatterns) patterns.push(costPatterns);
    
    // Análisis de severidad
    const severityPatterns = analyzeSeverityPatterns(incidents);
    if (severityPatterns) patterns.push(severityPatterns);
    
    return patterns;
  };

  const analyzeTimePatterns = (incidents: Incident[]): PatternAnalysis | null => {
    if (incidents.length < 3) return null;
    
    const daysOfWeek = [0, 0, 0, 0, 0, 0, 0]; // Domingo a Sábado
    const hoursOfDay = new Array(24).fill(0);
    
    incidents.forEach(incident => {
      const date = new Date(incident.date);
      const dayOfWeek = date.getDay();
      const hour = parseInt(incident.time.split(':')[0]);
      
      daysOfWeek[dayOfWeek]++;
      hoursOfDay[hour]++;
    });
    
    const maxDay = daysOfWeek.indexOf(Math.max(...daysOfWeek));
    const maxHour = hoursOfDay.indexOf(Math.max(...hoursOfDay));
    
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    return {
      type: 'temporal',
      title: 'Patrón Temporal Detectado',
      description: `Mayor concentración de incidencias los ${dayNames[maxDay]}s entre las ${maxHour}:00-${maxHour + 1}:00 horas`,
      impact: 'medium',
      confidence: 85,
      data: { daysOfWeek, hoursOfDay, peakDay: maxDay, peakHour: maxHour }
    };
  };

  const analyzeLocationPatterns = (incidents: Incident[]): PatternAnalysis | null => {
    if (incidents.length < 3) return null;
    
    const locationCounts: Record<string, number> = {};
    incidents.forEach(incident => {
      locationCounts[incident.location] = (locationCounts[incident.location] || 0) + 1;
    });
    
    const sortedLocations = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a);
    
    if (sortedLocations.length > 0) {
      const [topLocation, count] = sortedLocations[0];
      const percentage = (count / incidents.length) * 100;
      
      return {
        type: 'location',
        title: 'Zona de Alto Riesgo Identificada',
        description: `${topLocation} concentra el ${percentage.toFixed(1)}% de las incidencias (${count} de ${incidents.length})`,
        impact: percentage > 40 ? 'high' : 'medium',
        confidence: 90,
        data: { locationCounts, topLocation, percentage }
      };
    }
    
    return null;
  };

  const analyzePersonnelPatterns = (incidents: Incident[]): PatternAnalysis | null => {
    if (incidents.length < 3) return null;
    
    const personnelCounts: Record<string, number> = {};
    incidents.forEach(incident => {
      incident.involvedPersons.forEach(person => {
        personnelCounts[person] = (personnelCounts[person] || 0) + 1;
      });
    });
    
    const sortedPersonnel = Object.entries(personnelCounts)
      .sort(([,a], [,b]) => b - a);
    
    if (sortedPersonnel.length > 0) {
      const [topPerson, count] = sortedPersonnel[0];
      
      return {
        type: 'personnel',
        title: 'Personal de Alto Riesgo',
        description: `${topPerson} está involucrado en ${count} incidencias, requiriendo atención especial`,
        impact: count > 2 ? 'high' : 'medium',
        confidence: 80,
        data: { personnelCounts, topPerson, count }
      };
    }
    
    return null;
  };

  const analyzeCostPatterns = (incidents: Incident[]): PatternAnalysis | null => {
    const incidentsWithCost = incidents.filter(inc => inc.cost && inc.cost > 0);
    if (incidentsWithCost.length < 2) return null;
    
    const totalCost = incidentsWithCost.reduce((sum, inc) => sum + (inc.cost || 0), 0);
    const avgCost = totalCost / incidentsWithCost.length;
    const maxCost = Math.max(...incidentsWithCost.map(inc => inc.cost || 0));
    
    return {
      type: 'cost',
      title: 'Análisis de Impacto Financiero',
      description: `Costo promedio por incidencia: $${avgCost.toLocaleString('es-MX')}. Costo máximo: $${maxCost.toLocaleString('es-MX')}`,
      impact: avgCost > 10000 ? 'high' : avgCost > 5000 ? 'medium' : 'low',
      confidence: 95,
      data: { totalCost, avgCost, maxCost, incidentsWithCost: incidentsWithCost.length }
    };
  };

  const analyzeSeverityPatterns = (incidents: Incident[]): PatternAnalysis | null => {
    const severityCounts: Record<string, number> = {};
    incidents.forEach(incident => {
      severityCounts[incident.severity] = (severityCounts[incident.severity] || 0) + 1;
    });
    
    const criticalHigh = (severityCounts.critical || 0) + (severityCounts.high || 0);
    const percentage = (criticalHigh / incidents.length) * 100;
    
    if (percentage > 30) {
      return {
        type: 'severity',
        title: 'Alto Nivel de Severidad',
        description: `${percentage.toFixed(1)}% de las incidencias son de severidad alta o crítica`,
        impact: 'high',
        confidence: 88,
        data: { severityCounts, criticalHigh, percentage }
      };
    }
    
    return null;
  };

  const analyzeTrends = (incidents: Incident[], summary: IncidentsSummary | null): TrendAnalysis[] => {
    const trends: TrendAnalysis[] = [];
    
    // Análisis de tendencia mensual
    const monthlyTrend = analyzeMonthlyTrend(incidents);
    if (monthlyTrend) trends.push(monthlyTrend);
    
    // Análisis de tendencia de severidad
    const severityTrend = analyzeSeverityTrend(incidents);
    if (severityTrend) trends.push(severityTrend);
    
    // Análisis de tendencia de costos
    const costTrend = analyzeCostTrend(incidents);
    if (costTrend) trends.push(costTrend);
    
    return trends;
  };

  const analyzeMonthlyTrend = (incidents: Incident[]): TrendAnalysis | null => {
    if (incidents.length < 6) return null;
    
    const monthlyCounts: Record<string, number> = {};
    incidents.forEach(incident => {
      const month = incident.date.substring(0, 7); // YYYY-MM
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });
    
    const months = Object.keys(monthlyCounts).sort();
    if (months.length < 3) return null;
    
    const firstHalf = months.slice(0, Math.floor(months.length / 2));
    const secondHalf = months.slice(Math.floor(months.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, month) => sum + monthlyCounts[month], 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, month) => sum + monthlyCounts[month], 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    return {
      metric: 'Frecuencia de Incidencias',
      direction: change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable',
      percentage: Math.abs(change),
      period: 'Últimos 6 meses',
      significance: Math.abs(change) > 25 ? 'high' : Math.abs(change) > 10 ? 'medium' : 'low'
    };
  };

  const analyzeSeverityTrend = (incidents: Incident[]): TrendAnalysis | null => {
    if (incidents.length < 6) return null;
    
    const sortedIncidents = incidents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstHalf = sortedIncidents.slice(0, Math.floor(sortedIncidents.length / 2));
    const secondHalf = sortedIncidents.slice(Math.floor(sortedIncidents.length / 2));
    
    const firstSeverity = firstHalf.filter(inc => inc.severity === 'high' || inc.severity === 'critical').length;
    const secondSeverity = secondHalf.filter(inc => inc.severity === 'high' || inc.severity === 'critical').length;
    
    const firstPercentage = (firstSeverity / firstHalf.length) * 100;
    const secondPercentage = (secondSeverity / secondHalf.length) * 100;
    
    const change = secondPercentage - firstPercentage;
    
    return {
      metric: 'Severidad de Incidencias',
      direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      percentage: Math.abs(change),
      period: 'Tendencia temporal',
      significance: Math.abs(change) > 15 ? 'high' : Math.abs(change) > 5 ? 'medium' : 'low'
    };
  };

  const analyzeCostTrend = (incidents: Incident[]): TrendAnalysis | null => {
    const incidentsWithCost = incidents.filter(inc => inc.cost && inc.cost > 0);
    if (incidentsWithCost.length < 4) return null;
    
    const sortedIncidents = incidentsWithCost.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstHalf = sortedIncidents.slice(0, Math.floor(sortedIncidents.length / 2));
    const secondHalf = sortedIncidents.slice(Math.floor(sortedIncidents.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, inc) => sum + (inc.cost || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, inc) => sum + (inc.cost || 0), 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    return {
      metric: 'Costo Promedio',
      direction: change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable',
      percentage: Math.abs(change),
      period: 'Tendencia de costos',
      significance: Math.abs(change) > 25 ? 'high' : Math.abs(change) > 10 ? 'medium' : 'low'
    };
  };

  const generateRecommendations = (incidents: Incident[], patterns: PatternAnalysis[], trends: TrendAnalysis[]): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // Recomendaciones basadas en patrones
    patterns.forEach(pattern => {
      switch (pattern.type) {
        case 'temporal':
          recommendations.push({
            category: 'process',
            priority: 'medium',
            title: 'Optimizar Horarios de Supervisión',
            description: `Aumentar supervisión los ${pattern.data.peakDay === 0 ? 'domingos' : ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][pattern.data.peakDay - 1]}s entre las ${pattern.data.peakHour}:00-${pattern.data.peakHour + 1}:00`,
            expectedImpact: 'Reducción del 15-20% en incidencias en horarios críticos',
            implementation: 'Reasignar personal de supervisión y establecer rondas adicionales',
            cost: 'medium'
          });
          break;
          
        case 'location':
          recommendations.push({
            category: 'prevention',
            priority: 'high',
            title: 'Auditoría de Seguridad en Zona Crítica',
            description: `Realizar auditoría completa de seguridad en ${pattern.data.topLocation}`,
            expectedImpact: 'Reducción del 30-40% en incidencias en esta ubicación',
            implementation: 'Contratar auditoría externa y implementar mejoras identificadas',
            cost: 'high'
          });
          break;
          
        case 'personnel':
          recommendations.push({
            category: 'training',
            priority: 'high',
            title: 'Programa de Capacitación Personalizado',
            description: `Desarrollar programa de capacitación específico para ${pattern.data.topPerson}`,
            expectedImpact: 'Reducción del 50% en incidencias relacionadas con este personal',
            implementation: 'Análisis de competencias y capacitación dirigida',
            cost: 'medium'
          });
          break;
      }
    });
    
    // Recomendaciones basadas en tendencias
    trends.forEach(trend => {
      if (trend.direction === 'increasing' && trend.significance === 'high') {
        recommendations.push({
          category: 'policy',
          priority: 'urgent',
          title: 'Revisión Urgente de Políticas',
          description: `Tendencia creciente en ${trend.metric.toLowerCase()} requiere intervención inmediata`,
          expectedImpact: 'Estabilización de la tendencia en 30-60 días',
          implementation: 'Revisión de políticas y procedimientos existentes',
          cost: 'low'
        });
      }
    });
    
    // Recomendaciones generales
    if (incidents.length > 10) {
      recommendations.push({
        category: 'equipment',
        priority: 'medium',
        title: 'Sistema de Monitoreo Automatizado',
        description: 'Implementar sistema de monitoreo en tiempo real para detección temprana',
        expectedImpact: 'Reducción del 25% en tiempo de respuesta a incidencias',
        implementation: 'Instalación de sensores y sistema de alertas',
        cost: 'high'
      });
    }
    
    return recommendations.slice(0, 5); // Limitar a 5 recomendaciones
  };

  const generateAlerts = (incidents: Incident[], patterns: PatternAnalysis[], trends: TrendAnalysis[]): Alert[] => {
    const alerts: Alert[] = [];
    
    // Alertas basadas en patrones críticos
    patterns.forEach(pattern => {
      if (pattern.impact === 'high' && pattern.confidence > 80) {
        alerts.push({
          type: 'risk',
          severity: 'warning',
          title: `Patrón Crítico Detectado: ${pattern.title}`,
          message: pattern.description,
          actionRequired: true,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 días
        });
      }
    });
    
    // Alertas basadas en tendencias
    trends.forEach(trend => {
      if (trend.direction === 'increasing' && trend.significance === 'high') {
        alerts.push({
          type: 'trend',
          severity: 'critical',
          title: `Tendencia Alarmante: ${trend.metric}`,
          message: `Incremento del ${trend.percentage.toFixed(1)}% en ${trend.period}`,
          actionRequired: true,
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 días
        });
      }
    });
    
    // Alertas de cumplimiento
    const criticalIncidents = incidents.filter(inc => inc.severity === 'critical');
    if (criticalIncidents.length > 0) {
      alerts.push({
        type: 'compliance',
        severity: 'warning',
        title: 'Incidencias Críticas Pendientes',
        message: `${criticalIncidents.length} incidencia(s) crítica(s) requieren atención inmediata`,
        actionRequired: true
      });
    }
    
    return alerts;
  };

  const generatePredictions = (incidents: Incident[], trends: TrendAnalysis[]): Prediction[] => {
    const predictions: Prediction[] = [];
    
    // Predicción de frecuencia
    if (incidents.length >= 6) {
      const monthlyTrend = trends.find(t => t.metric === 'Frecuencia de Incidencias');
      if (monthlyTrend) {
        predictions.push({
          type: 'frequency',
          timeframe: 'Próximos 3 meses',
          prediction: monthlyTrend.direction === 'increasing' 
            ? `Se espera un incremento del ${monthlyTrend.percentage.toFixed(1)}% en la frecuencia de incidencias`
            : monthlyTrend.direction === 'decreasing'
            ? `Se espera una reducción del ${monthlyTrend.percentage.toFixed(1)}% en la frecuencia de incidencias`
            : 'Se mantendrá la frecuencia actual de incidencias',
          confidence: 75,
          factors: ['Tendencia histórica', 'Patrones estacionales', 'Factores operacionales']
        });
      }
    }
    
    // Predicción de costos
    const incidentsWithCost = incidents.filter(inc => inc.cost && inc.cost > 0);
    if (incidentsWithCost.length >= 4) {
      const costTrend = trends.find(t => t.metric === 'Costo Promedio');
      if (costTrend) {
        const avgCost = incidentsWithCost.reduce((sum, inc) => sum + (inc.cost || 0), 0) / incidentsWithCost.length;
        const projectedCost = costTrend.direction === 'increasing' 
          ? avgCost * (1 + costTrend.percentage / 100)
          : avgCost * (1 - costTrend.percentage / 100);
        
        predictions.push({
          type: 'cost',
          timeframe: 'Próximos 6 meses',
          prediction: `Costo promedio proyectado: $${projectedCost.toLocaleString('es-MX')} por incidencia`,
          confidence: 70,
          factors: ['Tendencia de costos', 'Inflación', 'Mejoras en procesos']
        });
      }
    }
    
    // Predicción de riesgo
    const highSeverityCount = incidents.filter(inc => inc.severity === 'high' || inc.severity === 'critical').length;
    const riskPercentage = (highSeverityCount / incidents.length) * 100;
    
    predictions.push({
      type: 'risk',
      timeframe: 'Próximo mes',
      prediction: riskPercentage > 30 
        ? 'Alto riesgo de incidencias severas - Se requiere intervención preventiva'
        : riskPercentage > 15
        ? 'Riesgo moderado - Monitoreo intensivo recomendado'
        : 'Bajo riesgo - Mantener protocolos actuales',
      confidence: 80,
      factors: ['Severidad histórica', 'Patrones de personal', 'Condiciones operacionales']
    });
    
    return predictions;
  };

  const calculateRiskLevel = (patterns: PatternAnalysis[], trends: TrendAnalysis[], alerts: Alert[]): 'low' | 'medium' | 'high' | 'critical' => {
    let riskScore = 0;
    
    // Puntaje por patrones
    patterns.forEach(pattern => {
      if (pattern.impact === 'high') riskScore += 3;
      else if (pattern.impact === 'medium') riskScore += 2;
      else riskScore += 1;
    });
    
    // Puntaje por tendencias
    trends.forEach(trend => {
      if (trend.direction === 'increasing' && trend.significance === 'high') riskScore += 4;
      else if (trend.direction === 'increasing' && trend.significance === 'medium') riskScore += 2;
    });
    
    // Puntaje por alertas
    alerts.forEach(alert => {
      if (alert.severity === 'critical') riskScore += 5;
      else if (alert.severity === 'warning') riskScore += 3;
      else riskScore += 1;
    });
    
    if (riskScore >= 15) return 'critical';
    if (riskScore >= 10) return 'high';
    if (riskScore >= 5) return 'medium';
    return 'low';
  };

  const calculateConfidence = (patterns: PatternAnalysis[], trends: TrendAnalysis[]): number => {
    const totalItems = patterns.length + trends.length;
    if (totalItems === 0) return 0;
    
    const totalConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) + 
                           trends.reduce((sum, t) => sum + (t.significance === 'high' ? 90 : t.significance === 'medium' ? 70 : 50), 0);
    
    return Math.round(totalConfidence / totalItems);
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (incidents.length > 0) {
      generateAIAnalysis();
    }
  }, [incidents.length]); // Solo se ejecuta cuando cambia el número de incidencias

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low': return 'Bajo';
      case 'medium': return 'Medio';
      case 'high': return 'Alto';
      case 'critical': return 'Crítico';
      default: return 'Desconocido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (incidents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Análisis de IA No Disponible</h3>
          <p className="text-gray-600">Se requieren al menos 3 incidencias para generar análisis inteligente.</p>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Generando Análisis de IA</h3>
          <p className="text-gray-600">Analizando patrones y tendencias...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center py-8">
          <button
            onClick={generateAIAnalysis}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Sparkles className="h-5 w-5" />
            <span>Generar Análisis de IA</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Análisis */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-sm border p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Análisis Inteligente de Incidencias</h3>
              <p className="text-purple-100">Powered by AI • Última actualización: {lastUpdate}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.riskLevel)}`}>
              Riesgo {getRiskText(analysis.riskLevel)}
            </div>
            <p className="text-sm text-purple-100 mt-1">Confianza: {analysis.confidence}%</p>
          </div>
        </div>
      </div>

      {/* Alertas Críticas */}
      {analysis.insights.alerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Alertas Críticas</span>
            </h4>
          </div>
          <div className="p-6 space-y-4">
            {analysis.insights.alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{alert.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    {alert.deadline && (
                      <p className="text-xs text-gray-500 mt-2">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Acción requerida antes del: {new Date(alert.deadline).toLocaleDateString('es-MX')}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                    {alert.severity === 'critical' ? 'Crítico' : alert.severity === 'warning' ? 'Advertencia' : 'Info'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patrones Detectados */}
      {analysis.insights.patterns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <span>Patrones Detectados</span>
            </h4>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.insights.patterns.map((pattern, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{pattern.title}</h5>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    pattern.impact === 'high' ? 'text-red-600 bg-red-100' :
                    pattern.impact === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                    'text-green-600 bg-green-100'
                  }`}>
                    {pattern.impact === 'high' ? 'Alto' : pattern.impact === 'medium' ? 'Medio' : 'Bajo'} Impacto
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Confianza: {pattern.confidence}%</span>
                  <span className="capitalize">{pattern.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tendencias */}
      {analysis.insights.trends.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Tendencias</span>
            </h4>
          </div>
          <div className="p-6 space-y-4">
            {analysis.insights.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{trend.metric}</h5>
                  <p className="text-sm text-gray-600">{trend.period}</p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center space-x-2 ${
                    trend.direction === 'increasing' ? 'text-red-600' :
                    trend.direction === 'decreasing' ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {trend.direction === 'increasing' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : trend.direction === 'decreasing' ? (
                      <TrendingUp className="h-4 w-4 rotate-180" />
                    ) : (
                      <BarChart3 className="h-4 w-4" />
                    )}
                    <span className="font-medium">{trend.percentage.toFixed(1)}%</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    trend.significance === 'high' ? 'text-red-600 bg-red-100' :
                    trend.significance === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                    'text-green-600 bg-green-100'
                  }`}>
                    {trend.significance === 'high' ? 'Alta' : trend.significance === 'medium' ? 'Media' : 'Baja'} Significancia
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {analysis.insights.recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <span>Recomendaciones Inteligentes</span>
            </h4>
          </div>
          <div className="p-6 space-y-4">
            {analysis.insights.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-medium text-gray-900">{rec.title}</h5>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                      {rec.priority === 'urgent' ? 'Urgente' : rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'} Prioridad
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{rec.category}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Impacto Esperado:</span>
                    <p className="text-gray-600">{rec.expectedImpact}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Implementación:</span>
                    <p className="text-gray-600">{rec.implementation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predicciones */}
      {analysis.insights.predictions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span>Predicciones</span>
            </h4>
          </div>
          <div className="p-6 space-y-4">
            {analysis.insights.predictions.map((pred, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900 capitalize">{pred.type.replace('_', ' ')}</h5>
                  <span className="text-xs text-gray-500">{pred.timeframe}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{pred.prediction}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Confianza: {pred.confidence}%</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Factores:</span>
                    <span className="text-gray-600">{pred.factors.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de Actualización */}
      <div className="text-center">
        <button
          onClick={generateAIAnalysis}
          disabled={isGenerating}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Actualizando...' : 'Actualizar Análisis'}</span>
        </button>
        <p className="text-xs text-gray-500 mt-2">
          El análisis se actualiza automáticamente cuando se agregan nuevas incidencias
        </p>
      </div>
    </div>
  );
};

export default AdvancedIncidentAnalysis;
