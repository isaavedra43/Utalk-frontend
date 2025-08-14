import React, { memo } from 'react';
import { DonutChart } from './DonutChart';

interface SentimentData {
  positive: { count: number; percentage: number };
  neutral: { count: number; percentage: number };
  negative: { count: number; percentage: number };
}

interface ChannelData {
  name: string;
  messages: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface SentimentAnalysisProps {
  sentimentData: SentimentData;
  channelData: ChannelData[];
}

export const SentimentAnalysis = memo<SentimentAnalysisProps>(({ sentimentData, channelData }) => {
  const chartData = [
    { name: 'Positivo', value: sentimentData.positive.percentage, color: '#10B981' },
    { name: 'Neutro', value: sentimentData.neutral.percentage, color: '#6B7280' },
    { name: 'Negativo', value: sentimentData.negative.percentage, color: '#EF4444' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Análisis de Sentimiento */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Sentimiento</h3>
        
        {/* Donut Chart */}
        <div className="flex justify-center mb-6">
          <div className="w-48 h-48">
            <DonutChart data={chartData} />
          </div>
        </div>

        {/* Leyenda */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Positivo</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {sentimentData.positive.count} mensajes ({sentimentData.positive.percentage}%)
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Neutro</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {sentimentData.neutral.count} mensajes ({sentimentData.neutral.percentage}%)
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Negativo</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {sentimentData.negative.count} mensajes ({sentimentData.negative.percentage}%)
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Canal */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Por Canal</h4>
        <div className="space-y-3">
          {channelData.map((channel, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{channel.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{channel.messages} msgs</span>
                <span className="text-sm font-medium text-gray-900">{channel.percentage}%</span>
                <span className={`text-xs ${
                  channel.trend === 'up' ? 'text-green-500' : 
                  channel.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {channel.trend === 'up' ? '+' : channel.trend === 'down' ? '-' : '='}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

SentimentAnalysis.displayName = 'SentimentAnalysis'; 