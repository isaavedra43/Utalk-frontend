// ✅ EXPORTACIONES DEL MÓDULO CHAT

// Components
export { ConversationList } from './components/ConversationList'
export { MessageBubble } from './components/MessageBubble'
export { MessageInput } from './components/MessageInput'
export { MessageList } from './components/MessageList'
export { MessageStatus } from './components/MessageStatus'
export { ChatWindow } from './components/ChatWindow'
export { ConversationItem } from './components/ConversationItem'
export { FileRenderer } from './components/FileRenderer'
export { FileUpload } from './components/FileUpload'
export { Inbox } from './Inbox'
export { ResponsiveInbox } from './components/ResponsiveInbox'
export { Avatar } from './components/Avatar'
export { ChannelBadge } from './components/ChannelBadge'
export { InfoPanel } from './components/InfoPanel'
export { IAPanel } from './components/IAPanel'
export { AudioPlayer } from './components/AudioPlayer'
export { AudioRecorder } from './components/AudioRecorder'
export { TouchFeedback } from './components/TouchFeedback'
export { LazyIAPanel } from './components/LazyPanels'

// Hooks
export { useMessages } from './hooks/useMessages'
export { useConversations } from './hooks/useConversations'
export { useSocket } from './hooks/useSocket'
export { useConversationData } from './hooks/useConversationData'
export { useTemporaryUrl } from './hooks/useTemporaryUrl'

// Services
export { messageService } from './services/messageService'
export { conversationService } from './services/conversationService'
export { contactService } from './services/contactService'
export { uploadService } from './services/uploadService'

// Types - Import desde types/canonical
export type { 
  CanonicalMessage, 
  CanonicalConversation, 
  CanonicalFileAttachment as FileAttachment
} from '@/types/canonical'
export type { SendMessageData } from './types'

// Constants
export { SOCKET_EVENTS } from './constants/socketEvents'

// Validators
export {
  validateMessageEvent,
  validateMessageReadEvent,
  validateTypingEvent,
  validateUserEvent,
  validateSocketEvent
} from './validators/socketValidators' 