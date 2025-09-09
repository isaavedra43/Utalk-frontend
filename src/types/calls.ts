// Tipos para el módulo de llamadas con Twilio
export interface Call {
  id: string;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  startTime: Date;
  endTime?: Date;
  status: 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer';
  queueId?: string;
  agentId?: string;
  recordingUrl?: string;
  transcriptId?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  dispositions: string[];
  talkTime: number;
  holdTime: number;
  silenceTime: number;
  cost?: number;
  contactId?: string;
  ticketId?: string;
  conferenceId?: string;
  transferHistory: CallTransfer[];
  tags: string[];
  notes: string;
  qaScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CallTransfer {
  id: string;
  type: 'warm' | 'cold';
  fromAgentId: string;
  toAgentId?: string;
  toQueueId?: string;
  timestamp: Date;
  reason?: string;
}

export interface Transcript {
  id: string;
  callId: string;
  text: string;
  channel: 'agent' | 'customer' | 'both';
  words: TranscriptWord[];
  timestamps: TranscriptTimestamp[];
  piiRedacted: boolean;
  confidence: number;
  createdAt: Date;
}

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string;
}

export interface TranscriptTimestamp {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface CallSummary {
  id: string;
  callId: string;
  bullets: string[];
  actionItems: ActionItem[];
  tags: string[];
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  createdAt: Date;
}

export interface ActionItem {
  id: string;
  text: string;
  assignedTo?: string;
  dueDate?: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Queue {
  id: string;
  name: string;
  description?: string;
  skills: string[];
  priorities: QueuePriority[];
  hours: QueueHours;
  holidays: QueueHoliday[];
  maxWaitTime: number;
  overflowQueueId?: string;
  recordingEnabled: boolean;
  transcriptionEnabled: boolean;
  announcementMessage?: string;
  holdMusicUrl?: string;
  estimatedWaitTime?: number;
  currentCalls: number;
  agentsAvailable: number;
  averageWaitTime: number;
  serviceLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueuePriority {
  skill: string;
  priority: number;
  weight: number;
}

export interface QueueHours {
  timezone: string;
  schedule: {
    [key: string]: {
      open: string;
      close: string;
      enabled: boolean;
    };
  };
}

export interface QueueHoliday {
  date: string;
  name: string;
  enabled: boolean;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  extension: string;
  presence: 'available' | 'busy' | 'away' | 'offline';
  skills: string[];
  permissions: AgentPermission[];
  currentCallId?: string;
  currentQueueId?: string;
  status: 'idle' | 'ringing' | 'in-call' | 'after-call-work' | 'break';
  aht: number; // Average Handle Time
  callsPerHour: number;
  slaPercentage: number;
  qaScore: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentPermission {
  type: 'supervisor' | 'agent' | 'qa' | 'auditor' | 'admin';
  permissions: string[];
}

export interface Voicemail {
  id: string;
  callId: string;
  audioUrl: string;
  transcriptId?: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'listened' | 'replied' | 'archived';
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Callback {
  id: string;
  contactId: string;
  phoneNumber: string;
  requestedBy: string;
  scheduledFor: Date;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface QAReview {
  id: string;
  callId: string;
  rubricId: string;
  reviewerId: string;
  score: number;
  maxScore: number;
  notes: string;
  criteria: QACriteria[];
  status: 'pending' | 'completed' | 'disputed';
  createdAt: Date;
  updatedAt: Date;
}

export interface QACriteria {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  notes?: string;
}

export interface QARubric {
  id: string;
  name: string;
  description: string;
  criteria: QARubricCriteria[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QARubricCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  required: boolean;
}

export interface CallConfig {
  id: string;
  recordingPolicy: {
    enabled: boolean;
    announcement: boolean;
    consentRequired: boolean;
    retentionDays: number;
  };
  transcriptionPolicy: {
    enabled: boolean;
    provider: 'twilio' | 'google' | 'deepgram' | 'whisper';
    realTime: boolean;
    piiRedaction: boolean;
  };
  piiRules: PIIRule[];
  sttProvider: 'twilio' | 'google' | 'deepgram' | 'whisper';
  ttsProvider: 'twilio' | 'google' | 'azure';
  summaryTemplates: SummaryTemplate[];
  dialerLimits: {
    powerDialer: {
      maxConcurrent: number;
      pauseBetweenCalls: number;
    };
    predictiveDialer: {
      maxConcurrent: number;
      abandonRate: number;
      answerRate: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PIIRule {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  enabled: boolean;
}

export interface SummaryTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  isDefault: boolean;
}

export interface PhoneNumber {
  id: string;
  number: string;
  friendlyName: string;
  type: 'local' | 'toll-free' | 'mobile';
  country: string;
  region: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  assignedTo?: string;
  queueId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVRMenu {
  id: string;
  name: string;
  description: string;
  greeting: string;
  options: IVROption[];
  timeout: number;
  maxRetries: number;
  fallbackAction: 'hangup' | 'operator' | 'voicemail';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVROption {
  id: string;
  digit: string;
  speech?: string;
  action: 'transfer' | 'play' | 'gather' | 'hangup';
  target?: string;
  message?: string;
  nextMenuId?: string;
}

export interface CallTray {
  id: string;
  name: string;
  type: 'active' | 'queue' | 'missed' | 'voicemail' | 'callback';
  calls: Call[];
  filters: CallFilter[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface CallFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
}

export interface CallAnalytics {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year';
  metrics: {
    totalCalls: number;
    answeredCalls: number;
    abandonedCalls: number;
    averageWaitTime: number;
    averageHandleTime: number;
    serviceLevel: number;
    occupancy: number;
    transferRate: number;
    firstCallResolution: number;
    recordingRate: number;
    transcriptionRate: number;
    sentimentScore: number;
    qaScore: number;
  };
  byQueue: QueueAnalytics[];
  byAgent: AgentAnalytics[];
  byHour: HourlyAnalytics[];
  voiceQuality: VoiceQualityMetrics;
}

export interface QueueAnalytics {
  queueId: string;
  queueName: string;
  metrics: {
    totalCalls: number;
    answeredCalls: number;
    abandonedCalls: number;
    averageWaitTime: number;
    averageHandleTime: number;
    serviceLevel: number;
    occupancy: number;
  };
}

export interface AgentAnalytics {
  agentId: string;
  agentName: string;
  metrics: {
    totalCalls: number;
    averageHandleTime: number;
    callsPerHour: number;
    slaPercentage: number;
    qaScore: number;
  };
}

export interface HourlyAnalytics {
  hour: number;
  calls: number;
  answered: number;
  abandoned: number;
  averageWaitTime: number;
}

export interface VoiceQualityMetrics {
  averageLatency: number;
  averageJitter: number;
  packetLoss: number;
  pdd: number; // Post-Dial Delay
  codecDistribution: {
    [codec: string]: number;
  };
  networkDistribution: {
    [network: string]: number;
  };
}

export interface CallMonitoring {
  callId: string;
  supervisorId: string;
  type: 'listen' | 'whisper' | 'barge';
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface WebhookLog {
  id: string;
  event: string;
  payload: any;
  status: 'success' | 'failed' | 'retrying';
  attempts: number;
  lastAttempt: Date;
  error?: string;
  createdAt: Date;
}

// Estados de la UI
export interface CallsState {
  currentView: CallsView;
  activeCall?: Call;
  calls: Call[];
  queues: Queue[];
  agents: Agent[];
  voicemails: Voicemail[];
  callbacks: Callback[];
  qaReviews: QAReview[];
  callTrays: CallTray[];
  analytics: CallAnalytics;
  config: CallConfig;
  phoneNumbers: PhoneNumber[];
  ivrMenus: IVRMenu[];
  monitoring: CallMonitoring[];
  loading: boolean;
  error?: string;
  searchQuery: string;
  filters: CallFilter[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedCalls: string[];
  softphoneOpen: boolean;
  supervisorMode: boolean;
  realTimeUpdates: boolean;
}

export type CallsView = 
  | 'dashboard' 
  | 'calls' 
  | 'queues' 
  | 'agents' 
  | 'voicemails' 
  | 'callbacks' 
  | 'qa' 
  | 'analytics' 
  | 'admin' 
  | 'supervisor';

export interface SoftphoneState {
  isConnected: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  isRecording: boolean;
  currentCall?: Call;
  dialpadValue: string;
  notes: string;
  tags: string[];
  disposition?: string;
  afterCallWork: boolean;
  acwTimer: number;
  conferenceParticipants: string[];
  transferTarget?: string;
  transferType?: 'warm' | 'cold';
}

export interface SupervisorState {
  isMonitoring: boolean;
  monitoringType?: 'listen' | 'whisper' | 'barge';
  monitoredCallId?: string;
  wallboardData: {
    queues: QueueAnalytics[];
    agents: AgentAnalytics[];
    alerts: SupervisorAlert[];
  };
  realTimeMetrics: {
    totalCalls: number;
    activeCalls: number;
    queuedCalls: number;
    availableAgents: number;
    serviceLevel: number;
  };
}

export interface SupervisorAlert {
  id: string;
  type: 'sla' | 'abandon' | 'quality' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  queueId?: string;
  agentId?: string;
  callId?: string;
  timestamp: Date;
  acknowledged: boolean;
}

// Tipos para WebRTC y Twilio
export interface TwilioDevice {
  device: any;
  isReady: boolean;
  isConnected: boolean;
  token: string;
  capabilities: {
    incoming: boolean;
    outgoing: boolean;
  };
}

export interface WebRTCConnection {
  callSid: string;
  connection: any;
  status: 'connecting' | 'connected' | 'disconnected' | 'failed';
  quality: {
    audioLevel: number;
    latency: number;
    jitter: number;
  };
}

export interface TwiMLResponse {
  twiml: string;
  callSid?: string;
  status?: string;
}

// Tipos para IA y análisis
export interface AgentAssist {
  callId: string;
  suggestions: AISuggestion[];
  sentiment: 'positive' | 'neutral' | 'negative';
  riskLevel: 'low' | 'medium' | 'high';
  nextBestAction?: string;
  faqMatches: FAQMatch[];
  realTime: boolean;
}

export interface AISuggestion {
  id: string;
  type: 'faq' | 'script' | 'escalation' | 'action';
  title: string;
  content: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface FAQMatch {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  category: string;
}

// Tipos para notificaciones
export interface CallNotification {
  id: string;
  type: 'incoming' | 'missed' | 'voicemail' | 'callback' | 'qa' | 'alert';
  title: string;
  message: string;
  callId?: string;
  queueId?: string;
  agentId?: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  timestamp: Date;
}

// Tipos para exportación
export interface CallExport {
  format: 'csv' | 'excel' | 'json';
  filters: CallFilter[];
  dateRange: {
    start: Date;
    end: Date;
  };
  fields: string[];
  includeRecording: boolean;
  includeTranscript: boolean;
  includeSummary: boolean;
}