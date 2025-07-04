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

// Minimalist scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(75, 85, 99, 0.5);
    border-radius: 3px;
    transition: background-color 0.2s ease;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(107, 114, 128, 0.7);
  }

  .custom-scrollbar::-webkit-scrollbar-corner {
    background: transparent;
  }
`;

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
    "Cliente preferencial - Arquitecto con múltiples proyectos. Interesado en mármoles de alta gama.",
  );
  const [newNote, setNewNote] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // State for tags
  const [clientTags, setClientTags] = useState([
    "VIP",
    "Arquitecto",
    "Presupuesto Alto",
    "Mármol Carrara",
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
  ]);

  // Suggested products
  const [suggestedProducts] = useState([
    {
      id: "1",
      name: "Mármol Blanco Carrara Premium",
      type: "Mármol Natural Italiano",
      density: "2.7 kg/dm³",
      absorption: "<0.4%",
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
  ]);

  // Conversation analysis
  const [conversationAnalysis] = useState({
    mainTopics: [
      "Cotización mármol carrara",
      "Tiempo de entrega",
      "Precios por volumen",
    ],
    sentiment: "positive" as "positive" | "neutral" | "negative",
    urgencyLevel: "medium" as "high" | "medium" | "low",
    summary:
      "Cliente VIP interesado en mármol carrara para múltiples proyectos arquitectónicos.",
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
        return <MessageCircle className="h-3 w-3 text-green-500" />;
      case "facebook":
        return <Facebook className="h-3 w-3 text-blue-500" />;
      default:
        return <MessageSquare className="h-3 w-3 text-gray-400" />;
    }
  };

  const getSentimentIcon = () => {
    switch (conversationAnalysis.sentiment) {
      case "positive":
        return <Heart className="h-3 w-3 text-green-500" />;
      case "negative":
        return <Frown className="h-3 w-3 text-red-500" />;
      default:
        return <Meh className="h-3 w-3 text-yellow-500" />;
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
        return "bg-red-600/20 border-red-500/30 text-red-300";
      case "medium":
        return "bg-yellow-600/20 border-yellow-500/30 text-yellow-300";
      default:
        return "bg-green-600/20 border-green-500/30 text-green-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-600/20 border-red-500/30 text-red-300";
      case "medium":
        return "bg-yellow-600/20 border-yellow-500/30 text-yellow-300";
      default:
        return "bg-green-600/20 border-green-500/30 text-green-300";
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div
        className={cn(
          "bg-[#18181B] border-l border-gray-800 flex flex-col overflow-hidden",
          className,
        )}
        style={{
          fontSize: "14px",
          lineHeight: "1.4em",
          width: "320px",
          height: "100vh",
          maxHeight: "100vh",
        }}
      >
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
          style={{
            minHeight: 0,
            maxHeight: "100vh",
          }}
        >
          <div
            className="space-y-3"
            style={{
              padding: "12px",
              gap: "12px",
              minHeight: "100%",
            }}
          >
            {/* 1. Productos Sugeridos - Compact */}
            <Card
              className="bg-[#27272A]/60 border border-gray-700/50 backdrop-blur-sm"
              style={{ marginBottom: "12px" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-[#E4E4E7] flex items-center gap-2">
                  <Package className="h-3 w-3 text-green-400" />
                  Productos Sugeridos
                  <Badge className="bg-green-600/20 border border-green-500/30 text-green-300 text-xs rounded-full">
                    {suggestedProducts.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3">
                {suggestedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-700/40 border border-gray-600/30 rounded-lg p-2 hover:bg-gray-600/40 transition-all duration-200"
                  >
                    <div className="flex gap-2 mb-2">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-600/50 border border-gray-500/30 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h4 className="text-xs font-medium text-white leading-tight line-clamp-2">
                            {product.name}
                          </h4>
                          {!product.inStock && (
                            <Badge className="bg-red-600/20 border border-red-500/30 text-red-300 text-xs rounded-full flex-shrink-0">
                              Sin stock
                            </Badge>
                          )}
                          {product.inStock && product.stock <= 10 && (
                            <Badge className="bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 text-xs rounded-full flex-shrink-0">
                              Poco stock
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-1 line-clamp-1">
                          {product.type}
                        </p>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-1">
                            <span className="text-green-400 font-medium">
                              {product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-gray-500 line-through">
                                {product.originalPrice}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400">
                            Stock: {product.stock}
                          </span>
                        </div>
                        <p className="text-xs text-blue-400 flex items-center gap-1">
                          <Eye className="h-2 w-2 flex-shrink-0" />
                          <span className="truncate">
                            Visto {product.viewedByClient}x
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Compact action buttons */}
                    <div className="grid grid-cols-4 gap-1">
                      {product.hasImage && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs rounded px-1"
                        >
                          <ImageIcon className="h-2 w-2" />
                        </Button>
                      )}
                      {product.hasPDF && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-xs rounded px-1"
                        >
                          <File className="h-2 w-2" />
                        </Button>
                      )}
                      {product.hasVideo && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs rounded px-1"
                        >
                          <Video className="h-2 w-2" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-300 text-xs rounded px-1"
                      >
                        <FileText className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 2. Información del Cliente - Compact */}
            <Card
              className="bg-[#27272A]/60 border border-gray-700/50 backdrop-blur-sm"
              style={{ marginBottom: "12px" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-[#E4E4E7] flex items-center gap-2">
                  <User className="h-3 w-3 text-blue-400" />
                  Info del Cliente
                  <div className="flex items-center gap-1">
                    {getSourceIcon()}
                    <span className="text-xs text-gray-400">
                      {clientData.source === "whatsapp" ? "WA" : "FB"}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center border border-gray-600/30 flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {clientData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-white leading-tight truncate">
                      {clientData.name}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">
                      {clientData.company}
                    </p>
                    <Badge
                      className={cn(
                        "text-xs rounded-full",
                        getPriorityColor(performanceData.priority),
                      )}
                    >
                      {performanceData.priority === "high"
                        ? "🔥 Alta"
                        : performanceData.priority === "medium"
                          ? "⚡ Media"
                          : "✅ Baja"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1">
                    <Phone className="h-2 w-2 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-300 truncate">
                      {clientData.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-2 w-2 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-300 truncate">
                      {clientData.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-2 w-2 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-300 truncate">
                      Cliente desde {clientData.joinedDate}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Notas del Cliente - Compact */}
            <Card
              className="bg-[#27272A]/60 border border-gray-700/50 backdrop-blur-sm"
              style={{ marginBottom: "12px" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-[#E4E4E7] flex items-center gap-2">
                  <StickyNote className="h-3 w-3 text-yellow-400" />
                  Notas
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingNotes(!isEditingNotes);
                      if (!isEditingNotes) setNewNote(clientNotes);
                    }}
                    className="text-xs bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 border border-[#7C3AED]/30 text-[#E4E4E7] hover:text-white px-2 py-0.5 rounded transition-all duration-200"
                  >
                    {isEditingNotes ? "Cancelar" : "Editar"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {!isEditingNotes ? (
                  <p className="text-xs text-[#E4E4E7] leading-relaxed">
                    {clientNotes || "No hay notas disponibles"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Agregar notas..."
                      className="bg-gray-700 border-gray-600 text-white text-xs"
                      rows={3}
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={saveNotes}
                        className="bg-green-600 hover:bg-green-700 h-6 text-xs"
                      >
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingNotes(false)}
                        className="text-gray-400 h-6 text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 4. Etiquetas - Compact */}
            <Card
              className="bg-[#27272A]/60 border border-gray-700/50 backdrop-blur-sm"
              style={{ marginBottom: "12px" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-[#E4E4E7] flex items-center gap-2">
                  <Tag className="h-3 w-3 text-purple-400" />
                  Etiquetas
                  <Badge className="bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs rounded-full">
                    {clientTags.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {clientTags.map((tag, index) => (
                      <Badge
                        key={index}
                        className="bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-1"
                      >
                        {tag}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTag(tag)}
                          className="p-0 h-auto text-white hover:text-red-300"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Nueva etiqueta..."
                      className="bg-gray-700 border-gray-600 text-white text-xs h-6"
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
                      className="bg-purple-600 hover:bg-purple-700 h-6 px-2"
                    >
                      <Plus className="h-2 w-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Archivos Compartidos - Compact */}
            <Card
              className="bg-[#27272A]/60 border border-gray-700/50 backdrop-blur-sm"
              style={{ marginBottom: "12px" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-[#E4E4E7] flex items-center gap-2">
                  <FileText className="h-3 w-3 text-orange-400" />
                  Archivos
                  <Badge className="bg-orange-600/20 border border-orange-500/30 text-orange-300 text-xs rounded-full">
                    {sharedFiles.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-1">
                  {sharedFiles
                    .slice(0, showAllFiles ? sharedFiles.length : 2)
                    .map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 p-1.5 bg-gray-700 rounded border border-gray-600/30 hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {file.type === "PDF" ? (
                            <File className="h-4 w-4 text-red-400" />
                          ) : file.type === "Video" ? (
                            <Video className="h-4 w-4 text-purple-400" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {file.size} • {file.date}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white p-0.5 h-5 w-5"
                          >
                            <Eye className="h-2 w-2" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white p-0.5 h-5 w-5"
                          >
                            <Download className="h-2 w-2" />
                          </Button>
                        </div>
                      </div>
                    ))}

                  {sharedFiles.length > 2 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAllFiles(!showAllFiles)}
                      className="w-full text-orange-400 border-orange-500/30 hover:bg-orange-950/30 h-6 text-xs"
                    >
                      {showAllFiles
                        ? "Mostrar menos"
                        : `Ver más (${sharedFiles.length - 2})`}
                      <ChevronDown
                        className={cn(
                          "h-2 w-2 ml-1",
                          showAllFiles && "rotate-180",
                        )}
                      />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 6. Análisis de Conversación - Compact */}
            <Card
              className="bg-[#27272A]/60 border border-gray-700/50 backdrop-blur-sm"
              style={{ marginBottom: "12px" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-[#E4E4E7] flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-cyan-400" />
                  Análisis IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3">
                <div>
                  <h5 className="text-xs font-medium text-gray-400 mb-1">
                    Temas:
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {conversationAnalysis.mainTopics.map((topic, index) => (
                      <Badge
                        key={index}
                        className="bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-xs rounded-full"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Urgencia:</span>
                    <Badge
                      className={cn(
                        "text-xs rounded-full",
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
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-2 w-2",
                            i <
                              Math.floor(conversationAnalysis.satisfactionScore)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-600",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7. Sentimiento del Cliente - Compact */}
            <Card
              className="bg-[#27272A]/60 border border-gray-700/50 backdrop-blur-sm"
              style={{ marginBottom: "12px" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-[#E4E4E7] flex items-center gap-2">
                  {getSentimentIcon()}
                  Sentimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Estado:</span>
                  <Badge
                    className={cn(
                      "text-xs rounded-full",
                      conversationAnalysis.sentiment === "positive"
                        ? "bg-green-600/20 border border-green-500/30 text-green-300"
                        : conversationAnalysis.sentiment === "negative"
                          ? "bg-red-600/20 border border-red-500/30 text-red-300"
                          : "bg-yellow-600/20 border border-yellow-500/30 text-yellow-300",
                    )}
                  >
                    {conversationAnalysis.sentiment === "positive"
                      ? "😊 Positivo"
                      : conversationAnalysis.sentiment === "negative"
                        ? "😞 Negativo"
                        : "😐 Neutral"}
                  </Badge>
                </div>

                <div className="bg-gray-700/40 rounded-lg p-2">
                  <p className={cn("text-xs", getSentimentColor())}>
                    💡 Cliente muestra interés genuino en los productos.
                    Responde rápidamente y hace preguntas específicas.
                  </p>
                </div>

                {/* Performance Indicators */}
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <Timer className="h-2 w-2 text-blue-400" />
                    <span className="text-gray-300 text-xs">
                      {performanceData.avgResponseTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-2 w-2 text-green-400" />
                    <span className="text-gray-300 text-xs">
                      {performanceData.resolutionRate}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
