/**
 * Tipos centralizados para UTalk Frontend
 * Basados en los modelos exactos del backend (1.md, 1.5.md, 2.md, 3.md)
 * 
 * Todos los tipos están alineados 100% con las estructuras JSON del backend
 */

// ============================================================================
// TIPOS DE AUTENTICACIÓN
// ============================================================================

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'agent' | 'viewer';
    isActive: boolean;
    avatar?: string | null;
    lastSeen?: string;
    isOnline?: boolean;
    permissions?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType?: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        tokens: AuthTokens;
    };
}

export interface RefreshTokenResponse {
    success: boolean;
    data: AuthTokens;
}

export interface LogoutResponse {
    success: boolean;
    message: string;
    data: {
        loggedOutAt: string;
    };
}

// ============================================================================
// TIPOS DE CONTACTO
// ============================================================================

export interface Contact {
    id: string;
    name: string | null;
    phone: string;
    email: string | null;
    avatar: string | null;
    company: string | null;
    notes: string | null;
    channel: string;
    isActive: boolean;
    tags: string[];
    metadata?: {
        lastContact?: string;
        totalConversations?: number;
        totalMessages?: number;
        preferredLanguage?: string;
    };
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// TIPOS DE MENSAJE
// ============================================================================

export interface MessageSender {
    identifier: string;
    type: 'customer' | 'agent';
    name?: string;
}

export interface MessageRecipient {
    identifier: string;
    type: 'customer' | 'agent';
    name?: string;
}

export interface MessageFileInfo {
    filename: string;
    size: number;
    mimeType: string;
    thumbnail?: string;
}

export interface MessageMetadata {
    twilioSid?: string;
    sentViaSocket?: boolean;
    socketId?: string | null;
    readBy?: string[];
    readAt?: string;
    failureReason?: string;
    retryable?: boolean;
    retryCount?: number;
    maxRetries?: number;
    twilioError?: string;
    fileInfo?: MessageFileInfo;
}

export interface Message {
    id: string;
    conversationId: string;
    content: string;
    mediaUrl?: string | null;
    senderIdentifier: string;
    recipientIdentifier: string;
    sender: MessageSender;
    recipient: MessageRecipient;
    direction: 'inbound' | 'outbound';
    type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
    metadata?: MessageMetadata;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// TIPOS DE CONVERSACIÓN
// ============================================================================

export interface ConversationUser {
    id: string;
    name: string;
    email?: string;
    role?: string;
}

export interface ConversationLastMessage {
    id: string;
    content: string;
    timestamp: string;
    sender: string;
    type: string;
    status?: string;
}

export interface ConversationMetadata {
    source?: string;
    autoAssigned?: boolean;
    favorite?: boolean;
}

export interface Conversation {
    id: string;
    participants: string[];
    customerPhone: string;
    contact?: Contact;
    assignedTo?: ConversationUser | null;
    status: 'open' | 'pending' | 'resolved' | 'archived';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    tags: string[];
    unreadCount: number;
    messageCount: number;
    lastMessage?: ConversationLastMessage | null;
    lastMessageId?: string;
    lastMessageAt?: string;
    createdAt: string;
    updatedAt: string;
    metadata?: ConversationMetadata;
}

// ============================================================================
// TIPOS DE ARCHIVO
// ============================================================================

export interface FileMetadata {
    uploadedBy: string;
    uploadedAt?: string;
    conversationId?: string;
    messageId?: string;
    progress?: number;
    error?: string;
    errorCode?: string;
}

export interface File {
    id: string;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    url?: string | null;
    thumbnail?: string | null;
    metadata?: FileMetadata;
    status: 'uploading' | 'uploaded' | 'failed';
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// TIPOS DE PAGINACIÓN
// ============================================================================

export interface Pagination {
    hasMore: boolean;
    nextCursor?: string;
    totalResults: number;
    limit: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
}

// ============================================================================
// TIPOS DE RESPUESTAS API
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    pagination?: Pagination;
    metadata?: {
        queryTime?: string;
        appliedFilters?: string[];
    };
}

export interface ConversationsResponse extends ApiResponse<Conversation[]> { }
export interface MessagesResponse extends ApiResponse<Message[]> { }
export interface ContactsResponse extends ApiResponse<Contact[]> { }
export interface FilesResponse extends ApiResponse<File[]> { }

// ============================================================================
// TIPOS DE FILTROS
// ============================================================================

export interface ConversationFilters {
    page?: number;
    limit?: number;
    status?: 'open' | 'pending' | 'resolved' | 'archived';
    assignedTo?: string;
    search?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    tags?: string[];
    startDate?: string;
    endDate?: string;
}

export interface MessageFilters {
    limit?: number;
    cursor?: string;
    direction?: 'inbound' | 'outbound' | 'all';
    status?: 'sent' | 'delivered' | 'read' | 'failed';
    type?: 'text' | 'image' | 'audio' | 'video' | 'document';
    startDate?: string;
    endDate?: string;
}

export interface ContactFilters {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    isActive?: boolean;
}

// ============================================================================
// TIPOS DE ESTADÍSTICAS
// ============================================================================

export interface ConversationStats {
    total: number;
    open: number;
    pending: number;
    resolved: number;
    archived: number;
    avgResponseTime: string;
    avgResolutionTime: string;
}

export interface MessageStats {
    total: number;
    inbound: number;
    outbound: number;
    byType: {
        text: number;
        image: number;
        document: number;
        audio: number;
        video: number;
    };
    avgPerConversation: number;
}

// ============================================================================
// TIPOS DE ERRORES
// ============================================================================

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}

export interface BackendErrorResponse {
    success: false;
    message: string;
    code?: string;
    retryAfter?: number;
}

// ============================================================================
// TIPOS DE SOCKET.IO
// ============================================================================

export interface SocketMessage extends Message { }

export interface MessageStatusUpdate {
    messageId: string;
    conversationId: string;
    status: Message['status'];
    metadata?: MessageMetadata;
}

export interface TypingIndicator {
    conversationId: string;
    userEmail: string;
    userName: string;
    isTyping: boolean;
}

export interface UserPresence {
    userId: string;
    email: string;
    name: string;
    status: 'online' | 'offline' | 'away' | 'busy';
    lastSeen?: string;
    isTyping?: boolean;
    currentConversationId?: string;
}

export interface ConversationEvent {
    conversationId: string;
    userEmail: string;
}

export interface SystemMessage {
    message: string;
    type: 'info' | 'warning' | 'error';
    timestamp: string;
}

export interface SocketError {
    message: string;
    code?: string;
    timestamp: string;
}

// ============================================================================
// TIPOS DE ESTADOS DE STORES
// ============================================================================

export interface ConversationsState {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    loading: boolean;
    error: string | null;
    pagination: Pagination | null;
    filters: ConversationFilters;
}

export interface MessagesState {
    messages: Message[];
    currentConversationId: string | null;
    loading: boolean;
    error: string | null;
    pagination: Pagination | null;
    filters: MessageFilters;
    hasMore: boolean;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
    dismissed?: boolean;
}

export interface NotificationsState {
    notifications: Notification[];
}

export interface TypingState {
    [conversationId: string]: {
        [userEmail: string]: {
            userName: string;
            timestamp: number;
        };
    };
}

export interface PresenceState {
    [userId: string]: UserPresence;
}

// ============================================================================
// TIPOS DE VALIDACIÓN
// ============================================================================

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

export interface MessageValidationResult extends ValidationResult {
    remainingBytes?: number;
}

export interface FileValidationResult extends ValidationResult {
    invalidFiles?: string[];
}

// ============================================================================
// TIPOS DE CONFIGURACIÓN
// ============================================================================

export interface ValidationLimits {
    MESSAGE_MAX_LENGTH: number;
    FILE_MAX_SIZE: number;
    FILE_MAX_COUNT: number;
    MAX_RECONNECT_ATTEMPTS: number;
}

export interface Environment {
    API_URL: string;
    SOCKET_URL: string;
    VALIDATION_LIMITS: ValidationLimits;
} 