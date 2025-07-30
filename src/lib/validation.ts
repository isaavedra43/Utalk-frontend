// Validación simplificada temporal
export interface ValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

export class MessageValidator {
  static validateBackendResponse(data: any): any[] {
    if (!data || !Array.isArray(data)) {
      return []
    }
    return data
  }
}

export class ConversationValidator {
  static validateBackendResponse(data: any): any[] {
    if (!data || !Array.isArray(data)) {
      return []
    }
    return data
  }
}

export class ContactValidator {
  static validateBackendResponse(data: any): any[] {
    if (!data || !Array.isArray(data)) {
      return []
    }
    return data
  }
}
