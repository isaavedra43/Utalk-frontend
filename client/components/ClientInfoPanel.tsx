import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientInfoPanelProps {
  className?: string;
}

export function ClientInfoPanel({ className }: ClientInfoPanelProps) {
  // Mock data for client information
  const [clientData] = useState({
    name: "Carlos Martinez",
    company: "GRUPO ALCON",
    location: "Ciudad de México, México",
    phone: "+52 55 1234-5678",
    totalInteractions: 8,
    joinedDate: "Enero 2023",
    lastActive: "5 min ago",
  });

  // Mock suggested products
  const [suggestedProducts] = useState([
    {
      id: "1",
      name: "Mármol Blanco Carrara",
      type: "Mármol Natural",
      density: "2.7 kg/dm³",
      absorption: "<0.5%",
      stock: 150,
      price: "$45.99/m²",
      viewedByClient: 5,
      image: "/placeholder.svg",
      hasImage: true,
      hasPDF: true,
      hasVideo: true,
    },
    {
      id: "2",
      name: "Travertino Romano",
      type: "Piedra Natural",
      density: "2.4 kg/dm³",
      absorption: "2-5%",
      stock: 8,
      price: "$32.50/m²",
      viewedByClient: 2,
      image: "/placeholder.svg",
      hasImage: true,
      hasPDF: true,
      hasVideo: false,
    },
  ]);

  // Mock shared files
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

  // Mock conversation analysis
  const [conversationAnalysis] = useState({
    mainTopics: ["Cotización mármol carrara", "Tiempo de entrega", "Precios"],
    sentiment: "positive" as "positive" | "neutral" | "negative",
    urgencyLevel: "medium",
    summary:
      "Cliente interesado en mármol carrara para proyecto de baño. Consultó precios y tiempos de entrega. Mostró intención de compra.",
  });

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
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-green-400" />
                Productos Sugeridos
                <Badge className="bg-green-600 text-white text-xs">
                  {suggestedProducts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                >
                  <div className="flex gap-3 mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white">
                          {product.name}
                        </h4>
                        {product.stock <= 10 && (
                          <Badge className="bg-orange-600 text-white text-xs">
                            Pocas unidades
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        {product.type}
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-300 mb-2">
                        <div>
                          <strong>Densidad:</strong> {product.density}
                        </div>
                        <div>
                          <strong>Absorción:</strong> {product.absorption}
                        </div>
                        <div>
                          <strong>Stock:</strong> {product.stock}
                        </div>
                        <div className="text-green-400 font-medium">
                          {product.price}
                        </div>
                      </div>
                      <p className="text-xs text-blue-400 mb-2">
                        Visto {product.viewedByClient} veces por este cliente
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-1">
                    {product.hasImage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 text-xs h-7"
                      >
                        📷 Imagen
                      </Button>
                    )}
                    {product.hasPDF && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 text-xs h-7"
                      >
                        📄 PDF
                      </Button>
                    )}
                    {product.hasVideo && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-purple-400 hover:text-purple-300 text-xs h-7"
                      >
                        🎥 Video
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white text-xs h-7"
                    >
                      📋 Ficha Técnica
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 2. Información del Cliente */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">CA</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">
                    {clientData.name}
                  </h4>
                  <p className="text-xs text-gray-400">{clientData.company}</p>
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
                  <span className="text-gray-300">
                    Cliente desde {clientData.joinedDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-300">
                    Última actividad: {clientData.lastActive}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-300">
                    {clientData.totalInteractions} interacciones
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Archivos Compartidos */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" />
                Archivos Compartidos
                <Badge className="bg-purple-600 text-white text-xs">
                  {sharedFiles.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sharedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{file.name}</p>
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
                          {file.direction === "sent" ? "Enviado" : "Recibido"}
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Análisis de Conversación */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-400" />
                Análisis de Conversación
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
                      className="bg-blue-600 text-white text-xs"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium text-gray-400 mb-1">
                  Resumen IA:
                </h5>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {conversationAnalysis.summary}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Urgencia:</span>
                <Badge
                  className={cn(
                    "text-xs",
                    conversationAnalysis.urgencyLevel === "high"
                      ? "bg-red-600 text-white"
                      : conversationAnalysis.urgencyLevel === "medium"
                        ? "bg-yellow-600 text-white"
                        : "bg-green-600 text-white",
                  )}
                >
                  {conversationAnalysis.urgencyLevel === "high"
                    ? "Alta"
                    : conversationAnalysis.urgencyLevel === "medium"
                      ? "Media"
                      : "Baja"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 5. Sentimiento del Cliente */}
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
                        : "bg-yellow-600 text-white",
                  )}
                >
                  {conversationAnalysis.sentiment === "positive"
                    ? "😊 Positivo"
                    : conversationAnalysis.sentiment === "negative"
                      ? "😞 Negativo"
                      : "😐 Neutral"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Satisfacción:</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < 4
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600",
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3">
                <p className={cn("text-xs", getSentimentColor())}>
                  💡 Cliente muestra interés genuino en los productos. Responde
                  rápidamente y hace preguntas específicas sobre
                  especificaciones técnicas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
