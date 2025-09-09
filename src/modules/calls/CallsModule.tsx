import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Users,
  Voicemail,
  Clock,
  BarChart3,
  Settings,
  Shield,
  Menu,
  Search,
  Filter,
  User,
  LogOut,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Square,
  RotateCcw,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  Calendar,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Headphones,
  MessageSquare,
  FileText,
  Star,
  Tag,
  Eye,
  EyeOff,
  Zap,
  Bot,
  TrendingUp,
  Activity,
  Target,
  Award,
  Globe,
  Wifi,
  WifiOff,
  Signal,
  SignalZero,
  SignalLow,
  SignalMedium,
  SignalHigh
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';

import {
  CallsState,
  CallsView,
  Call,
  Queue,
  Agent,
  SoftphoneState,
  SupervisorState,
  CallAnalytics,
  TwilioDevice,
  WebRTCConnection
} from '../../types/calls';

// Componentes del módulo
import { CallsDashboard } from './components/CallsDashboard';
import { CallsHistory } from './components/CallsHistory';
import { QueuesPanel } from './components/QueuesPanel';
import { AgentsPanel } from './components/AgentsPanel';
import { VoicemailsPanel } from './components/VoicemailsPanel';
import { CallbacksPanel } from './components/CallbacksPanel';
import { QAPanel } from './components/QAPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { AdminPanel } from './components/AdminPanel';
import { SupervisorPanel } from './components/SupervisorPanel';
import { Softphone } from './components/Softphone';
import { CallTrays } from './components/CallTrays';

const CallsModule: React.FC = () => {
  // Estado principal del módulo
  const [state, setState] = useState<CallsState>({
    currentView: 'dashboard',
    calls: [],
    queues: [],
    agents: [],
    voicemails: [],
    callbacks: [],
    qaReviews: [],
    callTrays: [],
    analytics: {} as CallAnalytics,
    config: {} as any,
    phoneNumbers: [],
    ivrMenus: [],
    monitoring: [],
    loading: false,
    searchQuery: '',
    filters: [],
    sortBy: 'startTime',
    sortOrder: 'desc',
    selectedCalls: [],
    softphoneOpen: true,
    supervisorMode: false,
    realTimeUpdates: true
  });

  // Estado del softphone
  const [softphoneState, setSoftphoneState] = useState<SoftphoneState>({
    isConnected: false,
    isMuted: false,
    isOnHold: false,
    isRecording: false,
    dialpadValue: '',
    notes: '',
    tags: [],
    afterCallWork: false,
    acwTimer: 0,
    conferenceParticipants: [],
  });

  // Estado del supervisor
  const [supervisorState, setSupervisorState] = useState<SupervisorState>({
    isMonitoring: false,
    wallboardData: {
      queues: [],
      agents: [],
      alerts: []
    },
    realTimeMetrics: {
      totalCalls: 0,
      activeCalls: 0,
      queuedCalls: 0,
      availableAgents: 0,
      serviceLevel: 0
    }
  });

  // Estado de Twilio
  const [twilioDevice, setTwilioDevice] = useState<TwilioDevice>({
    device: null,
    isReady: false,
    isConnected: false,
    token: '',
    capabilities: {
      incoming: true,
      outgoing: true
    }
  });

  // Simular conexión automática del dispositivo Twilio
  useEffect(() => {
    const connectDevice = async () => {
      // Simular delay de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTwilioDevice(prev => ({
        ...prev,
        isReady: true,
        isConnected: true,
        token: 'mock-token-' + Date.now()
      }));
    };

    connectDevice();
  }, []);


  // Usuario mock
  const mockUser = {
    id: '1',
    name: 'Israel Saavedra',
    email: 'israel@utalk.com',
    avatar: '/avatars/israel.jpg',
    role: 'supervisor',
    permissions: ['supervisor', 'agent', 'qa']
  };

  // Navegación del sidebar
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-blue-600' },
    { id: 'calls', label: 'Llamadas', icon: PhoneCall, color: 'text-green-600' },
    { id: 'queues', label: 'Colas', icon: Users, color: 'text-purple-600' },
    { id: 'agents', label: 'Agentes', icon: User, color: 'text-orange-600' },
    { id: 'voicemails', label: 'Voicemails', icon: Voicemail, color: 'text-red-600' },
    { id: 'callbacks', label: 'Callbacks', icon: Clock, color: 'text-yellow-600' },
    { id: 'qa', label: 'QA', icon: Shield, color: 'text-indigo-600' },
    { id: 'analytics', label: 'Analítica', icon: TrendingUp, color: 'text-pink-600' },
    { id: 'admin', label: 'Admin', icon: Settings, color: 'text-gray-600' },
  ];

  // Agregar panel supervisor si el usuario tiene permisos
  if (mockUser.permissions.includes('supervisor')) {
    navigationItems.splice(1, 0, { id: 'supervisor', label: 'Supervisor', icon: Eye, color: 'text-cyan-600' });
  }

  // Handlers
  const handleViewChange = useCallback((view: CallsView) => {
    setState(prev => ({ ...prev, currentView: view }));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handleFilterChange = useCallback((filters: any[]) => {
    setState(prev => ({ ...prev, filters }));
  }, []);

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const handleCallSelect = useCallback((callIds: string[]) => {
    setState(prev => ({ ...prev, selectedCalls: callIds }));
  }, []);

  const handleSoftphoneToggle = useCallback(() => {
    setState(prev => ({ ...prev, softphoneOpen: !prev.softphoneOpen }));
  }, []);

  const handleSupervisorToggle = useCallback(() => {
    setState(prev => ({ ...prev, supervisorMode: !prev.supervisorMode }));
  }, []);

  // Renderizar contenido principal
  const renderMainContent = () => {
    switch (state.currentView) {
      case 'dashboard':
        return (
          <CallsDashboard
            analytics={state.analytics}
            realTimeMetrics={supervisorState.realTimeMetrics}
            onViewChange={handleViewChange}
          />
        );
      case 'calls':
        return (
          <CallsHistory
            calls={state.calls}
            loading={state.loading}
            searchQuery={state.searchQuery}
            filters={state.filters}
            sortBy={state.sortBy}
            sortOrder={state.sortOrder}
            selectedCalls={state.selectedCalls}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onCallSelect={handleCallSelect}
          />
        );
      case 'supervisor':
        return (
          <SupervisorPanel
            state={supervisorState}
            onStateChange={setSupervisorState}
            realTimeMetrics={supervisorState.realTimeMetrics}
            wallboardData={supervisorState.wallboardData}
          />
        );
      case 'queues':
        return (
          <QueuesPanel
            queues={state.queues}
            agents={state.agents}
            loading={state.loading}
            onQueueUpdate={(queue) => {
              setState(prev => ({
                ...prev,
                queues: prev.queues.map(q => q.id === queue.id ? queue : q)
              }));
            }}
          />
        );
      case 'agents':
        return (
          <AgentsPanel
            agents={state.agents}
            queues={state.queues}
            loading={state.loading}
            onAgentUpdate={(agent) => {
              setState(prev => ({
                ...prev,
                agents: prev.agents.map(a => a.id === agent.id ? agent : a)
              }));
            }}
          />
        );
      case 'voicemails':
        return (
          <VoicemailsPanel
            voicemails={state.voicemails}
            loading={state.loading}
            onVoicemailUpdate={(voicemail) => {
              setState(prev => ({
                ...prev,
                voicemails: prev.voicemails.map(v => v.id === voicemail.id ? voicemail : v)
              }));
            }}
          />
        );
      case 'callbacks':
        return (
          <CallbacksPanel
            callbacks={state.callbacks}
            loading={state.loading}
            onCallbackUpdate={(callback) => {
              setState(prev => ({
                ...prev,
                callbacks: prev.callbacks.map(c => c.id === callback.id ? callback : c)
              }));
            }}
          />
        );
      case 'qa':
        return (
          <QAPanel
            qaReviews={state.qaReviews}
            calls={state.calls}
            loading={state.loading}
            onQAUpdate={(qa) => {
              setState(prev => ({
                ...prev,
                qaReviews: prev.qaReviews.map(q => q.id === qa.id ? qa : q)
              }));
            }}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPanel
            analytics={state.analytics}
            loading={state.loading}
            onAnalyticsUpdate={(analytics) => {
              setState(prev => ({ ...prev, analytics }));
            }}
          />
        );
      case 'admin':
        return (
          <AdminPanel
            config={state.config}
            phoneNumbers={state.phoneNumbers}
            ivrMenus={state.ivrMenus}
            loading={state.loading}
            onConfigUpdate={(config) => {
              setState(prev => ({ ...prev, config }));
            }}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Vista no encontrada</h3>
              <p className="text-gray-600">La vista seleccionada no está disponible.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Módulo de Llamadas</h1>
              <p className="text-xs text-gray-600">UTalk Ultra</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = state.currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleViewChange(item.id as CallsView)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : item.color}`} />
                <span className="font-medium">{item.label}</span>
                {item.id === 'calls' && state.calls.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {state.calls.length}
                  </Badge>
                )}
                {item.id === 'voicemails' && state.voicemails.filter(v => v.status === 'new').length > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {state.voicemails.filter(v => v.status === 'new').length}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Usuario */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={mockUser.avatar} />
              <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {mockUser.name}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {mockUser.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {navigationItems.find(item => item.id === state.currentView)?.label || 'Llamadas'}
                </h2>
                {state.realTimeUpdates && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600">En vivo</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar llamadas..."
                  value={state.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>


              {/* Softphone Toggle */}
              <Button
                variant={state.softphoneOpen ? "default" : "outline"}
                size="sm"
                onClick={handleSoftphoneToggle}
              >
                <Phone className="w-4 h-4 mr-2" />
                Softphone
              </Button>

              {/* Supervisor Mode */}
              {mockUser.permissions.includes('supervisor') && (
                <Button
                  variant={state.supervisorMode ? "default" : "outline"}
                  size="sm"
                  onClick={handleSupervisorToggle}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Supervisor
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <div className="flex-1 flex overflow-hidden">
          {/* Área principal */}
          <div className="flex-1 overflow-y-auto">
            {renderMainContent()}
          </div>

          {/* Softphone */}
          {state.softphoneOpen && (
            <div className="w-80 border-l border-gray-200 bg-gray-50">
              <Softphone
                state={softphoneState}
                onStateChange={setSoftphoneState}
                twilioDevice={twilioDevice}
                onDeviceChange={setTwilioDevice}
                user={mockUser}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default CallsModule;