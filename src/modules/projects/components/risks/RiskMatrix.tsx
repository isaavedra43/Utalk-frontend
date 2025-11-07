// Matriz de riesgos (Heat Map)

import React from 'react';
import type { ProjectRisk, RiskProbability, RiskImpact } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface RiskMatrixProps {
  risks: ProjectRisk[];
  onRiskClick?: (risk: ProjectRisk) => void;
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({
  risks,
  onRiskClick,
}) => {
  const probabilityLevels: RiskProbability[] = ['very_high', 'high', 'medium', 'low', 'very_low'];
  const impactLevels: RiskImpact[] = ['very_low', 'low', 'medium', 'high', 'very_high'];

  const getProbabilityLabel = (prob: RiskProbability) => {
    const labels: { [key in RiskProbability]: string } = {
      very_high: 'Muy Alta',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
      very_low: 'Muy Baja',
    };
    return labels[prob];
  };

  const getImpactLabel = (impact: RiskImpact) => {
    const labels: { [key in RiskImpact]: string } = {
      very_high: 'Muy Alto',
      high: 'Alto',
      medium: 'Medio',
      low: 'Bajo',
      very_low: 'Muy Bajo',
    };
    return labels[impact];
  };

  const getCellColor = (probability: RiskProbability, impact: RiskImpact) => {
    const score = (probabilityLevels.indexOf(probability) + 1) * (impactLevels.indexOf(impact) + 1);
    
    if (score >= 20) return 'bg-red-500 hover:bg-red-600';
    if (score >= 12) return 'bg-orange-500 hover:bg-orange-600';
    if (score >= 6) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  const getRisksInCell = (probability: RiskProbability, impact: RiskImpact) => {
    return risks.filter(r => r.probability === probability && r.impact === impact);
  };

  const totalRisks = risks.length;
  const criticalRisks = risks.filter(r => r.riskLevel === 'critical').length;
  const highRisks = risks.filter(r => r.riskLevel === 'high').length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Matriz de Riesgos</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Crítico: {criticalRisks}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-gray-600">Alto: {highRisks}</span>
          </div>
          <span className="text-gray-500">Total: {totalRisks}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs font-medium text-gray-600 border border-gray-300 bg-gray-50">
                Probabilidad \ Impacto
              </th>
              {impactLevels.map((impact) => (
                <th
                  key={impact}
                  className="p-2 text-xs font-medium text-gray-600 border border-gray-300 bg-gray-50 min-w-[100px]"
                >
                  {getImpactLabel(impact)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {probabilityLevels.map((probability) => (
              <tr key={probability}>
                <td className="p-2 text-xs font-medium text-gray-700 border border-gray-300 bg-gray-50">
                  {getProbabilityLabel(probability)}
                </td>
                {impactLevels.map((impact) => {
                  const cellRisks = getRisksInCell(probability, impact);
                  const cellColor = getCellColor(probability, impact);

                  return (
                    <td
                      key={impact}
                      className={`p-2 border border-gray-300 relative group ${cellColor} transition-colors`}
                    >
                      {cellRisks.length > 0 && (
                        <div className="text-white text-center">
                          <div className="font-bold text-lg">{cellRisks.length}</div>
                          
                          {/* Tooltip con detalles */}
                          <div className="absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="space-y-2">
                              {cellRisks.slice(0, 3).map((risk) => (
                                <div
                                  key={risk.id}
                                  className="cursor-pointer hover:bg-white/10 p-1 rounded"
                                  onClick={() => onRiskClick?.(risk)}
                                >
                                  <p className="font-medium">{risk.name}</p>
                                  <p className="text-gray-400 text-xs">Score: {risk.riskScore}</p>
                                </div>
                              ))}
                              {cellRisks.length > 3 && (
                                <p className="text-gray-400 pt-1 border-t border-gray-700">
                                  +{cellRisks.length - 3} más...
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="mt-6 flex items-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Crítico (Score ≥ 20)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>Alto (Score 12-19)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Medio (Score 6-11)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Bajo (Score < 6)</span>
        </div>
      </div>
    </div>
  );
};

