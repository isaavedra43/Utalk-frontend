import React, { useState, useEffect } from 'react';
import { Copy, ThumbsUp, ThumbsDown, ShoppingCart, TrendingUp, MessageSquare, Package, Send, FileText, Download, MessageCircle } from 'lucide-react';
import '../../styles/suggestions.css';

interface SuggestedResponse {
  id: string;
  content: string;
  confidence: number;
  category: string;
  tags: string[];
  isUsed: boolean;
}

interface SuggestedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  relevance: number;
  isRecommended: boolean;
}

interface SuggestedQuote {
  id: string;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  items: QuoteItem[];
  validity: string;
  confidence: number;
  isGenerated: boolean;
  clientInfo: {
    name: string;
    company: string;
    needs: string[];
  };
}

interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ClientDocument {
  id: string;
  type: 'quote' | 'order' | 'ticket' | 'invoice';
  title: string;
  number: string;
  status: 'sent' | 'viewed' | 'accepted' | 'rejected' | 'pending';
  amount?: number;
  currency?: string;
  sentDate: string;
  viewedDate?: string;
  clientName: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export const SuggestionsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'responses' | 'products' | 'quotes'>('responses');
  const [suggestedResponses, setSuggestedResponses] = useState<SuggestedResponse[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([]);
  const [suggestedQuotes, setSuggestedQuotes] = useState<SuggestedQuote[]>([]);
  const [clientDocuments, setClientDocuments] = useState<ClientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data para respuestas sugeridas
  const mockSuggestedResponses: SuggestedResponse[] = [
    {
      id: 'resp-1',
      content: '¡Hola! Gracias por contactarnos. Entiendo tu consulta sobre el producto. Te puedo ayudar con toda la información que necesites.',
      confidence: 95,
      category: 'Saludo',
      tags: ['cordial', 'profesional'],
      isUsed: false
    },
    {
      id: 'resp-2',
      content: 'Perfecto, puedo ayudarte con eso. Nuestro equipo está disponible para resolver cualquier duda que tengas sobre nuestros servicios.',
      confidence: 88,
      category: 'Atención',
      tags: ['servicio', 'ayuda'],
      isUsed: false
    },
    {
      id: 'resp-3',
      content: 'Te envío toda la información detallada que solicitas. Si necesitas algo más, no dudes en preguntarme.',
      confidence: 92,
      category: 'Información',
      tags: ['detallado', 'completo'],
      isUsed: false
    }
  ];

  // Mock data para productos más vendidos de la semana
  const mockTopSellingProducts: SuggestedProduct[] = [
    {
      id: 'top-1',
      name: 'Plan Premium',
      description: 'Acceso completo a todas las funcionalidades avanzadas',
      price: 99.99,
      image: '/api/placeholder/60/60',
      category: 'Suscripción',
      relevance: 95,
      isRecommended: true
    },
    {
      id: 'top-2',
      name: 'Consultoría Personalizada',
      description: 'Sesión de 1 hora con nuestro equipo especializado',
      price: 150.00,
      image: '/api/placeholder/60/60',
      category: 'Servicio',
      relevance: 87,
      isRecommended: false
    },
    {
      id: 'top-3',
      name: 'Kit de Herramientas',
      description: 'Conjunto completo de herramientas para optimizar tu trabajo',
      price: 75.50,
      image: '/api/placeholder/60/60',
      category: 'Producto',
      relevance: 78,
      isRecommended: false
    }
  ];

  // Mock data para productos sugeridos (mantener para compatibilidad)
  const mockSuggestedProducts: SuggestedProduct[] = mockTopSellingProducts;

  // Mock data para cotizaciones sugeridas
  const mockSuggestedQuotes: SuggestedQuote[] = [
    {
      id: 'quote-1',
      title: 'Cotización Premium Completa',
      description: 'Solución integral para empresa con necesidades avanzadas',
      totalAmount: 2499.99,
      currency: 'USD',
      validity: '30 días',
      confidence: 92,
      isGenerated: false,
      clientInfo: {
        name: 'Cliente Ejemplo',
        company: 'Empresa ABC',
        needs: ['Soporte 24/7', 'Integración API', 'Reportes avanzados']
      },
      items: [
        {
          id: 'item-1',
          name: 'Plan Premium Anual',
          description: 'Acceso completo a todas las funcionalidades',
          quantity: 1,
          unitPrice: 1199.99,
          total: 1199.99
        },
        {
          id: 'item-2',
          name: 'Consultoría de Implementación',
          description: 'Sesión de 4 horas para configuración inicial',
          quantity: 1,
          unitPrice: 800.00,
          total: 800.00
        },
        {
          id: 'item-3',
          name: 'Soporte Premium',
          description: 'Soporte prioritario por 12 meses',
          quantity: 1,
          unitPrice: 500.00,
          total: 500.00
        }
      ]
    },
    {
      id: 'quote-2',
      title: 'Cotización Básica',
      description: 'Solución esencial para pequeñas empresas',
      totalAmount: 599.99,
      currency: 'USD',
      validity: '15 días',
      confidence: 85,
      isGenerated: false,
      clientInfo: {
        name: 'Cliente Ejemplo',
        company: 'Startup XYZ',
        needs: ['Funcionalidades básicas', 'Soporte por email']
      },
      items: [
        {
          id: 'item-1',
          name: 'Plan Básico Mensual',
          description: 'Funcionalidades esenciales',
          quantity: 12,
          unitPrice: 49.99,
          total: 599.88
        }
      ]
    },
    {
      id: 'quote-3',
      title: 'Cotización Enterprise',
      description: 'Solución corporativa con servicios personalizados',
      totalAmount: 5499.99,
      currency: 'USD',
      validity: '45 días',
      confidence: 88,
      isGenerated: true,
      clientInfo: {
        name: 'Cliente Enterprise',
        company: 'Corporación Global',
        needs: ['Solución multi-usuario', 'API personalizada', 'Soporte dedicado']
      },
      items: [
        {
          id: 'item-1',
          name: 'Licencia Enterprise',
          description: 'Acceso ilimitado para toda la empresa',
          quantity: 1,
          unitPrice: 2999.99,
          total: 2999.99
        },
        {
          id: 'item-2',
          name: 'Desarrollo API Personalizada',
          description: 'Integración específica para sus sistemas',
          quantity: 1,
          unitPrice: 1500.00,
          total: 1500.00
        },
        {
          id: 'item-3',
          name: 'Soporte Dedicado 24/7',
          description: 'Gerente de cuenta personal',
          quantity: 12,
          unitPrice: 83.33,
          total: 1000.00
        }
      ]
    }
  ];

  // Mock data para documentos enviados al cliente
  const mockClientDocuments: ClientDocument[] = [
    {
      id: 'doc-1',
      type: 'quote',
      title: 'Cotización Premium Q-2024-001',
      number: 'Q-2024-001',
      status: 'viewed',
      amount: 2499.99,
      currency: 'USD',
      sentDate: '2024-01-15',
      viewedDate: '2024-01-16',
      clientName: 'Empresa ABC',
      description: 'Cotización para plan premium anual',
      priority: 'high'
    },
    {
      id: 'doc-2',
      type: 'order',
      title: 'Orden de Venta OV-2024-005',
      number: 'OV-2024-005',
      status: 'accepted',
      amount: 1499.99,
      currency: 'USD',
      sentDate: '2024-01-10',
      viewedDate: '2024-01-11',
      clientName: 'Startup XYZ',
      description: 'Orden de venta para licencias básicas',
      priority: 'medium'
    },
    {
      id: 'doc-3',
      type: 'ticket',
      title: 'Ticket de Soporte TS-2024-012',
      number: 'TS-2024-012',
      status: 'pending',
      sentDate: '2024-01-18',
      clientName: 'Cliente Enterprise',
      description: 'Solicitud de soporte técnico urgente',
      priority: 'high'
    },
    {
      id: 'doc-4',
      type: 'invoice',
      title: 'Factura F-2024-008',
      number: 'F-2024-008',
      status: 'sent',
      amount: 899.99,
      currency: 'USD',
      sentDate: '2024-01-20',
      clientName: 'Corporación Global',
      description: 'Factura por servicios de consultoría',
      priority: 'low'
    },
    {
      id: 'doc-5',
      type: 'quote',
      title: 'Cotización Básica Q-2024-002',
      number: 'Q-2024-002',
      status: 'rejected',
      amount: 599.99,
      currency: 'USD',
      sentDate: '2024-01-12',
      viewedDate: '2024-01-13',
      clientName: 'Empresa Pequeña',
      description: 'Cotización para plan básico mensual',
      priority: 'medium'
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      setSuggestedResponses(mockSuggestedResponses);
      setSuggestedProducts(mockSuggestedProducts);
      setSuggestedQuotes(mockSuggestedQuotes);
      setClientDocuments(mockClientDocuments);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleUseResponse = (responseId: string) => {
    setSuggestedResponses(prev => 
      prev.map(resp => 
        resp.id === responseId ? { ...resp, isUsed: true } : resp
      )
    );
  };

  const handleCopyResponse = (content: string) => {
    navigator.clipboard.writeText(content);
    // Aquí podrías mostrar una notificación de éxito
  };

  const handleRateResponse = (responseId: string, rating: 'up' | 'down') => {
    // Aquí implementarías la lógica para calificar la respuesta
    console.log(`Respuesta ${responseId} calificada como: ${rating}`);
  };

  const handleRecommendProduct = (productId: string) => {
    setSuggestedProducts(prev => 
      prev.map(prod => 
        prod.id === productId ? { ...prod, isRecommended: true } : prod
      )
    );
  };

  // Función para enviar respuesta al Copiloto
  const handleSendToCopilot = (responseContent: string) => {
    // Aquí implementarías la lógica para enviar al Copiloto
    // Por ejemplo, usando un contexto global o un evento personalizado
    console.log('Enviando al Copiloto:', responseContent);
    
    // Disparar evento personalizado para comunicar con el Copiloto
    const event = new CustomEvent('sendToCopilot', {
      detail: {
        content: responseContent,
        type: 'response',
        action: 'improve'
      }
    });
    window.dispatchEvent(event);
  };

  // Función para enviar producto al Copiloto
  const handleSendProductToCopilot = (product: SuggestedProduct) => {
    console.log('Enviando producto al Copiloto:', product);
    
    const event = new CustomEvent('sendToCopilot', {
      detail: {
        content: `Producto: ${product.name}\nDescripción: ${product.description}\nPrecio: $${product.price}\nCategoría: ${product.category}`,
        type: 'product',
        action: 'analyze',
        product: product
      }
    });
    window.dispatchEvent(event);
  };

  // Funciones para manejar cotizaciones
  const handleGenerateQuote = (quoteId: string) => {
    setSuggestedQuotes(prev => 
      prev.map(quote => 
        quote.id === quoteId ? { ...quote, isGenerated: true } : quote
      )
    );
    // Aquí se implementaría la lógica para generar la cotización
    console.log('Generando cotización:', quoteId);
  };

  const handleSendQuoteToChat = (quote: SuggestedQuote) => {
    // Aquí se implementaría la lógica para enviar al chat
    console.log('Enviando cotización al chat:', quote);
    
    const quoteText = `📋 **Cotización: ${quote.title}**
    
💰 **Total: ${quote.currency} ${quote.totalAmount}**
📅 **Válida por: ${quote.validity}**

**Incluye:**
${quote.items.map(item => `• ${item.name} - ${quote.currency} ${item.total}`).join('\n')}

¿Te gustaría proceder con esta cotización?`;
    
    // Disparar evento para enviar al chat
    const event = new CustomEvent('sendToChat', {
      detail: {
        content: quoteText,
        type: 'quote'
      }
    });
    window.dispatchEvent(event);
  };

  const handleDownloadQuote = (quote: SuggestedQuote) => {
    // Aquí se implementaría la lógica para descargar la cotización
    console.log('Descargando cotización:', quote);
    
    // Simular descarga
    const quoteContent = `
COTIZACIÓN: ${quote.title}
Cliente: ${quote.clientInfo.name} - ${quote.clientInfo.company}
Fecha: ${new Date().toLocaleDateString()}
Válida por: ${quote.validity}

ITEMS:
${quote.items.map(item => 
  `${item.name}
   ${item.description}
   Cantidad: ${item.quantity} x ${quote.currency} ${item.unitPrice} = ${quote.currency} ${item.total}`
).join('\n\n')}

TOTAL: ${quote.currency} ${quote.totalAmount}
    `;
    
    const blob = new Blob([quoteContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cotizacion-${quote.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Funciones para manejar documentos del cliente
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-blue-600 bg-blue-50';
      case 'viewed': return 'text-yellow-600 bg-yellow-50';
      case 'accepted': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return '📤';
      case 'viewed': return '👁️';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '📄';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quote': return '📋';
      case 'order': return '🛒';
      case 'ticket': return '🎫';
      case 'invoice': return '🧾';
      default: return '📄';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full suggestions-panel">
      {/* Header con título */}
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Sugerencias IA</h2>
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('responses')}
            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center space-x-1 ${
              activeTab === 'responses'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Respuestas</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center space-x-1 ${
              activeTab === 'products'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-3 h-3" />
            <span>Productos</span>
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center space-x-1 ${
              activeTab === 'quotes'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Cotizaciones</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 suggestions-scroll no-scrollbar">
        {activeTab === 'responses' ? (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-900 mb-2">
              Respuestas Sugeridas ({suggestedResponses.length})
            </h3>
            
            {suggestedResponses.map((response) => (
              <div
                key={response.id}
                className={`p-2.5 border rounded-lg suggestion-card suggestion-item ${
                  response.isUsed ? 'used' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-medium text-gray-600">
                      {response.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">
                        {response.confidence}%
                      </span>
                    </div>
                  </div>
                  {response.isUsed && (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Usada
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-800 mb-2 leading-relaxed">
                  {response.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {response.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full tag-chip"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-0.5">
                    <button
                      onClick={() => handleCopyResponse(response.content)}
                      className="p-1 text-gray-500 action-button copy"
                      title="Copiar respuesta"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    
                    {!response.isUsed && (
                      <button
                        onClick={() => handleUseResponse(response.id)}
                        className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Usar
                      </button>
                    )}

                    <button
                      onClick={() => handleSendToCopilot(response.content)}
                      className="p-1 text-gray-500 action-button copilot"
                      title="Enviar al Copiloto para mejorar"
                    >
                      <Send className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleRateResponse(response.id, 'up')}
                      className="p-1 text-gray-500 action-button like"
                      title="Me gusta"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => handleRateResponse(response.id, 'down')}
                      className="p-1 text-gray-500 action-button dislike"
                      title="No me gusta"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* KPIs de Rendimiento del Agente */}
            <div className="pt-3 border-t border-gray-100">
              <h3 className="text-xs font-medium text-gray-600 mb-3 text-center">
                Métricas de conversación
              </h3>
              
              <div className="grid grid-cols-1 gap-2">
                {/* KPI 1: First Response Time */}
                <div className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">⏱️ Tiempo primera respuesta</span>
                      <span className="text-xs font-medium text-gray-900">2.3s</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Excelente</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Meta: &lt;5min</span>
                    <span className="text-xs text-blue-600">-67% vs promedio</span>
                  </div>
                </div>

                {/* KPI 2: Resolution Rate */}
                <div className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-green-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">✅ Tasa de resolución</span>
                      <span className="text-xs font-medium text-gray-900">94%</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Alto</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Meta: &gt;85%</span>
                    <span className="text-xs text-blue-600">+9% vs meta</span>
                  </div>
                </div>

                {/* KPI 3: Customer Satisfaction Score */}
                <div className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-yellow-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">⭐ CSAT</span>
                      <span className="text-xs font-medium text-gray-900">4.8/5</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Sobresaliente</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Meta: &gt;4.5</span>
                    <span className="text-xs text-blue-600">+6.7% vs mes anterior</span>
                  </div>
                </div>

                {/* KPI 4: Conversation Quality Score */}
                <div className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">🎯 Calidad conversación</span>
                      <span className="text-xs font-medium text-gray-900">92%</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Alto</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Meta: &gt;80%</span>
                    <span className="text-xs text-blue-600">+12% vs meta</span>
                  </div>
                </div>

                {/* Resumen de Rendimiento */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Rendimiento general</div>
                    <div className="text-lg font-semibold text-gray-900 mb-1">A+</div>
                    <div className="text-xs text-gray-500">Top 10% del equipo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'products' ? (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-1">
              Top tres productos más vendidos de la semana ({suggestedProducts.length})
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Basado en las ventas de los últimos 7 días
            </p>
            
            {suggestedProducts.map((product, index) => (
              <div
                key={product.id}
                className={`relative p-2.5 border rounded-lg product-card suggestion-item ${
                  product.isRecommended ? 'recommended' : ''
                }`}
              >
                {/* Badge de ranking */}
                <div className="absolute -top-1 -left-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  #{index + 1}
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-10 h-10 product-image rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-xs font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-gray-600 font-medium">
                          {product.relevance} ventas
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-1.5 leading-relaxed">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-gray-900">
                          ${product.price}
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {product.isRecommended && (
                          <span className="text-xs text-blue-600 font-medium">
                            ✓ Recomendado
                          </span>
                        )}
                        
                        <button
                          onClick={() => handleRecommendProduct(product.id)}
                          className="p-1 text-gray-500 action-button cart"
                          title="Recomendar producto"
                        >
                          <ShoppingCart className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => handleSendProductToCopilot(product)}
                          className="p-1 text-gray-500 action-button copilot"
                          title="Enviar al Copiloto para análisis"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cotizaciones Sugeridas */}
            <div>
              <h3 className="text-xs font-semibold text-gray-900 mb-2">
                Cotizaciones Sugeridas ({suggestedQuotes.length})
              </h3>
            
            {suggestedQuotes.map((quote) => (
              <div
                key={quote.id}
                className={`p-2.5 border rounded-lg quote-card suggestion-item ${
                  quote.isGenerated ? 'generated' : ''
                }`}
              >
                <div className="flex items-start space-x-2">
                  <div className="w-10 h-10 quote-image rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-xs font-medium text-gray-900 truncate">
                        {quote.title}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-gray-600 font-medium">
                          {quote.confidence}%
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-1.5 leading-relaxed">
                      {quote.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-gray-900">
                          {quote.currency} {quote.totalAmount}
                        </span>
                        <span className="text-xs text-gray-500">
                          Válida {quote.validity}
                        </span>
                      </div>
                      
                      {quote.isGenerated && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Generada
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">
                          {quote.clientInfo.name}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {quote.items.length} items
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {!quote.isGenerated && (
                          <button
                            onClick={() => handleGenerateQuote(quote.id)}
                            className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="Generar cotización"
                          >
                            Generar
                          </button>
                        )}
                        
                        {quote.isGenerated && (
                          <>
                            <button
                              onClick={() => handleSendQuoteToChat(quote)}
                              className="p-1 text-gray-500 action-button chat"
                              title="Enviar al chat"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </button>
                            
                            <button
                              onClick={() => handleDownloadQuote(quote)}
                              className="p-1 text-gray-500 action-button download"
                              title="Descargar cotización"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>

            {/* Documentos Enviados al Cliente */}
            <div>
              <h3 className="text-xs font-semibold text-gray-900 mb-2">
                Documentos Enviados ({clientDocuments.length})
              </h3>
              
              {clientDocuments.map((document) => (
                <div
                  key={document.id}
                  className="p-2.5 border rounded-lg document-card suggestion-item mb-2"
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-gray-100">
                      <span className="text-sm">{getTypeIcon(document.type)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-xs font-medium text-gray-900 truncate">
                          {document.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusColor(document.status)}`}>
                            {getStatusIcon(document.status)} {document.status}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-1.5 leading-relaxed">
                        {document.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {document.clientName}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {document.number}
                          </span>
                          {document.amount && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs font-semibold text-gray-900">
                                {document.currency} {document.amount}
                              </span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${getPriorityColor(document.priority)}`}>
                            {document.priority}
                          </span>
                          
                          <button
                            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Ver detalles"
                          >
                            <FileText className="w-3 h-3" />
                          </button>
                          
                          <button
                            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 