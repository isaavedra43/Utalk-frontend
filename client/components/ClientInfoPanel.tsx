import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  User,
  FileText,
  MessageSquare,
  TrendingUp,
  Eye,
  Download,
  Heart,
  Meh,
  Frown,
  MapPin,
  Phone,
  Building,
  Clock,
  Star,
  Plus,
  X,
  Send,
  Image as ImageIcon,
  Video,
  File,
  ChevronDown,
  Facebook,
  MessageCircle,
  Target,
  Timer,
  CheckCircle,
  AlertCircle,
  Tag,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientInfoPanelProps {
  className?: string;
}

export function ClientInfoPanel({ className }: ClientInfoPanelProps) {
  // State for client information
  const [clientData] = useState({
    name: "Carlos Martinez",
    company: "GRUPO ALCON",
    location: "Ciudad de México, México",
    phone: "+52 55 1234-5678",
    email: "carlos.martinez@grupoalcon.com",
    address: "Av. Revolución 1425, Col. Campestre, 01040 CDMX",
    source: "whatsapp" as "whatsapp" | "facebook",
    totalInteractions: 12,
    joinedDate: "Enero 2023",
    lastActive: "5 min ago",
    avgResponseTime: "2.5 min",
    resolutionRate: "94%",
    purchaseIntent: "high" as "high" | "medium" | "low",
  });

  // State for notes
  const [clientNotes, setClientNotes] = useState(
    "Cliente preferencial - Arquitecto con múltiples proyectos. Interesado en mármoles de alta gama. Presupuesto: $50k-$100k por proyecto.",
  );
  const [newNote, setNewNote] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // State for tags
  const [clientTags, setClientTags] = useState([
    "VIP",
    "Arquitecto",
    "Presupuesto Alto",
    "Mármol Carrara",
    "Proyectos Múltiples",
  ]);
  const [newTag, setNewTag] = useState("");

  // State for files
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [sharedFiles] = useState([
    {
      id: "1",
      name: "Catálogo_Mármoles_2024.pdf",
      type: "PDF",
      size: "2.4 MB",
      date: "Ayer",
      direction: "sent",
    },
    {
      id: "2",
      name: "proyecto_baño_principal.jpg",
      type: "Imagen",
      size: "890 KB",
      date: "2 días",
      direction: "received",
    },
    {
      id: "3",
      name: "instalacion_carrara.mp4",
      type: "Video",
      size: "15.2 MB",
      date: "1 semana",
      direction: "sent",
    },
    {
      id: "4",
      name: "cotizacion_proyecto_A.pdf",
      type: "PDF",
      size: "1.8 MB",
      date: "2 semanas",
      direction: "sent",
    },
    {
      id: "5",
      name: "referencia_calacatta.jpg",
      type: "Imagen",
      size: "1.2 MB",
      date: "3 semanas",
      direction: "received",
    },
  ]);

  // Suggested products
  const [suggestedProducts] = useState([
    {
      id: "1",
      name: "Mármol Blanco Carrara Premium",
      type: "Mármol Natural Italiano",
      density: "2.7 kg/dm³",
      absorption: "<0.4%",
      dimensions: "120x60x2cm",
      finish: "Pulido Brillante",
      stock: 150,
      price: "$65.99/m²",
      originalPrice: "$79.99/m²",
      viewedByClient: 8,
      image: "/placeholder.svg",
      hasImage: true,
      hasPDF: true,
      hasVideo: true,
      inStock: true,
    },
    {
      id: "2",
      name: "Travertino Romano Clásico",
      type: "Piedra Natural",
      density: "2.4 kg/dm³",
      absorption: "2-5%",
      dimensions: "60x40x3cm",
      finish: "Antideslizante",
      stock: 8,
      price: "$32.50/m²",
      originalPrice: "$38.99/m²",
      viewedByClient: 3,
      image: "/placeholder.svg",
      hasImage: true,
      hasPDF: true,
      hasVideo: false,
      inStock: false,
    },
    {
      id: "3",
      name: "Granito Negro Galaxy",
      type: "Granito Natural",
      density: "2.8 kg/dm³",
      absorption: "<0.2%",
      dimensions: "100x50x2cm",
      finish: "Pulido Espejo",
      stock: 45,
      price: "$42.99/m²",
      originalPrice: "$49.99/m²",
      viewedByClient: 5,
      image: "/placeholder.svg",
      hasImage: true,
      hasPDF: true,
      hasVideo: true,
      inStock: true,
    },
  ]);

  // Conversation analysis
  const [conversationAnalysis] = useState({
    mainTopics: [
      "Cotización mármol carrara",
      "Tiempo de entrega",
      "Precios por volumen",
      "Instalación profesional",
      "Garantía producto",
    ],
    sentiment: "positive" as "positive" | "neutral" | "negative",
    urgencyLevel: "medium" as "high" | "medium" | "low",
    summary:
      "Cliente VIP interesado en mármol carrara para múltiples proyectos arquitectónicos. Consultó precios por volumen y servicios de instalación. Alta intención de compra confirmada.",
    satisfactionScore: 4.5,
    emotionalTone: "Entusiasta y profesional",
    nextSteps: ["Enviar cotización detallada", "Agendar visita showroom"],
  });

  // Performance indicators
  const [performanceData] = useState({
    avgResponseTime: "1.8 min",
    resolutionRate: "96%",
    customerSatisfaction: 4.7,
    followUpNeeded: true,
    priority: "high" as "high" | "medium" | "low",
  });

  const addTag = () => {
    if (newTag.trim() && !clientTags.includes(newTag.trim())) {
      setClientTags([...clientTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setClientTags(clientTags.filter((tag) => tag !== tagToRemove));
  };

  const saveNotes = () => {
    setClientNotes(newNote);
    setIsEditingNotes(false);
    setNewNote("");
  };

  const getSourceIcon = () => {
    switch (clientData.source) {
      case "whatsapp":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case "facebook":
        return <Facebook className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSentimentIcon = () => {
    switch (conversationAnalysis.sentiment) {
      case "positive":
        return <Heart className="h-4 w-4 text-green-500" />;
      case "negative":
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = () => {
    switch (conversationAnalysis.sentiment) {
      case "positive":
        return "text-green-400";
      case "negative":
        return "text-red-400";
      default:
        return "text-yellow-400";
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-600 text-white";
      case "medium":
        return "bg-yellow-600 text-black";
      default:
        return "bg-green-600 text-white";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      default:
        return "text-green-400";
    }
  };

  return (
    <div
      className={cn(
        "h-full bg-gray-900 border-l border-gray-800 overflow-hidden",
        className,
      )}
    >
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* 1. Productos Sugeridos */}
          <Card className="bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-green-400" />
                Productos Sugeridos por IA
                <Badge className="bg-green-600/20 border border-green-500/30 text-green-300 text-xs rounded-full">
                  {suggestedProducts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-700/40 border border-gray-600/30 rounded-xl p-4 hover:bg-gray-600/40 hover:border-gray-500/40 transition-all duration-200 backdrop-blur-sm"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600/50 border border-gray-500/30">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white leading-tight">
                          {product.name}
                        </h4>
                        {!product.inStock && (
                          <Badge className="bg-red-600/20 border border-red-500/30 text-red-300 text-xs rounded-full">
                            Agotado
                          </Badge>
                        )}
                        {product.inStock && product.stock <= 10 && (
                          <Badge className="bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 text-xs rounded-full">
                            Pocas unidades
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                        {product.type}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 mb-2">
                        <div className="bg-gray-800/60 p-2 rounded-lg border border-gray-600/30">
                          <strong className="text-gray-200">Densidad:</strong>
                          <br />
                          <span className="text-gray-300">
                            {product.density}
                          </span>
                        </div>
                        <div className="bg-gray-800/60 p-2 rounded-lg border border-gray-600/30">
                          <strong className="text-gray-200">Absorción:</strong>
                          <br />
                          <span className="text-gray-300">
                            {product.absorption}
                          </span>
                        </div>
                        <div className="bg-gray-800/60 p-2 rounded-lg border border-gray-600/30">
                          <strong className="text-gray-200">
                            Dimensiones:
                          </strong>
                          <br />
                          <span className="text-gray-300">
                            {product.dimensions}
                          </span>
                        </div>
                        <div className="bg-gray-800/60 p-2 rounded-lg border border-gray-600/30">
                          <strong className="text-gray-200">Acabado:</strong>
                          <br />
                          <span className="text-gray-300">
                            {product.finish}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-medium text-sm">
                            {product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-gray-500 line-through text-xs">
                              {product.originalPrice}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          <strong>Stock:</strong> {product.stock}
                        </div>
                      </div>
                      <p className="text-xs text-blue-400 mb-2 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Visto {product.viewedByClient} veces por este cliente
                      </p>
                    </div>
                  </div>

                  {/* Product action buttons - Enhanced with transparent design */}
                  <div className="grid grid-cols-2 gap-2">
                    {product.hasImage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 text-xs rounded-lg transition-all duration-200"
                      >
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Imagen
                      </Button>
                    )}
                    {product.hasPDF && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 hover:text-red-200 text-xs rounded-lg transition-all duration-200"
                      >
                        <File className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                    )}
                    {product.hasVideo && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-xs rounded-lg transition-all duration-200"
                      >
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-300 hover:text-gray-200 text-xs rounded-lg transition-all duration-200"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Ficha Técnica
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 2. Información del Cliente */}
          <Card className="bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" />
                Información del Cliente
                <div className="flex items-center gap-1">
                  {getSourceIcon()}
                  <span className="text-xs text-gray-400">
                    {clientData.source === "whatsapp" ? "WhatsApp" : "Facebook"}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center border border-gray-600/30 shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {clientData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white leading-tight">
                    {clientData.name}
                  </h4>
                  <p className="text-xs text-gray-400 mb-1">
                    {clientData.company}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-xs rounded-full",
                        performanceData.priority === "high"
                          ? "bg-red-600/20 border border-red-500/30 text-red-300"
                          : performanceData.priority === "medium"
                            ? "bg-yellow-600/20 border border-yellow-500/30 text-yellow-300"
                            : "bg-green-600/20 border border-green-500/30 text-green-300",
                      )}
                    >
                      {performanceData.priority === "high"
                        ? "🔥 Alta Prioridad"
                        : performanceData.priority === "medium"
                          ? "⚡ Media Prioridad"
                          : "✅ Baja Prioridad"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-300">{clientData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-300">{clientData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-300">{clientData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-300 text-xs">
                    {clientData.address}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-300">
                    Cliente desde {clientData.joinedDate} • Última actividad:{" "}
                    {clientData.lastActive}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-300">
                    {clientData.totalInteractions} interacciones totales
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Notas del Cliente */}
          <Card className="bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-yellow-400" />
                Notas del Cliente
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditingNotes(!isEditingNotes);
                    if (!isEditingNotes) setNewNote(clientNotes);
                  }}
                  className="text-xs bg-gray-700/40 hover:bg-gray-600/60 border border-gray-600/30 text-gray-300 hover:text-white px-2 py-1 rounded-lg transition-all duration-200"
                >
                  {isEditingNotes ? "Cancelar" : "Añadir nota"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isEditingNotes ? (
                <p className="text-sm text-gray-300 leading-relaxed">
                  {clientNotes || "No hay notas disponibles"}
                </p>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Agregar notas sobre el cliente..."
                    className="bg-gray-700 border-gray-600 text-white text-sm"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={saveNotes}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingNotes(false)}
                      className="text-gray-400"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Etiquetas del Cliente */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-purple-400" />
                Etiquetas del Cliente
                <Badge className="bg-purple-600 text-white text-xs">
                  {clientTags.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {clientTags.map((tag, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-600 text-white text-xs flex items-center gap-1"
                    >
                      {tag}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTag(tag)}
                        className="p-0 h-auto text-white hover:text-red-300"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nueva etiqueta..."
                    className="bg-gray-700 border-gray-600 text-white text-sm"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Archivos Compartidos */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-400" />
                Archivos Compartidos
                <Badge className="bg-orange-600 text-white text-xs">
                  {sharedFiles.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sharedFiles
                  .slice(0, showAllFiles ? sharedFiles.length : 3)
                  .map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {file.type === "PDF" ? (
                          <File className="h-6 w-6 text-red-400" />
                        ) : file.type === "Video" ? (
                          <Video className="h-6 w-6 text-purple-400" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {file.type} • {file.size} • {file.date} •
                          <span
                            className={cn(
                              "ml-1",
                              file.direction === "sent"
                                ? "text-blue-400"
                                : "text-green-400",
                            )}
                          >
                            {file.direction === "sent"
                              ? "📤 Enviado"
                              : "📥 Recibido"}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                {sharedFiles.length > 3 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAllFiles(!showAllFiles)}
                    className="w-full text-orange-400 border-orange-500 hover:bg-orange-950"
                  >
                    {showAllFiles ? (
                      <>
                        Mostrar menos
                        <ChevronDown className="h-3 w-3 ml-1 rotate-180" />
                      </>
                    ) : (
                      <>
                        Ver más archivos ({sharedFiles.length - 3})
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 6. Análisis de Conversación */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Análisis de Conversación IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h5 className="text-xs font-medium text-gray-400 mb-2">
                  Temas Principales:
                </h5>
                <div className="flex flex-wrap gap-1">
                  {conversationAnalysis.mainTopics.map((topic, index) => (
                    <Badge
                      key={index}
                      className="bg-cyan-600 text-white text-xs"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium text-gray-400 mb-1">
                  Resumen Inteligente:
                </h5>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {conversationAnalysis.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Urgencia:</span>
                  <Badge
                    className={cn(
                      "text-xs",
                      getUrgencyColor(conversationAnalysis.urgencyLevel),
                    )}
                  >
                    {conversationAnalysis.urgencyLevel === "high"
                      ? "🔴 Alta"
                      : conversationAnalysis.urgencyLevel === "medium"
                        ? "🟡 Media"
                        : "🟢 Baja"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Satisfacción:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < Math.floor(conversationAnalysis.satisfactionScore)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600",
                        )}
                      />
                    ))}
                    <span className="text-xs text-gray-300 ml-1">
                      {conversationAnalysis.satisfactionScore}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium text-gray-400 mb-1">
                  Próximos Pasos Sugeridos:
                </h5>
                <div className="space-y-1">
                  {conversationAnalysis.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-gray-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Sentimiento del Cliente */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                {getSentimentIcon()}
                Sentimiento del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Estado Emocional:</span>
                <Badge
                  className={cn(
                    "text-xs",
                    conversationAnalysis.sentiment === "positive"
                      ? "bg-green-600 text-white"
                      : conversationAnalysis.sentiment === "negative"
                        ? "bg-red-600 text-white"
                        : "bg-yellow-600 text-black",
                  )}
                >
                  {conversationAnalysis.sentiment === "positive"
                    ? "😊 Positivo"
                    : conversationAnalysis.sentiment === "negative"
                      ? "😞 Negativo"
                      : "😐 Neutral"}
                </Badge>
              </div>

              <div>
                <span className="text-sm text-gray-400">Tono Emocional:</span>
                <p className="text-sm text-gray-300 mt-1">
                  {conversationAnalysis.emotionalTone}
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-3">
                <p className={cn("text-xs", getSentimentColor())}>
                  💡{" "}
                  {conversationAnalysis.sentiment === "positive"
                    ? "Cliente muestra interés genuino en los productos. Responde rápidamente y hace preguntas específicas sobre especificaciones técnicas."
                    : conversationAnalysis.sentiment === "negative"
                      ? "Cliente muestra cierta frustración. Recomienda respuesta empática y soluciones inmediatas."
                      : "Cliente mantiene tono neutral profesional. Oportunidad para generar mayor engagement."}
                </p>
              </div>

              {/* Performance Indicators */}
              <div className="border-t border-gray-700 pt-3">
                <h5 className="text-xs font-medium text-gray-400 mb-2">
                  Indicadores de Rendimiento:
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Timer className="h-3 w-3 text-blue-400" />
                    <span className="text-gray-300">
                      Resp. promedio: {performanceData.avgResponseTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-green-400" />
                    <span className="text-gray-300">
                      Resolución: {performanceData.resolutionRate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-3 w-3 text-pink-400" />
                    <span className="text-gray-300">
                      Satisfacción: {performanceData.customerSatisfaction}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {performanceData.followUpNeeded ? (
                      <AlertCircle className="h-3 w-3 text-orange-400" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    )}
                    <span className="text-gray-300">
                      {performanceData.followUpNeeded
                        ? "Seguimiento requerido"
                        : "Seguimiento completo"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
