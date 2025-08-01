// Validación simplificada temporal
export interface ValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

export class ContactValidator {
  static validateBackendResponse(data: any): any[] {
    if (!data || !Array.isArray(data)) {
      return []
    }
    return data
  }
}
