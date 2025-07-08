// Tipos TypeScript compartidos para los servicios de API del chat.
// Permiten tipado estricto y reutilizable en toda la app.

export interface Conversation {
  id: string;
  title: string;
  members: string[];
  lastMessage?: string;
  unreadCount: number;
  channel: 'whatsapp' | 'email' | 'facebook' | string;
  // cualquier otro campo que guardes en Firestore...
}

export interface ClientInfo {
  id: string;
  name: string;
  company: string;
  status: 'Alta' | 'Baja' | string;
  phone: string;
  email: string;
  since: string; // formateado
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string; // ISO o número
  channel: "twilio" | "facebook";
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  error?: { message: string; code?: string };
}

// TODO: Añadir tipos para paginación, adjuntos, y soporte multicanal avanzado. 