import React, { useEffect, useRef } from 'react';
import { useInternalChat } from '../context/InternalChatContext';
import { ApprovalCard } from './ApprovalCard';

export const InternalChatMessages: React.FC = () => {
  const { state } = useInternalChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = state.activeChannel;

  // Datos de ejemplo para las ApprovalCards (basados en la imagen)
  const sampleApprovalCards = [
    {
      id: 'approval_1',
      messageId: 'msg_1',
      type: 'pago' as const,
      title: 'Global Exports',
      subtitle: 'Pago de factura',
      amount: 'JPY 8,500',
      currency: 'JPY',
      company: 'Global Exports',
      status: 'approved' as const,
      approverId: 'carlos_d',
      approverName: 'Carlos D.',
      approvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      senderId: 'beatriz_e',
      senderName: 'Beatriz E.',
      senderAvatar: undefined,
      attachments: [],
      canApprove: false,
      canReject: false,
    },
    {
      id: 'approval_2',
      messageId: 'msg_2',
      type: 'pago' as const,
      title: 'Quantum Leap Inc.',
      subtitle: 'Pago de servicios',
      amount: 'USD 720.00',
      currency: 'USD',
      company: 'Quantum Leap Inc.',
      status: 'approved' as const,
      approverId: 'carlos_d',
      approverName: 'Carlos D.',
      approvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      senderId: 'david_f',
      senderName: 'David F.',
      senderAvatar: undefined,
      attachments: [],
      canApprove: false,
      canReject: false,
    },
    {
      id: 'approval_3',
      messageId: 'msg_3',
      type: 'pago' as const,
      title: 'Starlight Ventures',
      subtitle: 'Pago de consultoría',
      amount: 'AUD 5,000.00',
      currency: 'AUD',
      company: 'Starlight Ventures',
      status: 'approved' as const,
      approverId: 'carlos_d',
      approverName: 'Carlos D.',
      approvedAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 horas atrás
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      senderId: 'beatriz_e',
      senderName: 'Beatriz E.',
      senderAvatar: undefined,
      attachments: [],
      canApprove: false,
      canReject: false,
    },
    {
      id: 'approval_4',
      messageId: 'msg_4',
      type: 'pago' as const,
      title: 'Nexus Dynamics',
      subtitle: 'Pago de licencias',
      amount: 'EUR 980.75',
      currency: 'EUR',
      company: 'Nexus Dynamics',
      status: 'rejected' as const,
      approverId: 'carlos_d',
      approverName: 'Carlos D.',
      approvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      senderId: 'david_f',
      senderName: 'David F.',
      senderAvatar: undefined,
      attachments: [],
      canApprove: false,
      canReject: false,
    },
  ];

  // Scroll automático al final cuando se agregan mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, activeChannel?.id]);

  if (!activeChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bienvenido a UTalk
          </h3>
          <p className="text-gray-500">
            Selecciona un canal del sidebar para comenzar a colaborar
          </p>
        </div>
      </div>
    );
  }

  const channelMessages = state.messages[activeChannel.id] || [];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Mensaje de bienvenida del canal */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            #{activeChannel.name}
          </h2>
          <p className="text-gray-600">
            {activeChannel.description}
          </p>
        </div>

        {/* ApprovalCards */}
        <div className="space-y-4">
          {sampleApprovalCards.map((card) => (
            <ApprovalCard
              key={card.id}
              card={card}
              onApprove={() => {
                // Lógica de aprobación
                console.log('Aprobar:', card.id);
              }}
              onReject={() => {
                // Lógica de rechazo
                console.log('Rechazar:', card.id);
              }}
              onViewDetails={() => {
                // Lógica para ver detalles
                console.log('Ver detalles:', card.id);
              }}
              onForward={() => {
                // Lógica de reenvío
                console.log('Reenviar:', card.id);
              }}
            />
          ))}
        </div>

        {/* Mensajes regulares (si los hay) */}
        {channelMessages.length > 0 && (
          <div className="mt-8 space-y-4">
            {channelMessages.map((message) => (
              <div key={message.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {message.senderName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{message.senderName}</span>
                      <span className="text-sm text-gray-500">
                        {message.timestamp.toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Referencia para scroll automático */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
