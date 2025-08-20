# 03 - COMPONENTES PÁGINAS Y PATRONES UI

## 1. Diseño y sistema de componentes

### Tokens de diseño
- **Tipografía**: Inter como fuente principal
- **Espaciado**: Sistema de 4px (4, 8, 12, 16, 20, 24, 32, 48, 64)
- **Colores semánticos**:
  - Success: `green-500`, `green-600`
  - Warning: `yellow-500`, `yellow-600`
  - Error: `red-500`, `red-600`
  - Info: `blue-500`, `blue-600`

### Componentes base (ui/)
```typescript
// src/components/ui/LazyMotion.tsx
import { LazyMotion, domAnimation } from 'framer-motion';

export const LazyMotion: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
);

// src/components/ui/ToggleSwitch.tsx
import { Switch } from '@radix-ui/react-switch';

export interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  label
}) => (
  <div className="flex items-center space-x-2">
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-600 disabled:opacity-50"
    >
      <span className="block w-5 h-5 bg-white rounded-full transition-transform duration-200 translate-x-0.5 data-[state=checked]:translate-x-6" />
    </Switch>
    {label && <span className="text-sm text-gray-700">{label}</span>}
  </div>
);
```

## 2. Páginas principales (implementadas)

### Estructura de rutas
```typescript
// src/App.tsx
<Routes>
  <Route path="/login" element={<AuthModule />} />
  <Route path="/forgot-password" element={<ForgotPasswordForm />} />
  
  <Route path="/" element={
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  }>
    <Route path="/chat" element={<ChatPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/team" element={<TeamPage />} />
    <Route path="/clients" element={<ClientsPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
  </Route>
</Routes>
```

### Layout principal
```typescript
// src/components/layout/MainLayout.tsx
export const MainLayout: React.FC = () => {
  const { currentModule } = useSidebar();
  
  return (
    <div className="flex h-screen bg-gray-50">
      <LeftSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex">
          <div className="flex-1 overflow-hidden">
            {currentModule === 'chat' && <ChatModule />}
            {currentModule === 'dashboard' && <DashboardModule />}
            {currentModule === 'team' && <TeamModule />}
            {currentModule === 'clients' && <ClientModule />}
            {currentModule === 'notifications' && <NotificationsModule />}
          </div>
          <RightSidebar />
        </div>
      </main>
    </div>
  );
};
```

## 3. Componentes críticos del Chat

### MessageBubble (implementado)
```typescript
// src/components/chat/MessageBubble.tsx
export interface MessageBubbleProps {
  message: Message;
  customerName: string;
  onRetry?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  customerName,
  onRetry,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getMessageStatus = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="w-2.5 h-2.5 text-blue-200" />;
      case 'delivered':
        return <CheckCheck className="w-2.5 h-2.5 text-blue-200" />;
      case 'sent':
        return <Check className="w-2.5 h-2.5 text-blue-200" />;
      case 'failed':
        return (
          <div className="flex items-center gap-1">
            <span className="text-xs text-red-300">Error</span>
            {onRetry && (
              <button
                onClick={() => onRetry(message.id)}
                className="p-1 text-red-300 hover:text-red-100 hover:bg-red-500 rounded transition-colors"
                title="Reintentar envío"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      case 'sending':
        return (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-blue-200 border-t-white rounded-full animate-spin"></div>
            {onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 text-blue-200 hover:text-red-300 hover:bg-red-500 rounded transition-colors"
                title="Cancelar envío"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${message.senderId === 'bot' ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[70%] ${message.senderId === 'bot' ? 'bg-white' : 'bg-blue-500'} rounded-2xl p-3 shadow-sm`}>
        <MessageContent message={message} />
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{formatTime()}</span>
          {getMessageStatus(message.status)}
        </div>
      </div>
    </div>
  );
};
```

### ChatInput (implementado)
```typescript
// src/components/chat/MessageInput.tsx
export interface MessageInputProps {
  onSend: (payload: { messageId: string; text?: string; media?: File }) => Promise<void>;
  disabled?: boolean;
  conversationId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  conversationId
}) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { emit } = useWebSocket();

  const handleSend = async () => {
    if (!text.trim() || disabled) return;
    
    const messageId = crypto.randomUUID();
    const messageText = text.trim();
    setText('');
    
    try {
      await onSend({ messageId, text: messageText });
      
      // Emitir typing stop
      emit('typing:stop', { conversationId });
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (value: string) => {
    setText(value);
    
    // Emitir typing start/stop
    if (value.trim() && !isTyping) {
      emit('typing:start', { conversationId });
      setIsTyping(true);
    } else if (!value.trim() && isTyping) {
      emit('typing:stop', { conversationId });
      setIsTyping(false);
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 bg-white border-t">
      <div className="flex-1">
        <textarea
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribe un mensaje..."
          className="w-full resize-none border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={1}
          disabled={disabled}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Enviar
      </button>
    </div>
  );
};
```

### ConversationListItem (implementado)
```typescript
// src/components/chat/ConversationItem.tsx
export interface ConversationItemProps {
  conversation: Conversation;
  selected?: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  selected = false,
  onClick,
  unreadCount = 0
}) => {
  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'dd/MM');
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b cursor-pointer transition-colors ${
        selected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">
              {conversation.customerName || 'Cliente'}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              conversation.status === 'open' ? 'bg-green-100 text-green-800' :
              conversation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              conversation.status === 'closed' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {conversation.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate mt-1">
            {conversation.customerEmail || 'Sin email'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-gray-400">
            {formatLastMessageTime(conversation.lastMessageAt)}
          </span>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
```

## 4. Componentes de Media y Upload

### MediaUploader (implementado)
```typescript
// src/components/chat/FileUploadManager.tsx
export interface FileUploadManagerProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  onFileSelect,
  accept = "image/*,audio/*,.pdf,.doc,.docx",
  maxSizeMB = 10,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`);
      return;
    }

    // Validar tipo
    const allowedTypes = accept.split(',');
    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', ''));
      }
      return fileType === type || fileExtension === type;
    });

    if (!isValidType) {
      toast.error('Tipo de archivo no permitido');
      return;
    }

    onFileSelect(file);
    
    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        title="Adjuntar archivo"
      >
        <Paperclip className="w-5 h-5" />
      </button>
    </div>
  );
};
```

### FileUploadPreview (implementado)
```typescript
// src/components/chat/FileUploadPreview.tsx
export interface FileUploadPreviewProps {
  file: File;
  onRemove: () => void;
  uploadProgress?: number;
}

export const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({
  file,
  onRemove,
  uploadProgress
}) => {
  const isImage = file.type.startsWith('image/');
  const isAudio = file.type.startsWith('audio/');

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      {isImage && (
        <img
          src={URL.createObjectURL(file)}
          alt="Preview"
          className="w-12 h-12 object-cover rounded"
        />
      )}
      {isAudio && (
        <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
          <Volume2 className="w-6 h-6 text-blue-600" />
        </div>
      )}
      {!isImage && !isAudio && (
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
          <File className="w-6 h-6 text-gray-600" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
        {uploadProgress !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
      
      <button
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-red-500"
        title="Eliminar archivo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
```

## 5. Formularios y validación

### LoginForm (implementado)
```typescript
// src/modules/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres')
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login, loading, error } = useAuthStore();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          {...form.register('email')}
          type="email"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          {...form.register('password')}
          type="password"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {form.formState.errors.password && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  );
};
```

## 6. Patrones de UX implementados

### Optimistic UI
```typescript
// Ejemplo en envío de mensajes
const handleSendMessage = async (text: string) => {
  const messageId = crypto.randomUUID();
  
  // 1. UI optimista - mostrar mensaje inmediatamente
  const optimisticMessage: Message = {
    id: messageId,
    messageId,
    conversationId,
    type: 'text',
    text,
    createdAt: new Date().toISOString(),
    senderId: 'user',
    status: 'sending'
  };
  
  // Agregar a la lista local
  addLocalMessage(optimisticMessage);
  
  try {
    // 2. Enviar al servidor
    const savedMessage = await sendMessage({ messageId, conversationId, type: 'text', text });
    
    // 3. Actualizar con respuesta del servidor
    updateLocalMessage(messageId, { ...savedMessage, status: 'sent' });
  } catch (error) {
    // 4. Marcar como fallido si hay error
    updateLocalMessage(messageId, { status: 'failed' });
  }
};
```

### Loading States
```typescript
// src/components/dashboard/LoadingSpinner.tsx
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin`} />
    </div>
  );
};
```

### Empty States
```typescript
// src/components/chat/ConversationList.tsx
export const ConversationList: React.FC = () => {
  const { data: conversations, isLoading } = useConversations();

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!conversations?.items?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <MessageSquare className="w-12 h-12 mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay conversaciones</h3>
        <p className="text-sm">Las conversaciones aparecerán aquí cuando los clientes inicien un chat</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.items.map(conversation => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          onClick={() => selectConversation(conversation.id)}
        />
      ))}
    </div>
  );
};
```

## 7. Responsividad

### Breakpoints implementados
```css
/* tailwind.config.js */
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

### Layout responsive
```typescript
// src/components/layout/MainLayout.tsx
export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar móvil */}
      <div className={`lg:hidden fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <LeftSidebar />
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <LeftSidebar />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          {/* Contenido del módulo actual */}
        </main>
      </div>
    </div>
  );
};
```

## 8. Estados de error

### ErrorBoundary (implementado)
```typescript
// src/components/dashboard/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Aquí se podría enviar a Sentry o similar
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Algo salió mal
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Ha ocurrido un error inesperado. Por favor, recarga la página.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Toast notifications
```typescript
// src/utils/notifications.ts
import toast from 'react-hot-toast';

export const showNotification = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  dismiss: (toastId: string) => toast.dismiss(toastId)
};
```

## 9. Componentes de Dashboard

### KPICards (implementado)
```typescript
// src/components/dashboard/KPICards.tsx
export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-lg font-medium text-gray-900">
              {value}
            </dd>
          </dl>
        </div>
      </div>
    </div>
    {change !== undefined && (
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <span className={`font-medium ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? '+' : '-'}{Math.abs(change)}%
          </span>
          <span className="text-gray-500"> desde el mes pasado</span>
        </div>
      </div>
    )}
  </div>
);
```

## 10. Patrones de navegación

### Breadcrumbs
```typescript
// src/components/common/Breadcrumbs.tsx
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => (
  <nav className="flex" aria-label="Breadcrumb">
    <ol className="flex items-center space-x-4">
      {items.map((item, index) => (
        <li key={index}>
          <div className="flex items-center">
            {index > 0 && (
              <ChevronRight className="flex-shrink-0 h-5 w-5 text-gray-400" />
            )}
            {item.href ? (
              <Link
                to={item.href}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {item.label}
              </Link>
            ) : (
              <span className="ml-4 text-sm font-medium text-gray-900">
                {item.label}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  </nav>
);
```

### Tabs
```typescript
// src/components/common/Tabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, defaultValue }) => (
  <Tabs defaultValue={defaultValue || items[0]?.value} className="w-full">
    <TabsList className="grid w-full grid-cols-3">
      {items.map(item => (
        <TabsTrigger key={item.value} value={item.value}>
          {item.label}
        </TabsTrigger>
      ))}
    </TabsList>
    {items.map(item => (
      <TabsContent key={item.value} value={item.value}>
        {item.content}
      </TabsContent>
    ))}
  </Tabs>
);
``` 