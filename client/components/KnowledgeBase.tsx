import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Search,
  Upload,
  FolderPlus,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  Star,
  Tag,
  MessageCircle,
  Download,
  Share2,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  History,
  Bell,
  Users,
  Heart,
  Link,
  Filter,
  RefreshCw,
  Sparkles,
  Clock,
  User,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KnowledgeBaseProps {
  className?: string;
}

interface KBDocument {
  id: string;
  name: string;
  type: "pdf" | "excel" | "image" | "video" | "text";
  folder: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  description: string;
  tags: string[];
  isFavorite: boolean;
  views: number;
  comments: Comment[];
  linkedFAQs: string[];
  version: number;
  lastModified: string;
  permissions: {
    read: string[];
    edit: string[];
    create: string[];
  };
  aiSuggestedTags: string[];
  thumbnailUrl?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: "high" | "medium" | "low";
  linkedDocuments: string[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
  views: number;
  helpful: number;
  notHelpful: number;
  isPublished: boolean;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  replies: Comment[];
}

// Mock data
const mockDocuments: KBDocument[] = [
  {
    id: "1",
    name: "Manual de Productos 2024.pdf",
    type: "pdf",
    folder: "Productos",
    size: "2.4 MB",
    uploadDate: "2024-01-15",
    uploadedBy: "María García",
    description: "Manual completo de productos con especificaciones técnicas",
    tags: ["manual", "productos", "2024", "especificaciones"],
    isFavorite: true,
    views: 156,
    comments: [],
    linkedFAQs: ["faq1", "faq2"],
    version: 3,
    lastModified: "2024-01-20",
    permissions: { read: ["all"], edit: ["admin"], create: ["admin"] },
    aiSuggestedTags: ["catálogo", "técnico", "ventas"],
    thumbnailUrl: "https://via.placeholder.com/150x200/4F46E5/white?text=PDF",
  },
  {
    id: "2",
    name: "Presentación Corporativa.mp4",
    type: "video",
    folder: "Plantillas",
    size: "45.8 MB",
    uploadDate: "2024-01-12",
    uploadedBy: "Carlos López",
    description: "Video de presentación corporativa para clientes",
    tags: ["presentación", "corporativa", "video", "clientes"],
    isFavorite: false,
    views: 89,
    comments: [],
    linkedFAQs: [],
    version: 1,
    lastModified: "2024-01-12",
    permissions: { read: ["all"], edit: ["marketing"], create: ["marketing"] },
    aiSuggestedTags: ["institucional", "branding", "demo"],
    thumbnailUrl: "https://via.placeholder.com/150x100/EF4444/white?text=VIDEO",
  },
  {
    id: "3",
    name: "Precios y Descuentos Q1.xlsx",
    type: "excel",
    folder: "Productos",
    size: "890 KB",
    uploadDate: "2024-01-10",
    uploadedBy: "Ana Rodríguez",
    description: "Tabla de precios y descuentos aplicables primer trimestre",
    tags: ["precios", "descuentos", "Q1", "tarifas"],
    isFavorite: true,
    views: 203,
    comments: [],
    linkedFAQs: ["faq3"],
    version: 2,
    lastModified: "2024-01-18",
    permissions: { read: ["sales"], edit: ["admin"], create: ["admin"] },
    aiSuggestedTags: ["comercial", "pricing", "promociones"],
    thumbnailUrl: "https://via.placeholder.com/150x100/10B981/white?text=EXCEL",
  },
];

const mockFAQs: FAQ[] = [
  {
    id: "faq1",
    question: "¿Cuáles son las especificaciones técnicas del Producto A?",
    answer:
      "El Producto A cuenta con las siguientes especificaciones: dimensiones 10x15x8 cm, peso 2.5 kg, conectividad WiFi y Bluetooth, batería de 8 horas de duración.",
    category: "Productos",
    priority: "high",
    linkedDocuments: ["1"],
    createdBy: "IA Assistant",
    createdDate: "2024-01-15",
    lastModified: "2024-01-20",
    views: 89,
    helpful: 15,
    notHelpful: 2,
    isPublished: true,
  },
  {
    id: "faq2",
    question: "¿Qué descuentos están disponibles este trimestre?",
    answer:
      "Para Q1 2024 ofrecemos descuentos del 15% en compras superiores a $1000, 20% para clientes corporativos y promociones especiales en productos seleccionados.",
    category: "Precios",
    priority: "medium",
    linkedDocuments: ["3"],
    createdBy: "Ana Rodríguez",
    createdDate: "2024-01-10",
    lastModified: "2024-01-18",
    views: 67,
    helpful: 12,
    notHelpful: 1,
    isPublished: true,
  },
];

const folderStructure = [
  {
    id: "root",
    name: "Base de Conocimiento",
    icon: BookOpen,
    children: ["productos", "procesos", "politicas", "plantillas"],
  },
  { id: "productos", name: "Productos", icon: FileText, children: [] },
  { id: "procesos", name: "Procesos", icon: FileSpreadsheet, children: [] },
  { id: "politicas", name: "Políticas", icon: File, children: [] },
  { id: "plantillas", name: "Plantillas", icon: FileImage, children: [] },
];

export function KnowledgeBase({ className }: KnowledgeBaseProps) {
  const [selectedFolder, setSelectedFolder] = useState("root");
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFAQBuilder, setShowFAQBuilder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(["1", "3"]);
  const [notifications, setNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState("documents");

  // Filter documents based on search and folder
  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesFolder =
      selectedFolder === "root" || doc.folder.toLowerCase() === selectedFolder;
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => doc.tags.includes(tag));
    return matchesSearch && matchesFolder && matchesTags;
  });

  const allTags = Array.from(new Set(mockDocuments.flatMap((doc) => doc.tags)));

  const handleDocumentSelect = (docId: string) => {
    setSelectedDocument(docId);
    console.log(`Opening document: ${docId}`);
  };

  const handleToggleFavorite = (docId: string) => {
    setFavorites((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
    console.log(`Toggled favorite for document: ${docId}`);
  };

  const handleCreateFAQ = () => {
    setShowFAQBuilder(true);
    console.log("Opening FAQ builder from documents");
  };

  const handleUploadDocument = () => {
    setShowUpload(true);
    console.log("Opening document upload dialog");
  };

  const handleDownloadZip = () => {
    console.log("Downloading selected documents as ZIP");
  };

  const handleShare = (docId: string) => {
    console.log(`Generating shareable link for document: ${docId}`);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return FileText;
      case "excel":
        return FileSpreadsheet;
      case "image":
        return FileImage;
      case "video":
        return FileVideo;
      default:
        return File;
    }
  };

  return (
    <div className={cn("h-full bg-gray-950 overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-0 py-6">
        <div
          className="flex items-center justify-between"
          style={{ margin: "0 0 16px 3px" }}
        >
          <div
            className="flex items-center gap-3"
            style={{ marginLeft: "13px" }}
          >
            <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-500/30">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Base de Conocimiento
              </h1>
              <p className="text-sm text-gray-400">
                {filteredDocuments.length} documentos • {mockFAQs.length} FAQs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreateFAQ}
              className="bg-green-600 text-white hover:bg-green-700"
              style={{
                gap: "5px",
                height: "39px",
                justifyContent: "flex-start",
                marginLeft: "auto",
                width: "100%",
                flexGrow: "0",
              }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Crear FAQ
            </Button>
            <Button
              onClick={handleDownloadZip}
              variant="outline"
              className="border-gray-600 text-gray-300"
              style={{
                gap: "5px",
                height: "39px",
                justifyContent: "flex-start",
                marginLeft: "auto",
                width: "100%",
                flexGrow: "0",
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar ZIP
            </Button>
            <Button
              onClick={handleUploadDocument}
              className="bg-blue-600 text-white hover:bg-blue-700"
              style={{
                gap: "5px",
                height: "39px",
                justifyContent: "flex-start",
                marginLeft: "auto",
                width: "100%",
                flexGrow: "0",
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              style={{ left: "24px" }}
            />
            <Input
              placeholder="Buscar documentos, contenido o etiquetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
              style={{ marginLeft: "12px" }}
            />
          </div>

          <Select>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="recent">Recientes</SelectItem>
              <SelectItem value="favorites">Favoritos</SelectItem>
              <SelectItem value="shared">Compartidos</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} className="bg-blue-600 text-white">
                {tag}
                <button
                  onClick={() =>
                    setSelectedTags((prev) => prev.filter((t) => t !== tag))
                  }
                  className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100%-200px)]">
        {/* Left Sidebar - Folder Tree */}
        <div className="w-80 border-r border-gray-800 bg-gray-900/50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-white mb-3">
              Estructura de Carpetas
            </h3>
            <div className="space-y-1">
              {folderStructure.map((folder) => {
                const Icon = folder.icon;
                return (
                  <Button
                    key={folder.id}
                    variant={
                      selectedFolder === folder.id ? "secondary" : "ghost"
                    }
                    onClick={() => setSelectedFolder(folder.id)}
                    className={cn(
                      "w-full justify-start text-left",
                      selectedFolder === folder.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-800",
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {folder.name}
                  </Button>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-xs font-medium text-gray-400 mb-2">
                Estadísticas
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Documentos</span>
                  <span className="text-white">{mockDocuments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">FAQs Publicadas</span>
                  <span className="text-white">
                    {mockFAQs.filter((f) => f.isPublished).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Mis Favoritos</span>
                  <span className="text-white">{favorites.length}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-xs font-medium text-gray-400 mb-2">
                Actividad Reciente
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Manual actualizado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Nueva FAQ creada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-300">Documento compartido</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="mx-4 mt-4 bg-gray-800">
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-blue-600"
              >
                Documentos
              </TabsTrigger>
              <TabsTrigger
                value="faqs"
                className="data-[state=active]:bg-blue-600"
              >
                FAQs
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="data-[state=active]:bg-blue-600"
              >
                Favoritos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="flex-1 mx-4">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                  {filteredDocuments.map((doc) => {
                    const FileIcon = getFileIcon(doc.type);
                    return (
                      <Card
                        key={doc.id}
                        className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <FileIcon className="h-5 w-5 text-blue-400" />
                              <div className="min-w-0">
                                <CardTitle className="text-sm font-medium text-white truncate">
                                  {doc.name}
                                </CardTitle>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleFavorite(doc.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Heart
                                className={cn(
                                  "h-4 w-4",
                                  favorites.includes(doc.id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-400",
                                )}
                              />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {doc.thumbnailUrl && (
                            <div className="mb-3 rounded-md overflow-hidden">
                              <img
                                src={doc.thumbnailUrl}
                                alt=""
                                className="w-full h-24 object-cover"
                              />
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                            {doc.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {doc.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                className="text-xs bg-gray-700 text-gray-300"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{doc.size}</span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{doc.views}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              onClick={() => handleDocumentSelect(doc.id)}
                              className="flex-1 h-7 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShare(doc.id)}
                              className="h-7 text-xs"
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="faqs" className="flex-1 mx-4">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-4">
                  {mockFAQs.map((faq) => (
                    <Card
                      key={faq.id}
                      className="bg-gray-800/50 border-gray-700"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base font-medium text-white">
                            {faq.question}
                          </CardTitle>
                          <Badge
                            className={cn(
                              "text-xs",
                              faq.priority === "high"
                                ? "bg-red-600"
                                : faq.priority === "medium"
                                  ? "bg-yellow-600"
                                  : "bg-green-600",
                            )}
                          >
                            {faq.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 mb-3">{faq.answer}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex gap-4">
                            <span>👍 {faq.helpful}</span>
                            <span>👎 {faq.notHelpful}</span>
                            <span>👁️ {faq.views}</span>
                          </div>
                          <span>Por {faq.createdBy}</span>
                        </div>
                        {faq.linkedDocuments.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-400">
                              Documentos relacionados:{" "}
                            </span>
                            {faq.linkedDocuments.map((docId) => (
                              <Badge
                                key={docId}
                                className="text-xs bg-blue-600 text-white ml-1"
                              >
                                <Link className="h-3 w-3 mr-1" />
                                Doc {docId}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="favorites" className="flex-1 mx-4">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                  {filteredDocuments
                    .filter((doc) => favorites.includes(doc.id))
                    .map((doc) => {
                      const FileIcon = getFileIcon(doc.type);
                      return (
                        <Card
                          key={doc.id}
                          className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <FileIcon className="h-6 w-6 text-blue-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <h3 className="font-medium text-white text-sm mb-1 truncate">
                                  {doc.name}
                                </h3>
                                <p className="text-xs text-gray-400 mb-2">
                                  {doc.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {doc.size}
                                  </span>
                                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Document Preview/Details */}
        {selectedDocument && (
          <div className="w-96 border-l border-gray-800 bg-gray-900/50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Vista Previa
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>

              {/* Document Preview Area */}
              <div className="bg-gray-800 rounded-lg p-4 mb-4 h-64 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Vista previa del documento</p>
                  <p className="text-xs mt-1">
                    Integración con visor PDF/Excel
                  </p>
                </div>
              </div>

              {/* Document Actions */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Abrir
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Descargar
                </Button>
                <Button size="sm" variant="outline">
                  <Share2 className="h-3 w-3 mr-1" />
                  Compartir
                </Button>
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Comentar
                </Button>
              </div>

              {/* Document Details */}
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Subido por:</span>
                  <span className="text-white ml-2">María García</span>
                </div>
                <div>
                  <span className="text-gray-400">Última modificación:</span>
                  <span className="text-white ml-2">Hace 2 días</span>
                </div>
                <div>
                  <span className="text-gray-400">Versión:</span>
                  <span className="text-white ml-2">v3.0</span>
                </div>
                <div>
                  <span className="text-gray-400">Etiquetas IA:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {["catálogo", "técnico", "ventas"].map((tag) => (
                      <Badge
                        key={tag}
                        className="text-xs bg-purple-600 text-white"
                      >
                        <Sparkles className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Comments */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-white mb-2">
                  Comentarios Recientes
                </h4>
                <div className="space-y-2">
                  <div className="bg-gray-800 rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-300">
                        Carlos López
                      </span>
                      <span className="text-xs text-gray-500">hace 1h</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Este manual necesita actualización en la sección 3.2
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              Subir Documento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-500">
                Soporta: PDF, Excel, Imágenes, Videos (max 100MB)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Carpeta de destino
                </label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Seleccionar carpeta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="productos">Productos</SelectItem>
                    <SelectItem value="procesos">Procesos</SelectItem>
                    <SelectItem value="politicas">Políticas</SelectItem>
                    <SelectItem value="plantillas">Plantillas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Permisos
                </label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Nivel de acceso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <SelectItem value="team">Solo mi equipo</SelectItem>
                    <SelectItem value="admin">Solo administradores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Descripción
              </label>
              <Textarea
                placeholder="Describe el contenido del documento..."
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Etiquetas
              </label>
              <Input
                placeholder="Separar con comas: manual, producto, 2024..."
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUpload(false)}>
                Cancelar
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Subir Documento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Builder Dialog */}
      <Dialog open={showFAQBuilder} onOpenChange={setShowFAQBuilder}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Generador de FAQ con IA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">
                Generar FAQs automáticamente
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                La IA extraerá preguntas frecuentes de tus documentos y
                conversaciones de chat
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Desde Documentos
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Desde Chats
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="font-medium text-white mb-3">Crear FAQ Manual</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">
                    Pregunta
                  </label>
                  <Input
                    placeholder="¿Cuál es la pregunta frecuente?"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">
                    Respuesta
                  </label>
                  <Textarea
                    placeholder="Proporciona una respuesta clara y completa..."
                    className="bg-gray-800 border-gray-700"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 block">
                      Categoría
                    </label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="productos">Productos</SelectItem>
                        <SelectItem value="precios">Precios</SelectItem>
                        <SelectItem value="soporte">Soporte</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 block">
                      Prioridad
                    </label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Nivel de prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="low">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFAQBuilder(false)}
              >
                Cancelar
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Crear FAQ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
