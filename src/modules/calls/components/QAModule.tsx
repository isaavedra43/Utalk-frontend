import React, { useState } from 'react';
import { Headphones, Star, Play, Pause, Download, Edit, Trash2, MoreHorizontal, CheckCircle, XCircle, AlertTriangle, Clock, User, FileText, MessageSquare } from 'lucide-react';

export const QAModule: React.FC = () => {
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [playingCall, setPlayingCall] = useState<string | null>(null);

  // Datos mock para demostración
  const qaReviews = [
    {
      id: 'qa_1',
      callId: 'call_1',
      agentId: 'agent_1',
      agentName: 'Ana García',
      reviewerId: 'reviewer_1',
      reviewerName: 'Supervisor López',
      rubricId: 'rubric_1',
      rubricName: 'Evaluación Estándar',
      score: 4.5,
      maxScore: 5,
      percentage: 90,
      grade: 'excellent',
      notes: 'Excelente manejo del cliente, resolución efectiva del problema',
      feedback: 'Muy buen trabajo en la resolución del problema. El cliente quedó satisfecho.',
      recommendations: ['Mantener el nivel actual', 'Compartir mejores prácticas con el equipo'],
      strengths: ['Comunicación clara', 'Resolución efectiva', 'Empatía con el cliente'],
      improvements: ['Reducir tiempo de espera en transferencias'],
      categories: [
        {
          id: 'cat_1',
          name: 'Comunicación',
          weight: 30,
          score: 4.5,
          maxScore: 5,
          criteria: [
            {
              id: 'crit_1',
              name: 'Claridad en el mensaje',
              description: 'El agente comunica de manera clara y comprensible',
              weight: 50,
              score: 4.5,
              maxScore: 5,
              notes: 'Excelente claridad en la explicación',
              evidence: ['Línea 45: "Entiendo su problema, vamos a resolverlo paso a paso"']
            }
          ]
        },
        {
          id: 'cat_2',
          name: 'Resolución de Problemas',
          weight: 40,
          score: 4.5,
          maxScore: 5,
          criteria: [
            {
              id: 'crit_2',
              name: 'Identificación del problema',
              description: 'El agente identifica correctamente el problema del cliente',
              weight: 60,
              score: 4.5,
              maxScore: 5,
              notes: 'Identificación rápida y precisa',
              evidence: ['Línea 12: "Veo que el problema es con el acceso a su cuenta"']
            }
          ]
        }
      ],
      isCalibrated: true,
      calibrationScore: 4.3,
      calibrationNotes: 'Evaluación calibrada con el equipo de supervisores',
      reviewedAt: new Date('2024-11-22T15:30:00'),
      createdAt: new Date('2024-11-22T15:30:00'),
      updatedAt: new Date('2024-11-22T15:30:00'),
    },
    {
      id: 'qa_2',
      callId: 'call_2',
      agentId: 'agent_2',
      agentName: 'Carlos Rodríguez',
      reviewerId: 'reviewer_1',
      reviewerName: 'Supervisor López',
      rubricId: 'rubric_1',
      rubricName: 'Evaluación Estándar',
      score: 3.8,
      maxScore: 5,
      percentage: 76,
      grade: 'good',
      notes: 'Buen desempeño general, áreas de mejora identificadas',
      feedback: 'Buen trabajo en general. Necesita mejorar en el seguimiento de casos.',
      recommendations: ['Mejorar seguimiento de casos', 'Reducir tiempo de transferencia'],
      strengths: ['Conocimiento técnico', 'Paciencia con el cliente'],
      improvements: ['Seguimiento de casos', 'Tiempo de transferencia'],
      categories: [
        {
          id: 'cat_1',
          name: 'Comunicación',
          weight: 30,
          score: 3.5,
          maxScore: 5,
          criteria: [
            {
              id: 'crit_1',
              name: 'Claridad en el mensaje',
              description: 'El agente comunica de manera clara y comprensible',
              weight: 50,
              score: 3.5,
              maxScore: 5,
              notes: 'Comunicación clara pero podría ser más concisa',
              evidence: ['Línea 23: "Bueno, veamos qué podemos hacer aquí"']
            }
          ]
        }
      ],
      isCalibrated: false,
      reviewedAt: new Date('2024-11-22T14:15:00'),
      createdAt: new Date('2024-11-22T14:15:00'),
      updatedAt: new Date('2024-11-22T14:15:00'),
    }
  ];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeText = (grade: string) => {
    switch (grade) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Bueno';
      case 'fair':
        return 'Regular';
      case 'poor':
        return 'Malo';
      case 'critical':
        return 'Crítico';
      default:
        return 'Desconocido';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Aseguramiento de Calidad</h2>
          <p className="text-gray-600">Evaluaciones y análisis de calidad de llamadas</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <Headphones className="h-4 w-4" />
            <span>Nueva Evaluación</span>
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Evaluaciones</p>
              <p className="text-2xl font-bold text-gray-900">{qaReviews.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Headphones className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Score Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {(qaReviews.reduce((sum, review) => sum + review.score, 0) / qaReviews.length).toFixed(1)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calibradas</p>
              <p className="text-2xl font-bold text-gray-900">
                {qaReviews.filter(review => review.isCalibrated).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {qaReviews.filter(review => !review.isCalibrated).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de evaluaciones */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calibrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {qaReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{review.agentName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{review.reviewerName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className={`text-sm font-medium ${getScoreColor(review.score, review.maxScore)}`}>
                        {review.score}/{review.maxScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(review.grade)}`}>
                      {getGradeText(review.grade)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {review.isCalibrated ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{formatDate(review.reviewedAt)}</div>
                      <div className="text-sm text-gray-500">{formatTime(review.reviewedAt)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPlayingCall(playingCall === review.callId ? null : review.callId)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Reproducir/Pausar"
                      >
                        {playingCall === review.callId ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Ver detalles">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Editar">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Más opciones">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle de evaluación seleccionada */}
      {selectedReview && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Evaluación</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Fortalezas</h4>
                <ul className="space-y-1">
                  {qaReviews.find(r => r.id === selectedReview)?.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Áreas de Mejora</h4>
                <ul className="space-y-1">
                  {qaReviews.find(r => r.id === selectedReview)?.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <AlertTriangle className="h-3 w-3 text-yellow-600 mr-2" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Feedback</h4>
              <p className="text-sm text-gray-600">
                {qaReviews.find(r => r.id === selectedReview)?.feedback}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Recomendaciones</h4>
              <ul className="space-y-1">
                {qaReviews.find(r => r.id === selectedReview)?.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <MessageSquare className="h-3 w-3 text-blue-600 mr-2" />
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
