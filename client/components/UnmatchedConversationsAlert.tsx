import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ContactEditModal } from './ContactEditModal';
import { useUnmatchedConversations, useContactConversationStats } from '@/hooks/useEnrichedConversations';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  AlertTriangle, 
  Phone, 
  UserPlus, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function UnmatchedConversationsAlert() {
  const { hasPermission } = usePermissions();
  const canCreateContacts = hasPermission('create_contacts');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedConversationPhone, setSelectedConversationPhone] = useState<string | null>(null);
  
  const { 
    unmatchedConversations, 
    isLoading, 
    count, 
    hasUnmatched 
  } = useUnmatchedConversations();
  
  const {
    total,
    withContacts,
    contactMatchRate,
    needsAttention,
    recommendation
  } = useContactConversationStats();

  // No mostrar si no hay conversaciones sin relacionar
  if (isLoading || !hasUnmatched) {
    return null;
  }

  const getAlertVariant = () => {
    if (contactMatchRate >= 80) return 'default';
    if (contactMatchRate >= 50) return 'warning';
    return 'destructive';
  };

  const getStatusIcon = () => {
    if (contactMatchRate >= 80) return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (contactMatchRate >= 50) return <TrendingUp className="h-4 w-4 text-yellow-400" />;
    return <TrendingDown className="h-4 w-4 text-red-400" />;
  };

  const handleCreateContact = (phone: string) => {
    if (canCreateContacts) {
      setSelectedConversationPhone(phone);
    }
  };

  return (
    <>
      <Alert className={cn(
        "border-l-4 mb-4",
        contactMatchRate >= 80 ? "border-l-green-500 bg-green-950/20" :
        contactMatchRate >= 50 ? "border-l-yellow-500 bg-yellow-950/20" :
        "border-l-red-500 bg-red-950/20"
      )}>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <AlertTriangle className="h-4 w-4" />
        </div>
        <AlertDescription>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Estado de Contactos vs Conversaciones
                </p>
                <p className="text-sm text-gray-400">
                  {recommendation}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Badge variant={needsAttention ? "destructive" : "default"}>
                    {contactMatchRate}% relacionadas
                  </Badge>
                  <Badge variant="outline">
                    {count} sin contacto
                  </Badge>
                </div>
              </div>
            </div>

            {/* Estadísticas detalladas */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-400">Total</p>
                <p className="font-medium text-white">{total}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400">Con contacto</p>
                <p className="font-medium text-green-400">{withContacts}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400">Sin contacto</p>
                <p className="font-medium text-red-400">{count}</p>
              </div>
            </div>

            {/* Botón para expandir */}
            {count > 0 && (
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Ocultar conversaciones sin contacto
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Ver {count} conversaciones sin contacto
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Conversaciones sin contacto relacionado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {unmatchedConversations.map((conversation, index) => {
                            const phone = conversation.customerPhone || conversation.phone;
                            
                            return (
                              <div
                                key={conversation.id}
                                className="flex items-center justify-between p-3 bg-gray-900/50 rounded border border-gray-700 hover:bg-gray-900/70 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full">
                                    <MessageSquare className="h-4 w-4 text-gray-300" />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">{phone || 'Sin número'}</p>
                                    <p className="text-xs text-gray-400 truncate max-w-48">
                                      {conversation.lastMessage || 'Sin mensaje'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {conversation.isUnread && (
                                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                                  )}
                                  
                                  {canCreateContacts && phone && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCreateContact(phone)}
                                      className="text-xs"
                                    >
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      Crear contacto
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      
                      {!canCreateContacts && (
                        <div className="mt-3 p-2 bg-yellow-950/20 border border-yellow-600/30 rounded text-xs text-yellow-200">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          No tienes permisos para crear contactos. Contacta a tu administrador.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Modal para crear contacto */}
      <ContactEditModal
        conversationPhone={selectedConversationPhone || undefined}
        isOpen={!!selectedConversationPhone}
        onClose={() => setSelectedConversationPhone(null)}
        onSave={() => {
          // El hook se actualizará automáticamente y la alerta se ajustará
          setSelectedConversationPhone(null);
        }}
      />
    </>
  );
}

/**
 * Versión compacta del alerta para usar en sidebars
 */
export function UnmatchedConversationsCompactAlert() {
  const { count, hasUnmatched } = useUnmatchedConversations();
  const { contactMatchRate } = useContactConversationStats();

  if (!hasUnmatched) return null;

  return (
    <div className="p-2 bg-red-950/20 border border-red-600/30 rounded-lg text-xs">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-3 w-3 text-red-400" />
        <span className="text-red-200">
          {count} conversaciones sin contacto
        </span>
        <Badge variant="outline" className="text-xs">
          {contactMatchRate}%
        </Badge>
      </div>
    </div>
  );
} 