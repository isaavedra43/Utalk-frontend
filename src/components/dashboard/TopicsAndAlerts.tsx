import { memo, useState } from 'react';
import { AlertTriangle, HelpCircle, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  type: 'complaint' | 'question' | 'compliment';
  priority: 'critical' | 'high' | 'medium' | 'low';
  keywords: string[];
  trend: {
    direction: 'up' | 'down' | 'stable';
    value: number;
  };
  newKeywords: string[];
}

interface TopicsAndAlertsProps {
  topics: Topic[];
}

const getIcon = (type: string) => {
  switch (type) {
    case 'complaint':
      return <AlertTriangle className="w-4 h-4" />;
    case 'question':
      return <HelpCircle className="w-4 h-4" />;
    case 'compliment':
      return <Star className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTrendIcon = (direction: string) => {
  switch (direction) {
    case 'up':
      return <TrendingUp className="w-3 h-3 text-green-500" />;
    case 'down':
      return <TrendingDown className="w-3 h-3 text-red-500" />;
    case 'stable':
      return <Minus className="w-3 h-3 text-gray-500" />;
    default:
      return <Minus className="w-3 h-3 text-gray-500" />;
  }
};

export const TopicsAndAlerts = memo<TopicsAndAlertsProps>(({ topics }) => {
  const [activeTab, setActiveTab] = useState<'topics' | 'customers'>('topics');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Temas y Alertas</h3>
          <p className="text-sm text-gray-600">Tendencias detectadas por IA</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('topics')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'topics'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Temas Emergentes
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'customers'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Clientes en Riesgo
        </button>
      </div>

      {/* Content */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          {topics.map((topic) => (
            <div key={topic.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    topic.type === 'complaint' ? 'bg-red-100 text-red-600' :
                    topic.type === 'question' ? 'bg-blue-100 text-blue-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {getIcon(topic.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{topic.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(topic.priority)}`}>
                        {topic.priority}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{topic.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(topic.trend.direction)}
                  <span className="text-sm font-medium text-gray-900">{topic.trend.value}</span>
                </div>
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap gap-2">
                {topic.keywords.map((keyword, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {keyword}
                    {topic.newKeywords.includes(keyword) && (
                      <span className="ml-1 text-green-600 font-medium">+1</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Clientes en Riesgo</h4>
          <p className="text-sm text-gray-600">No hay clientes en riesgo identificados actualmente</p>
        </div>
      )}
    </div>
  );
});

TopicsAndAlerts.displayName = 'TopicsAndAlerts'; 