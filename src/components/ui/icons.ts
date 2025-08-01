// Sistema centralizado de iconos con tree-shaking optimizado
// Importa solo los iconos necesarios para reducir bundle size

// ===== IMPORTACIONES INDIVIDUALES (TREE-SHAKING) =====
import { 
  // Layout y navegación
  Home,
  Users,
  MessageSquare,
  Settings,
  Search,
  Filter,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  
  // Acciones CRUD
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Copy,
  RefreshCw,
  
  // Estados y notificaciones
  Check,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  
  // Contactos y CRM
  Phone,
  Mail,
  Calendar,
  Tag,
  DollarSign,
  UserPlus,
  UserX,
  Building,
  
  // UI y feedback
  Eye,
  EyeOff,
  Star,
  Heart,
  ThumbsUp,
  
  // Sistema
  Lock,
  Unlock,
  Shield,
  Key,
  LogOut,
  
  // Media
  Image,
  FileText,
  Download as DownloadIcon,
  Upload as UploadIcon
} from 'lucide-react'

// ===== EXPORTACIONES ORGANIZADAS =====

// Layout y navegación
export {
  Home,
  Users,
  MessageSquare,
  Settings,
  Search,
  Filter,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
}

// Acciones CRUD
export {
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Copy,
  RefreshCw
}

// Estados y notificaciones
export {
  Check,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown
}

// Contactos y CRM
export {
  Phone,
  Mail,
  Calendar,
  Tag,
  DollarSign,
  UserPlus,
  UserX,
  Building
}

// UI y feedback
export {
  Eye,
  EyeOff,
  Star,
  Heart,
  ThumbsUp
}

// Sistema
export {
  Lock,
  Unlock,
  Shield,
  Key,
  LogOut
}

// Media
export {
  Image,
  FileText,
  DownloadIcon,
  UploadIcon
}

// ===== TIPOS PARA ICONOS =====
export type IconProps = {
  className?: string
  size?: number | string
  strokeWidth?: number
}

// ===== UTILIDADES =====
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40
} as const

export type IconSize = keyof typeof iconSizes 