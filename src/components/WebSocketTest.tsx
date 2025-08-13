import React, { useState, useEffect } from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { useAuth } from '../modules/auth/hooks/useAuth';

interface TestEvent {
  id: string;
  timestamp: Date;
  type: string;
  data: Record<string, unknown>;
  status: 'pending' | 'sent' | 'received' | 'error';
}

export const WebSocketTest: React.FC = () => {
  const { isConnected, connectionError, connect, disconnect, emit, socket } = useWebSocketContext();
  const { isAuthenticated } = useAuth();
  const [testMessage, setTestMessage] = useState('');
  const [testEvents, setTestEvents] = useState<TestEvent[]>([]);
  const [autoTest, setAutoTest] = useState(false);
  const [testInterval, setTestInterval] = useState<NodeJS.Timeout | null>(null);

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (testInterval) {
        clearInterval(testInterval);
      }
    };
  }, [testInterval]);

  const addTestEvent = (type: string, data: Record<string, unknown>, status: TestEvent['status'] = 'pending') => {
    const event: TestEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      data,
      status
    };
    setTestEvents(prev => [...prev.slice(-9), event]); // Mantener solo los últimos 10 eventos
  };

  const handleConnect = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('🔌 Intentando conectar manualmente...');
      addTestEvent('connect', { token: token.substring(0, 20) + '...' }, 'pending');
      connect(token);
      setTimeout(() => {
        addTestEvent('connect', { success: isConnected }, isConnected ? 'sent' : 'error');
      }, 1000);
    } else {
      console.error('❌ No hay token disponible');
      addTestEvent('connect', { error: 'No hay token disponible' }, 'error');
    }
  };

  const handleDisconnect = () => {
    console.log('🔌 Desconectando manualmente...');
    addTestEvent('disconnect', {}, 'pending');
    disconnect();
    setTimeout(() => {
      addTestEvent('disconnect', { success: !isConnected }, !isConnected ? 'sent' : 'error');
    }, 500);
  };

  const handleTestEmit = () => {
    if (testMessage.trim()) {
      console.log('📤 Enviando mensaje de prueba:', testMessage);
      addTestEvent('test-message', { message: testMessage }, 'pending');
      emit('test-message', { message: testMessage, timestamp: new Date().toISOString() });
      setTimeout(() => {
        addTestEvent('test-message', { message: testMessage }, 'sent');
      }, 100);
      setTestMessage('');
    }
  };

  const handleSyncState = () => {
    console.log('🔄 Solicitando sincronización de estado...');
    addTestEvent('sync-state', { syncId: Date.now() }, 'pending');
    emit('sync-state', { syncId: Date.now() });
    setTimeout(() => {
      addTestEvent('sync-state', { syncId: Date.now() }, 'sent');
    }, 100);
  };

  const handlePingTest = () => {
    console.log('🏓 Enviando ping...');
    addTestEvent('ping', { timestamp: Date.now() }, 'pending');
    emit('ping', { timestamp: Date.now() });
    setTimeout(() => {
      addTestEvent('ping', { timestamp: Date.now() }, 'sent');
    }, 100);
  };

  const handleJoinTest = () => {
    const testConversationId = 'test-conversation-' + Date.now();
    console.log('🔗 Uniéndose a conversación de prueba:', testConversationId);
    addTestEvent('join-conversation', { conversationId: testConversationId }, 'pending');
    emit('join-conversation', { conversationId: testConversationId });
    setTimeout(() => {
      addTestEvent('join-conversation', { conversationId: testConversationId }, 'sent');
    }, 100);
  };

  const handleLeaveTest = () => {
    const testConversationId = 'test-conversation-' + Date.now();
    console.log('🔌 Saliendo de conversación de prueba:', testConversationId);
    addTestEvent('leave-conversation', { conversationId: testConversationId }, 'pending');
    emit('leave-conversation', { conversationId: testConversationId });
    setTimeout(() => {
      addTestEvent('leave-conversation', { conversationId: testConversationId }, 'sent');
    }, 100);
  };

  const handleAutoTest = () => {
    if (autoTest) {
      setAutoTest(false);
      if (testInterval) {
        clearInterval(testInterval);
        setTestInterval(null);
      }
      addTestEvent('auto-test', { action: 'stopped' }, 'sent');
    } else {
      setAutoTest(true);
      const interval = setInterval(() => {
        if (isConnected) {
          handlePingTest();
        }
      }, 5000); // Ping cada 5 segundos
      setTestInterval(interval);
      addTestEvent('auto-test', { action: 'started', interval: '5s' }, 'sent');
    }
  };

  const handleClearEvents = () => {
    setTestEvents([]);
  };

  const handleExportEvents = () => {
    const eventsText = testEvents.map(event => 
      `[${event.timestamp.toLocaleTimeString()}] ${event.type}: ${JSON.stringify(event.data)} (${event.status})`
    ).join('\n');
    
    const blob = new Blob([eventsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `websocket-test-events-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-yellow-100">
        <h3 className="text-yellow-800 font-medium mb-2">🔌 WebSocket Test</h3>
        <p className="text-yellow-700 text-sm">Usuario no autenticado - Requiere login para testing</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100 space-y-4">
      <h3 className="text-blue-800 font-medium mb-3 flex items-center">
        🔌 WebSocket Test
        <span className={`ml-2 px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
          {isConnected ? 'CONECTADO' : 'DESCONECTADO'}
        </span>
      </h3>
      
      {/* Estado de conexión */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={isConnected ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
        {connectionError && (
          <span className="text-xs text-red-600 ml-2 font-mono">{connectionError}</span>
        )}
        {socket?.id && (
          <span className="text-xs text-gray-600 ml-2 font-mono">ID: {socket.id}</span>
        )}
      </div>

      {/* Controles principales */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleConnect}
          disabled={isConnected}
          className="px-3 py-2 bg-blue-500 text-white rounded text-sm disabled:bg-gray-300 hover:bg-blue-600"
        >
          Conectar
        </button>
        <button
          onClick={handleDisconnect}
          disabled={!isConnected}
          className="px-3 py-2 bg-red-500 text-white rounded text-sm disabled:bg-gray-300 hover:bg-red-600"
        >
          Desconectar
        </button>
        <button
          onClick={handleSyncState}
          disabled={!isConnected}
          className="px-3 py-2 bg-green-500 text-white rounded text-sm disabled:bg-gray-300 hover:bg-green-600"
        >
          Sync State
        </button>
        <button
          onClick={handlePingTest}
          disabled={!isConnected}
          className="px-3 py-2 bg-purple-500 text-white rounded text-sm disabled:bg-gray-300 hover:bg-purple-600"
        >
          Ping Test
        </button>
      </div>

      {/* Controles de conversación */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleJoinTest}
          disabled={!isConnected}
          className="px-3 py-2 bg-indigo-500 text-white rounded text-sm disabled:bg-gray-300 hover:bg-indigo-600"
        >
          Join Test
        </button>
        <button
          onClick={handleLeaveTest}
          disabled={!isConnected}
          className="px-3 py-2 bg-orange-500 text-white rounded text-sm disabled:bg-gray-300 hover:bg-orange-600"
        >
          Leave Test
        </button>
        <button
          onClick={handleAutoTest}
          className={`px-3 py-2 text-white rounded text-sm hover:opacity-80 ${
            autoTest ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {autoTest ? 'Stop Auto Test' : 'Start Auto Test'}
        </button>
      </div>

      {/* Test de mensaje personalizado */}
      <div className="flex gap-2">
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Mensaje de prueba personalizado"
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleTestEmit()}
        />
        <button
          onClick={handleTestEmit}
          disabled={!isConnected || !testMessage.trim()}
          className="px-3 py-2 bg-purple-500 text-white rounded text-sm disabled:bg-gray-300 hover:bg-purple-600"
        >
          Enviar
        </button>
      </div>

      {/* Eventos de test */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-semibold text-blue-700">📊 Eventos de Test ({testEvents.length})</h4>
          <div className="flex gap-2">
            <button
              onClick={handleClearEvents}
              className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
            >
              Limpiar
            </button>
            <button
              onClick={handleExportEvents}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Exportar
            </button>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border max-h-48 overflow-y-auto">
          {testEvents.map(event => (
            <div
              key={event.id}
              className={`text-xs mb-1 p-1 rounded ${
                event.status === 'error' ? 'bg-red-100 text-red-700' :
                event.status === 'sent' ? 'bg-green-100 text-green-700' :
                event.status === 'received' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}
            >
              <span className="text-gray-500">[{event.timestamp.toLocaleTimeString()}]</span>
              <span className="ml-2 font-semibold">{event.type}:</span>
              <span className="ml-1 font-mono">{JSON.stringify(event.data)}</span>
              <span className={`ml-2 px-1 rounded text-xs ${
                event.status === 'error' ? 'bg-red-200' :
                event.status === 'sent' ? 'bg-green-200' :
                event.status === 'received' ? 'bg-blue-200' :
                'bg-yellow-200'
              }`}>
                {event.status}
              </span>
            </div>
          ))}
          {testEvents.length === 0 && (
            <div className="text-gray-500 text-xs">No hay eventos de test</div>
          )}
        </div>
      </div>

      {/* Información de debug */}
      <div className="text-xs text-gray-600 space-y-1">
        <div>Token: <span className={localStorage.getItem('access_token') ? 'text-green-600' : 'text-red-600'}>{localStorage.getItem('access_token') ? 'Disponible' : 'No disponible'}</span></div>
        <div>URL: <span className="font-mono break-all">{import.meta.env.VITE_WS_URL || import.meta.env.VITE_BACKEND_URL}</span></div>
        <div>Auto Test: <span className={autoTest ? 'text-green-600' : 'text-gray-600'}>{autoTest ? 'Activo' : 'Inactivo'}</span></div>
      </div>
    </div>
  );
}; 