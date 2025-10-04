import api from './api';
import { handleApiError } from '../config/apiConfig';
import {
  Certification,
  DevelopmentPlan,
  DevelopmentActivity,
  SkillEvaluation,
  SkillSummary,
  EvaluationTemplate,
  EvaluationQuestion
} from '../types/hr';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Skill {
  id: string;
  employeeId: string;
  name: string;
  category: 'technical' | 'soft' | 'leadership' | 'language' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  score: number;
  lastEvaluated: string;
  evidence: string;
  isRequired: boolean;
  developmentPlan: string;
  resources: string[];
  targetLevel?: string;
  targetDate?: string;
}

export interface CreateSkillRequest {
  name: string;
  category: Skill['category'];
  level: Skill['level'];
  score: number;
  evidence?: string;
  isRequired?: boolean;
  developmentPlan?: string;
  resources?: string[];
  targetLevel?: Skill['targetLevel'];
  targetDate?: string;
}

export interface CreateCertificationRequest {
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId: string;
  credentialUrl?: string;
  description?: string;
  category: Certification['category'];
  level: Certification['level'];
  documents?: string[];
}

export interface CreateDevelopmentPlanRequest {
  skillId: string;
  skillName: string;
  currentLevel: DevelopmentPlan['currentLevel'];
  targetLevel: DevelopmentPlan['targetLevel'];
  activities: Omit<DevelopmentActivity, 'id'>[];
  startDate: string;
  targetDate: string;
  mentor?: string;
  notes?: string;
}

export interface CreateSkillEvaluationRequest {
  skillId: string;
  skillName: string;
  evaluationType: SkillEvaluation['evaluationType'];
  level: SkillEvaluation['level'];
  score: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  developmentSuggestions?: string[];
  evidence?: string[];
}

// ============================================================================
// SKILLS SERVICE
// ============================================================================

class SkillsService {
  private handleError(error: unknown, context: string): never {
    const errorMessage = handleApiError(error);
    console.error(`❌ SkillsService.${context}:`, errorMessage);
    throw new Error(errorMessage);
  }

  // ========== GESTIÓN DE HABILIDADES ==========

  async getEmployeeSkills(employeeId: string, filters: {
    category?: string;
    level?: string;
    required?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    skills: Skill[];
    summary: SkillSummary;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      console.log('🔍 Obteniendo habilidades del empleado:', { employeeId, filters });

      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/employees/${employeeId}/skills?${searchParams.toString()}`);

      const result = response.data.data || response.data;
      console.log(`✅ ${result.skills?.length || 0} habilidades obtenidas`);
      return result;
    } catch (error) {
      this.handleError(error, 'getEmployeeSkills');
    }
  }

  async getSkillById(employeeId: string, skillId: string): Promise<Skill> {
    try {
      console.log('🔍 Obteniendo habilidad:', { employeeId, skillId });

      const response = await api.get(`/api/employees/${employeeId}/skills/${skillId}`);

      console.log('✅ Habilidad obtenida');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getSkillById');
    }
  }

  async createSkill(employeeId: string, skillData: CreateSkillRequest): Promise<Skill> {
    try {
      console.log('📝 Creando habilidad:', { employeeId, skillData });

      const response = await api.post(`/api/employees/${employeeId}/skills`, skillData);

      console.log('✅ Habilidad creada exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'createSkill');
    }
  }

  async updateSkill(employeeId: string, skillId: string, updateData: Partial<CreateSkillRequest>): Promise<Skill> {
    try {
      console.log('📝 Actualizando habilidad:', { employeeId, skillId, updateData });

      const response = await api.put(`/api/employees/${employeeId}/skills/${skillId}`, updateData);

      console.log('✅ Habilidad actualizada');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'updateSkill');
    }
  }

  async deleteSkill(employeeId: string, skillId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando habilidad:', { employeeId, skillId });

      await api.delete(`/api/employees/${employeeId}/skills/${skillId}`);

      console.log('✅ Habilidad eliminada');
    } catch (error) {
      this.handleError(error, 'deleteSkill');
    }
  }

  // ========== GESTIÓN DE CERTIFICACIONES ==========

  async getEmployeeCertifications(employeeId: string, filters: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    certifications: Certification[];
    summary: {
      totalCertifications: number;
      activeCertifications: number;
      expiringSoon: number;
      byCategory: Record<string, number>;
      byStatus: Record<string, number>;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      console.log('🔍 Obteniendo certificaciones del empleado:', { employeeId, filters });

      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/employees/${employeeId}/certifications?${searchParams.toString()}`);

      const result = response.data.data || response.data;
      console.log(`✅ ${result.certifications?.length || 0} certificaciones obtenidas`);
      return result;
    } catch (error) {
      this.handleError(error, 'getEmployeeCertifications');
    }
  }

  async createCertification(employeeId: string, certificationData: CreateCertificationRequest): Promise<Certification> {
    try {
      console.log('📝 Creando certificación:', { employeeId, certificationData });

      const response = await api.post(`/api/employees/${employeeId}/certifications`, certificationData);

      console.log('✅ Certificación creada exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'createCertification');
    }
  }

  async updateCertification(employeeId: string, certificationId: string, updateData: Partial<CreateCertificationRequest>): Promise<Certification> {
    try {
      console.log('📝 Actualizando certificación:', { employeeId, certificationId, updateData });

      const response = await api.put(`/api/employees/${employeeId}/certifications/${certificationId}`, updateData);

      console.log('✅ Certificación actualizada');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'updateCertification');
    }
  }

  async deleteCertification(employeeId: string, certificationId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando certificación:', { employeeId, certificationId });

      await api.delete(`/api/employees/${employeeId}/certifications/${certificationId}`);

      console.log('✅ Certificación eliminada');
    } catch (error) {
      this.handleError(error, 'deleteCertification');
    }
  }

  // ========== GESTIÓN DE PLANES DE DESARROLLO ==========

  async getEmployeeDevelopmentPlans(employeeId: string, filters: {
    status?: string;
    skillId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    developmentPlans: DevelopmentPlan[];
    summary: {
      totalPlans: number;
      activePlans: number;
      completedPlans: number;
      averageProgress: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      console.log('🔍 Obteniendo planes de desarrollo:', { employeeId, filters });

      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/employees/${employeeId}/development-plans?${searchParams.toString()}`);

      const result = response.data.data || response.data;
      console.log(`✅ ${result.developmentPlans?.length || 0} planes de desarrollo obtenidos`);
      return result;
    } catch (error) {
      this.handleError(error, 'getEmployeeDevelopmentPlans');
    }
  }

  async createDevelopmentPlan(employeeId: string, planData: CreateDevelopmentPlanRequest): Promise<DevelopmentPlan> {
    try {
      console.log('📝 Creando plan de desarrollo:', { employeeId, planData });

      const response = await api.post(`/api/employees/${employeeId}/development-plans`, planData);

      console.log('✅ Plan de desarrollo creado exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'createDevelopmentPlan');
    }
  }

  async updateDevelopmentPlan(employeeId: string, planId: string, updateData: Partial<CreateDevelopmentPlanRequest & {
    status?: DevelopmentPlan['status'];
    progress?: number;
  }>): Promise<DevelopmentPlan> {
    try {
      console.log('📝 Actualizando plan de desarrollo:', { employeeId, planId, updateData });

      const response = await api.put(`/api/employees/${employeeId}/development-plans/${planId}`, updateData);

      console.log('✅ Plan de desarrollo actualizado');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'updateDevelopmentPlan');
    }
  }

  async deleteDevelopmentPlan(employeeId: string, planId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando plan de desarrollo:', { employeeId, planId });

      await api.delete(`/api/employees/${employeeId}/development-plans/${planId}`);

      console.log('✅ Plan de desarrollo eliminado');
    } catch (error) {
      this.handleError(error, 'deleteDevelopmentPlan');
    }
  }

  // ========== GESTIÓN DE EVALUACIONES ==========

  async getEmployeeSkillEvaluations(employeeId: string, filters: {
    skillId?: string;
    evaluationType?: string;
    status?: string;
    year?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    evaluations: SkillEvaluation[];
    summary: {
      totalEvaluations: number;
      averageScore: number;
      byType: Record<string, number>;
      byStatus: Record<string, number>;
      recentEvaluations: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      console.log('🔍 Obteniendo evaluaciones de habilidades:', { employeeId, filters });

      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/employees/${employeeId}/skill-evaluations?${searchParams.toString()}`);

      const result = response.data.data || response.data;
      console.log(`✅ ${result.evaluations?.length || 0} evaluaciones obtenidas`);
      return result;
    } catch (error) {
      this.handleError(error, 'getEmployeeSkillEvaluations');
    }
  }

  async createSkillEvaluation(employeeId: string, evaluationData: CreateSkillEvaluationRequest): Promise<SkillEvaluation> {
    try {
      console.log('📝 Creando evaluación de habilidad:', { employeeId, evaluationData });

      const response = await api.post(`/api/employees/${employeeId}/skill-evaluations`, evaluationData);

      console.log('✅ Evaluación creada exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'createSkillEvaluation');
    }
  }

  async updateSkillEvaluation(employeeId: string, evaluationId: string, updateData: Partial<CreateSkillEvaluationRequest & {
    status?: SkillEvaluation['status'];
  }>): Promise<SkillEvaluation> {
    try {
      console.log('📝 Actualizando evaluación:', { employeeId, evaluationId, updateData });

      const response = await api.put(`/api/employees/${employeeId}/skill-evaluations/${evaluationId}`, updateData);

      console.log('✅ Evaluación actualizada');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'updateSkillEvaluation');
    }
  }

  async deleteSkillEvaluation(employeeId: string, evaluationId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando evaluación:', { employeeId, evaluationId });

      await api.delete(`/api/employees/${employeeId}/skill-evaluations/${evaluationId}`);

      console.log('✅ Evaluación eliminada');
    } catch (error) {
      this.handleError(error, 'deleteSkillEvaluation');
    }
  }

  // ========== SUBIDA DE ARCHIVOS ==========

  async uploadSkillFiles(files: File[], type: 'evidence' | 'certification' | 'evaluation'): Promise<string[]> {
    try {
      console.log('📎 Subiendo archivos de habilidades:', files.length, 'tipo:', type);

      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('type', type);

      const response = await api.post('/api/skills/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const fileIds = response.data.data?.fileIds || response.data.fileIds || [];
      console.log('✅ Archivos subidos:', fileIds);
      return fileIds;
    } catch (error) {
      this.handleError(error, 'uploadSkillFiles');
    }
  }

  // ========== REPORTES Y EXPORTACIÓN ==========

  async exportSkillsData(employeeId: string, format: 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    try {
      console.log('📥 Exportando datos de habilidades:', { employeeId, format });

      const response = await api.get(`/api/employees/${employeeId}/skills/export`, {
        params: { format },
        responseType: 'blob'
      });

      console.log('✅ Datos exportados');
      return response.data;
    } catch (error) {
      this.handleError(error, 'exportSkillsData');
    }
  }

  async generateSkillsReport(employeeId: string, reportType: 'summary' | 'detailed' | 'development' | 'certifications'): Promise<Blob> {
    try {
      console.log('📄 Generando reporte de habilidades:', { employeeId, reportType });

      const response = await api.get(`/api/employees/${employeeId}/skills/report/${reportType}`, {
        responseType: 'blob'
      });

      console.log('✅ Reporte generado');
      return response.data;
    } catch (error) {
      this.handleError(error, 'generateSkillsReport');
    }
  }
}

export const skillsService = new SkillsService();
export default skillsService;
