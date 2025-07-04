import { SettingCard } from "./SettingCard";
import {
  Globe,
  Clock,
  Calendar,
  Bell,
  Mail,
  Palette,
  Layout,
  FileText,
  Save,
  CheckCircle,
  Upload,
  AlertTriangle,
  Timer,
  Focus,
  Files,
  Brain,
  FileSearch,
  Beaker,
  Monitor,
  Keyboard,
} from "lucide-react";

interface SettingsGridProps {
  settings: { [key: string]: any };
  onChange: (key: string, value: any) => void;
  section: "general" | "advanced";
}

// Define all settings with their configurations
const generalSettings = [
  {
    key: "language",
    label: "Lenguaje de la Interfaz",
    description: "Idioma principal de la aplicación",
    icon: Globe,
    type: "select" as const,
    options: ["Español", "Inglés", "Portugués"],
    placeholder: "{{language}}",
  },
  {
    key: "timezone",
    label: "Zona Horaria",
    description: "Tu zona horaria local",
    icon: Clock,
    type: "select" as const,
    options: [
      "America/Mexico_City",
      "America/New_York",
      "America/Los_Angeles",
      "Europe/Madrid",
      "Europe/London",
      "America/Sao_Paulo",
    ],
    placeholder: "{{timezone}}",
  },
  {
    key: "timeFormat",
    label: "Formato de Fecha/Hora",
    description: "Formato de visualización de tiempo",
    icon: Calendar,
    type: "toggle" as const,
    options: ["12h", "24h"],
    placeholder: "{{timeFormat}}",
  },
  {
    key: "pushNotif",
    label: "Notificaciones Push",
    description: "Recibir notificaciones en tiempo real",
    icon: Bell,
    type: "toggle" as const,
    placeholder: "{{pushNotif}}",
  },
  {
    key: "emailNotif",
    label: "Notificaciones por Email",
    description: "Recibir resúmenes por correo electrónico",
    icon: Mail,
    type: "toggle" as const,
    placeholder: "{{emailNotif}}",
  },
  {
    key: "theme",
    label: "Tema de Color",
    description: "Apariencia visual de la interfaz",
    icon: Palette,
    type: "select" as const,
    options: ["Light", "Dark", "Auto"],
    placeholder: "{{theme}}",
  },
  {
    key: "crmView",
    label: "Vista Predeterminada de CRM",
    description: "Formato de visualización por defecto",
    icon: Layout,
    type: "toggle" as const,
    options: ["Tabla", "Tarjetas"],
    placeholder: "{{crmView}}",
  },
  {
    key: "signature",
    label: "Firma de Mensajes",
    description: "Plantilla de firma automática",
    icon: FileText,
    type: "textarea" as const,
    placeholder: "{{signature}}",
  },
  {
    key: "autoSave",
    label: "Autoguardado de Borradores",
    description: "Guardar automáticamente mensajes",
    icon: Save,
    type: "toggle" as const,
    placeholder: "{{autoSave}}",
  },
  {
    key: "sendConfirm",
    label: "Confirmación de Envío",
    description: "Pedir confirmación antes de enviar",
    icon: CheckCircle,
    type: "toggle" as const,
    placeholder: "{{sendConfirm}}",
  },
  {
    key: "maxUpload",
    label: "Cargar Archivos Máximo (MB)",
    description: "Tamaño máximo de archivos",
    icon: Upload,
    type: "number" as const,
    min: 1,
    max: 100,
    placeholder: "{{maxUpload}}",
  },
  {
    key: "inactiveAlerts",
    label: "Avisos de Clientes Inactivos",
    description: "Notificar sobre clientes sin actividad",
    icon: AlertTriangle,
    type: "toggle" as const,
    placeholder: "{{inactiveAlerts}}",
  },
];

const advancedSettings = [
  {
    key: "sessionTimeout",
    label: "Tiempo Límite de Sesión",
    description: "Duración de la sesión activa",
    icon: Timer,
    type: "select" as const,
    options: ["15m", "30m", "1h", "Indefinido"],
    placeholder: "{{sessionTimeout}}",
  },
  {
    key: "focusMode",
    label: "Modo Concentración",
    description: "Silenciar notificaciones temporalmente",
    icon: Focus,
    type: "toggle" as const,
    placeholder: "{{focusMode}}",
  },
  {
    key: "templates",
    label: "Plantillas Predeterminadas",
    description: "Plantillas favoritas de mensajes",
    icon: Files,
    type: "multiselect" as const,
    options: ["template1", "template2", "template3", "template4"],
    placeholder: "{{templates}}",
  },
  {
    key: "iaLanguage",
    label: "Idioma de Sugerencias IA",
    description: "Idioma para recomendaciones de IA",
    icon: Brain,
    type: "select" as const,
    options: ["Español", "Inglés"],
    placeholder: "{{iaLanguage}}",
  },
  {
    key: "logLevel",
    label: "Nivel de Detalle de Logs",
    description: "Cantidad de información registrada",
    icon: FileSearch,
    type: "select" as const,
    options: ["Básico", "Completo"],
    placeholder: "{{logLevel}}",
  },
  {
    key: "betaAccess",
    label: "Acceso a Funciones Beta",
    description: "Probar nuevas características",
    icon: Beaker,
    type: "toggle" as const,
    placeholder: "{{betaAccess}}",
  },
  {
    key: "screenShare",
    label: "Permitir Compartir Pantalla",
    description: "Habilitar funciones de pantalla compartida",
    icon: Monitor,
    type: "toggle" as const,
    placeholder: "{{screenShare}}",
  },
  {
    key: "keyboardShortcuts",
    label: "Atajos de Teclado",
    description: "Combinaciones de teclas habilitadas",
    icon: Keyboard,
    type: "checkboxList" as const,
    options: [
      { key: "ctrl_s", label: "Ctrl+S (Guardar)" },
      { key: "ctrl_enter", label: "Ctrl+Enter (Enviar)" },
      { key: "esc", label: "Esc (Cancelar)" },
      { key: "ctrl_z", label: "Ctrl+Z (Deshacer)" },
      { key: "ctrl_f", label: "Ctrl+F (Buscar)" },
    ],
    placeholder: "{{keyboardShortcuts}}",
  },
];

export function SettingsGrid({
  settings,
  onChange,
  section,
}: SettingsGridProps) {
  const settingsToShow =
    section === "general" ? generalSettings : advancedSettings;

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      style={{
        rowGap: "24px",
        columnGap: "24px",
        marginBottom: "24px",
      }}
    >
      {settingsToShow.map((setting) => {
        const { key, ...settingProps } = setting;
        return (
          <div
            key={key}
            style={{
              marginBottom: "24px",
              marginRight: "24px",
            }}
          >
            <SettingCard
              {...settingProps}
              value={settings[key]}
              onChange={(value) => onChange(key, value)}
            />
          </div>
        );
      })}
    </div>
  );
}
