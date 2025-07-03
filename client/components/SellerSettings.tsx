import { useState } from "react";
import { SettingsGrid } from "./settings/SettingsGrid";
import { RestoreDefaultsButton } from "./settings/RestoreDefaultsButton";
import { AccordionAdvanced } from "./settings/AccordionAdvanced";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, RefreshCw, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingValue {
  [key: string]: any;
}

// Mock current settings - replace with real data from backend
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

interface SellerSettingsProps {
  className?: string;
}

export function SellerSettings({ className }: SellerSettingsProps) {
  const [settings, setSettings] = useState<SettingValue>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Handle setting changes with real-time save simulation
  const handleSettingChange = (key: string, value: any) => {
    console.log(`Setting changed: ${key} = ${value}`);
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);

    // Simulate real-time save
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
      console.log(`{{${key}}} saved to backend:`, value);
    }, 1000);
  };

  // Handle restore defaults
  const handleRestoreDefaults = () => {
    setIsResetting(true);
    setTimeout(() => {
      setSettings(defaultSettings);
      setIsResetting(false);
      setHasChanges(false);
      console.log("Settings restored to defaults");
    }, 1500);
  };

  // Calculate total settings configured
  const configuredSettings = Object.values(settings).filter(
    (value) => value !== null && value !== undefined && value !== "",
  ).length;

  return (
    <div className={cn("h-full bg-gray-950 overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-0 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Configuración del Vendedor
              </h1>
              <p className="text-sm text-gray-400">
                Ajusta tus preferencias y permisos aquí
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              {isSaving && (
                <Badge className="bg-blue-600 text-white text-xs flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Guardando...
                </Badge>
              )}
              {hasChanges && !isSaving && (
                <Badge className="bg-yellow-600 text-white text-xs">
                  Cambios pendientes
                </Badge>
              )}
              <Badge className="bg-gray-700 text-gray-300 text-xs">
                {configuredSettings}/20 configurados
              </Badge>
            </div>

            {/* Restore Defaults Button */}
            <RestoreDefaultsButton
              onRestore={handleRestoreDefaults}
              isResetting={isResetting}
            />
          </div>
        </div>

        {/* Help Information */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-300 font-medium mb-1">
                💡 Configuración inteligente
              </p>
              <p className="text-blue-200/80 text-xs">
                Todos los cambios se guardan automáticamente. Las
                configuraciones avanzadas están disponibles en la sección
                desplegable inferior.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-0 py-6 space-y-8">
          {/* Main Settings Grid */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Configuraciones Generales
              </h2>
              <p className="text-sm text-gray-400">
                Ajustes básicos y preferencias de uso diario
              </p>
            </div>
            <SettingsGrid
              settings={settings}
              onChange={handleSettingChange}
              section="general"
            />
          </div>

          {/* Advanced Settings Accordion */}
          <AccordionAdvanced
            settings={settings}
            onChange={handleSettingChange}
          />

          {/* Settings Summary */}
          <div className="pt-6 border-t border-gray-800">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-3">
                Resumen de Configuración
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Idioma</p>
                  <p className="text-sm font-semibold text-white">
                    {settings.language}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tema</p>
                  <p className="text-sm font-semibold text-white">
                    {settings.theme}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Vista CRM</p>
                  <p className="text-sm font-semibold text-white">
                    {settings.crmView}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sesión</p>
                  <p className="text-sm font-semibold text-white">
                    {settings.sessionTimeout}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
