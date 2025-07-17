import { useState, useEffect } from "react";
import { SettingsGrid } from "./settings/SettingsGrid";
import { RestoreDefaultsButton } from "./settings/RestoreDefaultsButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings, User, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/apiClient";
import { logger } from "@/lib/utils";

// Hook simulado para configuraciones (esto debería venir del backend)
const useSellerSettings = () => {
  const [settings, setSettings] = useState<SettingValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Simular carga de configuración desde backend
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        // 🔧 Llamada real al backend para obtener configuración
        const response = await api.get('/users/me/settings');
        if (response) {
          setSettings(response);
          return;
        }
        
        // Configuración por defecto que vendría del backend
        const defaultSettings: SettingValue = {
          language: "Español",
          timezone: "America/Mexico_City",
          timeFormat: "24h",
          pushNotif: true,
          emailNotif: true,
          theme: "Dark",
          crmView: "Tabla",
          signature: "Saludos cordiales,\n{{sellerName}}\n{{companyName}}",
          autoSave: true,
          sendConfirm: false,
          maxUpload: 50,
          inactiveAlerts: true,
          sessionTimeout: "1h",
          focusMode: false,
          templates: ["template1", "template3"],
          iaLanguage: "Español",
          logLevel: "Básico",
          betaAccess: false,
          screenShare: true,
          keyboardShortcuts: ["ctrl_s", "ctrl_enter", "esc"],
        };
        
        setSettings(defaultSettings);
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Error al cargar configuración",
          description: "No se pudo cargar la configuración del usuario.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<SettingValue>) => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      // TODO: Reemplazar con llamada real al backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido guardados exitosamente.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      setIsSaving(true);
      // TODO: Reemplazar con llamada real al backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const defaultSettings: SettingValue = {
        language: "Español",
        timezone: "America/Mexico_City",
        timeFormat: "24h",
        pushNotif: true,
        emailNotif: true,
        theme: "Dark",
        crmView: "Tabla",
        signature: "Saludos cordiales,\n{{sellerName}}\n{{companyName}}",
        autoSave: true,
        sendConfirm: false,
        maxUpload: 50,
        inactiveAlerts: true,
        sessionTimeout: "1h",
        focusMode: false,
        templates: ["template1", "template3"],
        iaLanguage: "Español",
        logLevel: "Básico",
        betaAccess: false,
        screenShare: true,
        keyboardShortcuts: ["ctrl_s", "ctrl_enter", "esc"],
      };
      
      setSettings(defaultSettings);
      
      toast({
        title: "Configuración restaurada",
        description: "Se han restaurado los valores por defecto.",
      });
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast({
        title: "Error al restaurar",
        description: "No se pudo restaurar la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    updateSettings,
    resetToDefaults,
  };
};

export interface SettingValue {
  language: string;
  timezone: string;
  timeFormat: string;
  pushNotif: boolean;
  emailNotif: boolean;
  theme: string;
  crmView: string;
  signature: string;
  autoSave: boolean;
  sendConfirm: boolean;
  maxUpload: number;
  inactiveAlerts: boolean;
  sessionTimeout: string;
  focusMode: boolean;
  templates: string[];
  iaLanguage: string;
  logLevel: string;
  betaAccess: boolean;
  screenShare: boolean;
  keyboardShortcuts: string[];
}

interface SellerSettingsProps {
  className?: string;
}

export function SellerSettings({ className }: SellerSettingsProps) {
  const {
    settings,
    isLoading,
    isSaving,
    updateSettings,
    resetToDefaults,
  } = useSellerSettings();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    if (!settings) return;
    
    const newSettings = { ...settings, [key]: value };
    updateSettings({ [key]: value });
    setHasUnsavedChanges(false); // Se guarda automáticamente
  };

  const handleSaveAll = () => {
    if (!settings) return;
    // En este caso no hace nada porque se guarda automáticamente
    setHasUnsavedChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-400">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Error al cargar la configuración</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 text-white p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Configuración del Vendedor</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              Cambios sin guardar
            </Badge>
          )}
          
          <Button
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Settings Grid */}
      <SettingsGrid
        settings={settings}
        onSettingChange={handleSettingChange}
        isLoading={isSaving}
      />

      {/* Restore Defaults */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <RestoreDefaultsButton
          onRestore={resetToDefaults}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}
