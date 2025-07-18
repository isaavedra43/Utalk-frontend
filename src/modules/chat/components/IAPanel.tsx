// Panel de Asistente IA con respuestas sugeridas y resumen de conversación
// Lado derecho del chat con funcionalidades de IA
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Bot, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Sparkles,
  TrendingUp,
  MessageSquare
} from 'lucide-react'
import { IAPanelProps } from '../types'

export function IAPanel({
  conversationId,
  suggestions,
  summary,
  onSendSuggestion,
  onAskAssistant
}: IAPanelProps) {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendQuestion = async () => {
    if (!question.trim()) return
    
    setIsLoading(true)
    try {
      await onAskAssistant(question)
      setQuestion('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendQuestion()
    }
  }

  const handleCopySuggestion = (content: string) => {
    navigator.clipboard.writeText(content)
    // TODO: Mostrar toast de confirmación
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500'
    if (confidence >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Alta'
    if (confidence >= 60) return 'Media'
    return 'Baja'
  }

  if (!conversationId) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <Bot className="w-12 h-12 mb-3" />
          <h3 className="text-sm font-medium mb-1">Asistente IA</h3>
          <p className="text-xs text-center">
            Selecciona una conversación para obtener asistencia de IA
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Asistente IA
          </h2>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Beta
          </Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Obtén respuestas sugeridas y análisis
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Resumen de conversación */}
        {summary && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Mensajes:</span>
                  <p className="font-medium">{summary.totalMessages}</p>
                </div>
                <div>
                  <span className="text-gray-500">Respuesta:</span>
                  <p className="font-medium">{summary.avgResponseTime}</p>
                </div>
              </div>
              
              <div>
                <span className="text-xs text-gray-500">Sentimiento:</span>
                <Badge 
                  variant={summary.sentiment === 'positive' ? 'default' : 
                          summary.sentiment === 'negative' ? 'destructive' : 'secondary'}
                  className="ml-2 text-xs"
                >
                  {summary.sentiment === 'positive' ? '😊 Positivo' :
                   summary.sentiment === 'negative' ? '😞 Negativo' : '😐 Neutral'}
                </Badge>
              </div>

              {summary.topics.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500 block mb-2">Temas:</span>
                  <div className="flex flex-wrap gap-1">
                    {summary.topics.slice(0, 3).map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {summary.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{summary.topics.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Respuestas sugeridas */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Respuestas Sugeridas
          </h3>

          {suggestions.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Bot className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs">No hay sugerencias disponibles</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <Card 
                  key={suggestion.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    suggestion.isRelevant ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.category}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <div 
                          className={`w-2 h-2 rounded-full ${getConfidenceColor(suggestion.confidence)}`}
                          title={`Confianza: ${getConfidenceLabel(suggestion.confidence)}`}
                        />
                        <span className="text-xs text-gray-500">
                          {suggestion.confidence}%
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {suggestion.content}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopySuggestion(suggestion.content)}
                          className="h-6 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => onSendSuggestion(suggestion)}
                        className="h-6 px-3 text-xs"
                      >
                        Usar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input para preguntar al asistente */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Pregunta al asistente
          </h4>
          
          <div className="flex space-x-2">
            <Input
              placeholder="¿Cómo puedo ayudar al cliente?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="text-sm"
            />
            <Button
              onClick={handleSendQuestion}
              disabled={!question.trim() || isLoading}
              size="sm"
              className="flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1">
            {['¿Cómo resolver esto?', '¿Cuál es el siguiente paso?', 'Resume la conversación'].map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuestion(preset)}
                className="text-xs h-6"
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IAPanel 