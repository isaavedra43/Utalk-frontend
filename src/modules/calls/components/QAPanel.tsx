import React from 'react';
import { Shield, Star, FileText, User, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { QAReview, Call } from '../../../types/calls';

interface QAPanelProps {
  qaReviews: QAReview[];
  calls: Call[];
  loading: boolean;
  onQAUpdate: (qa: QAReview) => void;
}

export const QAPanel: React.FC<QAPanelProps> = ({
  qaReviews,
  calls,
  loading,
  onQAUpdate
}) => {
  const mockQAReviews: QAReview[] = [
    {
      id: '1',
      callId: '1',
      rubricId: '1',
      reviewerId: '1',
      score: 85,
      maxScore: 100,
      notes: 'Excelente atención al cliente, cumplió con todos los criterios',
      criteria: [
        { id: '1', name: 'Saludo profesional', score: 10, maxScore: 10, notes: 'Perfecto' },
        { id: '2', name: 'Escucha activa', score: 8, maxScore: 10, notes: 'Muy bien' },
        { id: '3', name: 'Resolución del problema', score: 9, maxScore: 10, notes: 'Excelente' }
      ],
      status: 'completed',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'disputed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Control de Calidad</h1>
        <p className="text-gray-600 mt-1">Evaluaciones y revisiones de llamadas</p>
      </div>

      <div className="space-y-4">
        {mockQAReviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revisión QA #{review.id}</h3>
                  <p className="text-sm text-gray-600">
                    Llamada #{review.callId} • {review.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getScoreColor(review.score, review.maxScore)}`}>
                    {review.score}/{review.maxScore}
                  </p>
                  <p className="text-sm text-gray-600">
                    {Math.round((review.score / review.maxScore) * 100)}%
                  </p>
                </div>
                <Badge className={getStatusColor(review.status)}>
                  {review.status === 'completed' ? 'Completada' :
                   review.status === 'pending' ? 'Pendiente' : 'Disputada'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Criterios evaluados</h4>
                <div className="space-y-2">
                  {review.criteria.map((criterion) => (
                    <div key={criterion.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{criterion.name}</p>
                        {criterion.notes && (
                          <p className="text-xs text-gray-600">{criterion.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={(criterion.score / criterion.maxScore) * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {criterion.score}/{criterion.maxScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {review.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Notas del revisor</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {review.notes}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver detalles
                </Button>
                <Button variant="outline" size="sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprobar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

