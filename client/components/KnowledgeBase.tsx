import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  FileSpreadsheet,
  FileImage,
  Star,
  Grip,
  List,
} from "lucide-react";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { Loader2 } from "lucide-react";
import type { KBDocument, FAQ } from "@/types/api";

export function KnowledgeBase({ className }: { className?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { data: documentsResponse, isLoading: isLoadingDocs } = useKnowledgeBase({ search: searchQuery, type: 'document' });
  const { data: faqsResponse, isLoading: isLoadingFaqs } = useKnowledgeBase({ search: searchQuery, type: 'faq' });

  const documents = documentsResponse?.data || [];
  const faqs = faqsResponse?.data || [];
  
  const isLoading = isLoadingDocs || isLoadingFaqs;

  const getFileIcon = (type: string) => {
    switch(type) {
        case 'pdf': return <FileText className="h-10 w-10 text-red-400" />;
        case 'excel': return <FileSpreadsheet className="h-10 w-10 text-green-400" />;
        case 'video': return <FileImage className="h-10 w-10 text-blue-400" />;
        default: return <FileText className="h-10 w-10 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen />
          Base de Conocimiento
        </h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Subir Documento
        </Button>
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
                placeholder="Buscar en documentos y FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700" 
            />
        </div>
        <div className="flex items-center gap-2">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}><Grip className="h-5 w-5"/></Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}><List className="h-5 w-5"/></Button>
        </div>
      </div>

      <Tabs defaultValue="documents" className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="documents">Documentos ({documents.length})</TabsTrigger>
          <TabsTrigger value="faqs">FAQs ({faqs.length})</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : (
            <>
            <TabsContent value="documents" className="flex-1">
                {viewMode === 'grid' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {documents.map(doc => (
                            <div key={doc.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                {getFileIcon(doc.type)}
                                <h3 className="font-semibold truncate mt-2">{doc.name}</h3>
                                <p className="text-xs text-gray-400 truncate">{doc.description}</p>
                                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                    <span>{doc.size}</span>
                                    <span>{doc.uploadDate}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {documents.map(doc => (
                             <div key={doc.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center gap-4">
                                {getFileIcon(doc.type)}
                                <div className="flex-1">
                                    <h3 className="font-semibold truncate">{doc.name}</h3>
                                    <p className="text-xs text-gray-400 truncate">{doc.description}</p>
                                </div>
                                <div className="text-xs text-gray-500">{doc.size}</div>
                                <div className="text-xs text-gray-500">{doc.uploadDate}</div>
                             </div>
                        ))}
                    </div>
                )}
            </TabsContent>
            
            <TabsContent value="faqs" className="flex-1">
                 <div className="space-y-4">
                    {faqs.map(faq => (
                        <div key={faq.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-semibold text-white">{faq.question}</h3>
                            <p className="text-sm text-gray-300 mt-1">{faq.answer}</p>
                        </div>
                    ))}
                 </div>
            </TabsContent>
            </>
        )}
      </Tabs>
    </div>
  );
}
