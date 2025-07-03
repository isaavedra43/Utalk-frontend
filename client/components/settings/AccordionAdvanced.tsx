import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsGrid } from "./SettingsGrid";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Settings2,
  Lock,
  Zap,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionAdvancedProps {
  settings: { [key: string]: any };
  onChange: (key: string, value: any) => void;
}

export function AccordionAdvanced({
  settings,
  onChange,
}: AccordionAdvancedProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Count configured advanced settings
  const advancedKeys = [
    "sessionTimeout",
    "focusMode",
    "templates",
    "iaLanguage",
    "logLevel",
    "betaAccess",
    "screenShare",
    "keyboardShortcuts",
  ];

  const configuredAdvanced = advancedKeys.filter(
    (key) =>
      settings[key] !== null &&
      settings[key] !== undefined &&
      settings[key] !== "" &&
      (Array.isArray(settings[key])
        ? settings[key].length > 0
        : settings[key] !== false),
  ).length;

  return (
    <Card className="bg-gray-800/30 border-gray-700/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-800/50 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-900/30 border border-purple-500/30">
                  <Settings2 className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Configuraciones Avanzadas
                  </h3>
                  <p className="text-sm text-gray-400">
                    Ajustes de poder usuario y funciones experimentales
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status badges */}
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600 text-white text-xs">
                    {configuredAdvanced}/{advancedKeys.length} configurados
                  </Badge>
                  {settings.betaAccess && (
                    <Badge className="bg-orange-600 text-white text-xs flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Beta
                    </Badge>
                  )}
                  {settings.focusMode && (
                    <Badge className="bg-red-600 text-white text-xs">
                      Modo Focus
                    </Badge>
                  )}
                </div>

                {/* Chevron icon */}
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Warning notice */}
            <div className="mb-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-yellow-300 font-medium mb-1">
                    ⚠️ Configuraciones Avanzadas
                  </p>
                  <p className="text-yellow-200/80 text-xs">
                    Estos ajustes pueden afectar el rendimiento del sistema.
                    Modifica solo si sabes lo que estás haciendo. Algunas
                    funciones requieren permisos de administrador.
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Settings Grid */}
            <div className="space-y-6">
              <div>
                <div className="mb-4">
                  <h4 className="text-base font-medium text-white mb-2">
                    Configuraciones de Sistema
                  </h4>
                  <p className="text-xs text-gray-400">
                    Ajustes que afectan el comportamiento del sistema
                  </p>
                </div>
                <SettingsGrid
                  settings={settings}
                  onChange={onChange}
                  section="advanced"
                />
              </div>

              {/* Advanced Actions */}
              <div className="pt-4 border-t border-gray-700">
                <div className="mb-4">
                  <h4 className="text-base font-medium text-white mb-2">
                    Acciones Avanzadas
                  </h4>
                  <p className="text-xs text-gray-400">
                    Operaciones especiales y herramientas de diagnóstico
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Clear Cache */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log(
                        "{{clearCache}} - Clearing application cache",
                      );
                    }}
                    className="justify-start h-auto p-3 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm">Limpiar Caché</p>
                      <p className="text-xs opacity-80">
                        Eliminar datos temporales
                      </p>
                    </div>
                  </Button>

                  {/* Export Settings */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log(
                        "{{exportSettings}} - Exporting settings",
                        settings,
                      );
                    }}
                    className="justify-start h-auto p-3 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm">Exportar Ajustes</p>
                      <p className="text-xs opacity-80">
                        Descargar configuración
                      </p>
                    </div>
                  </Button>

                  {/* Debug Mode */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log("{{debugMode}} - Toggling debug mode");
                    }}
                    className="justify-start h-auto p-3 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm">Modo Debug</p>
                      <p className="text-xs opacity-80">Información técnica</p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* System Information */}
              <div className="pt-4 border-t border-gray-700">
                <div className="mb-4">
                  <h4 className="text-base font-medium text-white mb-2">
                    Información del Sistema
                  </h4>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
                    <div>
                      <p className="text-gray-500 mb-1">Versión</p>
                      <p className="text-white font-mono">v2.1.0</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Sesión</p>
                      <p className="text-white font-mono">
                        {settings.sessionTimeout}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Cache</p>
                      <p className="text-green-400 font-mono">12.5 MB</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Uptime</p>
                      <p className="text-blue-400 font-mono">4h 23m</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
