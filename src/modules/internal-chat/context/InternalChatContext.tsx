import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  InternalChatState, 
  InternalChatActions, 
  InternalChannel, 
  InternalMessage, 
  DirectMessage, 
  InternalUser,
  CanvasView,
  CopilotMessage,
  MessageMetadata
} from '../../../types/internal-chat';

// Estado inicial
const initialState: InternalChatState = {
  channels: [],
  activeChannel: null,
  messages: {},
  directMessages: [],
  users: [],
  currentUser: null,
  rightPanelTab: 'info',
  canvasView: null,
  copilotMessages: [],
  loading: false,
  error: null,
};

// Tipos de acciones
type InternalChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CHANNELS'; payload: InternalChannel[] }
  | { type: 'SET_ACTIVE_CHANNEL'; payload: string }
  | { type: 'SET_MESSAGES'; payload: { channelId: string; messages: InternalMessage[] } }
  | { type: 'ADD_MESSAGE'; payload: { channelId: string; message: InternalMessage } }
  | { type: 'UPDATE_MESSAGE'; payload: { channelId: string; messageId: string; updates: Partial<InternalMessage> } }
  | { type: 'SET_DIRECT_MESSAGES'; payload: DirectMessage[] }
  | { type: 'SET_USERS'; payload: InternalUser[] }
  | { type: 'SET_CURRENT_USER'; payload: InternalUser }
  | { type: 'SET_RIGHT_PANEL_TAB'; payload: string }
  | { type: 'SET_CANVAS_VIEW'; payload: CanvasView | null }
  | { type: 'ADD_COPILOT_MESSAGE'; payload: CopilotMessage }
  | { type: 'MARK_MESSAGES_READ'; payload: { channelId: string; messageIds: string[] } }
  | { type: 'CREATE_CHANNEL'; payload: InternalChannel }
  | { type: 'UPDATE_CHANNEL'; payload: { channelId: string; updates: Partial<InternalChannel> } }
  | { type: 'DELETE_CHANNEL'; payload: string };

// Reducer
const internalChatReducer = (state: InternalChatState, action: InternalChatAction): InternalChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CHANNELS':
      return { ...state, channels: action.payload };
    
    case 'SET_ACTIVE_CHANNEL':
      const activeChannel = state.channels.find(c => c.id === action.payload) || null;
      return { ...state, activeChannel };
    
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.channelId]: action.payload.messages,
        },
      };
    
    case 'ADD_MESSAGE':
      const existingMessages = state.messages[action.payload.channelId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.channelId]: [...existingMessages, action.payload.message],
        },
      };
    
    case 'UPDATE_MESSAGE':
      const channelMessages = state.messages[action.payload.channelId] || [];
      const updatedMessages = channelMessages.map(msg =>
        msg.id === action.payload.messageId
          ? { ...msg, ...action.payload.updates }
          : msg
      );
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.channelId]: updatedMessages,
        },
      };
    
    case 'SET_DIRECT_MESSAGES':
      return { ...state, directMessages: action.payload };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'SET_RIGHT_PANEL_TAB':
      return { ...state, rightPanelTab: action.payload };
    
    case 'SET_CANVAS_VIEW':
      return { ...state, canvasView: action.payload };
    
    case 'ADD_COPILOT_MESSAGE':
      return {
        ...state,
        copilotMessages: [...state.copilotMessages, action.payload],
      };
    
    case 'MARK_MESSAGES_READ':
      const messagesToUpdate = state.messages[action.payload.channelId] || [];
      const markedMessages = messagesToUpdate.map(msg =>
        action.payload.messageIds.includes(msg.id)
          ? { ...msg, status: 'read' as const }
          : msg
      );
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.channelId]: markedMessages,
        },
      };
    
    case 'CREATE_CHANNEL':
      return {
        ...state,
        channels: [...state.channels, action.payload],
      };
    
    case 'UPDATE_CHANNEL':
      const updatedChannels = state.channels.map(channel =>
        channel.id === action.payload.channelId
          ? { ...channel, ...action.payload.updates }
          : channel
      );
      return { ...state, channels: updatedChannels };
    
    case 'DELETE_CHANNEL':
      const filteredChannels = state.channels.filter(c => c.id !== action.payload);
      return {
        ...state,
        channels: filteredChannels,
        activeChannel: state.activeChannel?.id === action.payload ? null : state.activeChannel,
      };
    
    default:
      return state;
  }
};

// Contexto
const InternalChatContext = createContext<{
  state: InternalChatState;
  actions: InternalChatActions;
} | null>(null);

// Provider
export const InternalChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(internalChatReducer, initialState);

  const actions: InternalChatActions = {
    setActiveChannel: (channelId: string) => {
      dispatch({ type: 'SET_ACTIVE_CHANNEL', payload: channelId });
    },

    sendMessage: (channelId: string, content: string, type = 'text', metadata?: MessageMetadata) => {
      const message: InternalMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId,
        senderId: state.currentUser?.id || 'unknown',
        senderName: state.currentUser?.name || 'Usuario',
        senderAvatar: state.currentUser?.avatar,
        content,
        type: type as any,
        timestamp: new Date(),
        metadata,
        status: 'sent',
      };

      dispatch({ type: 'ADD_MESSAGE', payload: { channelId, message } });
    },

    approveRequest: (messageId: string, approvalId: string, notes?: string) => {
      if (!state.activeChannel) return;

      const channelMessages = state.messages[state.activeChannel.id] || [];
      const message = channelMessages.find(m => m.id === messageId);
      
      if (message && message.approvalData) {
        const updatedApprovalData = {
          ...message.approvalData,
          status: 'approved' as const,
          approverId: state.currentUser?.id,
          approverName: state.currentUser?.name,
          approvedAt: new Date(),
          notes,
        };

        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            channelId: state.activeChannel.id,
            messageId,
            updates: { approvalData: updatedApprovalData },
          },
        });
      }
    },

    rejectRequest: (messageId: string, approvalId: string, notes?: string) => {
      if (!state.activeChannel) return;

      const channelMessages = state.messages[state.activeChannel.id] || [];
      const message = channelMessages.find(m => m.id === messageId);
      
      if (message && message.approvalData) {
        const updatedApprovalData = {
          ...message.approvalData,
          status: 'rejected' as const,
          approverId: state.currentUser?.id,
          approverName: state.currentUser?.name,
          approvedAt: new Date(),
          notes,
        };

        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            channelId: state.activeChannel.id,
            messageId,
            updates: { approvalData: updatedApprovalData },
          },
        });
      }
    },

    setRightPanelTab: (tabId: string) => {
      dispatch({ type: 'SET_RIGHT_PANEL_TAB', payload: tabId });
    },

    setCanvasView: (view: CanvasView) => {
      dispatch({ type: 'SET_CANVAS_VIEW', payload: view });
    },

    addCopilotMessage: (message: CopilotMessage) => {
      dispatch({ type: 'ADD_COPILOT_MESSAGE', payload: message });
    },

    markAsRead: (channelId: string, messageIds: string[]) => {
      dispatch({ type: 'MARK_MESSAGES_READ', payload: { channelId, messageIds } });
    },

    createChannel: (channelData) => {
      const channel: InternalChannel = {
        ...channelData,
        id: `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch({ type: 'CREATE_CHANNEL', payload: channel });
    },

    updateChannel: (channelId: string, updates: Partial<InternalChannel>) => {
      dispatch({ type: 'UPDATE_CHANNEL', payload: { channelId, updates } });
    },

    deleteChannel: (channelId: string) => {
      dispatch({ type: 'DELETE_CHANNEL', payload: channelId });
    },
  };

  return (
    <InternalChatContext.Provider value={{ state, actions }}>
      {children}
    </InternalChatContext.Provider>
  );
};

// Hook para usar el contexto
export const useInternalChat = () => {
  const context = useContext(InternalChatContext);
  if (!context) {
    throw new Error('useInternalChat debe ser usado dentro de InternalChatProvider');
  }
  return context;
};
