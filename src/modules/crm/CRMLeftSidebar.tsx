// Sidebar izquierdo del CRM con filtros avanzados
// Incluye filtros por estado, canal, owner, fechas y búsqueda avanzada
import { useState } from 'react'
import { Search, Filter, Users, Calendar, Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  contactStatusOptions, 
  contactChannelOptions, 
  contactOwnerOptions, 
  contactDateRangeOptions, 
  contactSearchOptions 
} from '@/lib/crm/contactOptions' 