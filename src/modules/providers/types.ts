export interface Provider {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  materialIds?: string[];
  email?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}
