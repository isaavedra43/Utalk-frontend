import { useState, useEffect, useCallback } from 'react';
import {
  skillsService,
  Skill,
  Certification,
  DevelopmentPlan,
  SkillEvaluation,
  SkillSummary,
  CreateSkillRequest,
  CreateCertificationRequest,
  CreateDevelopmentPlanRequest,
  CreateSkillEvaluationRequest
} from '../services/skillsService';

// ============================================================================
// TYPES
// ============================================================================

interface UseSkillsOptions {
  employeeId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseSkillsReturn {
  // Estado de habilidades
  skills: Skill[];
  skillsSummary: SkillSummary | null;
  skillsLoading: boolean;
  skillsError: string | null;

  // Estado de certificaciones
  certifications: Certification[];
  certificationsSummary: any;
  certificationsLoading: boolean;
  certificationsError: string | null;

  // Estado de planes de desarrollo
  developmentPlans: DevelopmentPlan[];
  developmentPlansSummary: any;
  developmentPlansLoading: boolean;
  developmentPlansError: string | null;

  // Estado de evaluaciones
  evaluations: SkillEvaluation[];
  evaluationsSummary: any;
  evaluationsLoading: boolean;
  evaluationsError: string | null;

  // Funciones de habilidades
  createSkill: (skillData: CreateSkillRequest) => Promise<Skill>;
  updateSkill: (skillId: string, updateData: Partial<CreateSkillRequest>) => Promise<Skill>;
  deleteSkill: (skillId: string) => Promise<void>;
  uploadSkillFiles: (files: File[], type: 'evidence' | 'certification' | 'evaluation') => Promise<string[]>;

  // Funciones de certificaciones
  createCertification: (certificationData: CreateCertificationRequest) => Promise<Certification>;
  updateCertification: (certificationId: string, updateData: Partial<CreateCertificationRequest>) => Promise<Certification>;
  deleteCertification: (certificationId: string) => Promise<void>;

  // Funciones de planes de desarrollo
  createDevelopmentPlan: (planData: CreateDevelopmentPlanRequest) => Promise<DevelopmentPlan>;
  updateDevelopmentPlan: (planId: string, updateData: any) => Promise<DevelopmentPlan>;
  deleteDevelopmentPlan: (planId: string) => Promise<void>;

  // Funciones de evaluaciones
  createSkillEvaluation: (evaluationData: CreateSkillEvaluationRequest) => Promise<SkillEvaluation>;
  updateSkillEvaluation: (evaluationId: string, updateData: any) => Promise<SkillEvaluation>;
  deleteSkillEvaluation: (evaluationId: string) => Promise<void>;

  // Funciones de reporte
  exportSkillsData: (format?: 'excel' | 'pdf') => Promise<Blob>;
  generateSkillsReport: (reportType: 'summary' | 'detailed' | 'development' | 'certifications') => Promise<Blob>;

  // Funciones de refresh
  refreshSkills: () => Promise<void>;
  refreshCertifications: () => Promise<void>;
  refreshDevelopmentPlans: () => Promise<void>;
  refreshEvaluations: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export const useSkills = (options: UseSkillsOptions): UseSkillsReturn => {
  const { employeeId, autoRefresh = false, refreshInterval = 30000 } = options;

  // ========== ESTADO DE HABILIDADES ==========
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsSummary, setSkillsSummary] = useState<SkillSummary | null>(null);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  // ========== ESTADO DE CERTIFICACIONES ==========
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certificationsSummary, setCertificationsSummary] = useState<any>(null);
  const [certificationsLoading, setCertificationsLoading] = useState(true);
  const [certificationsError, setCertificationsError] = useState<string | null>(null);

  // ========== ESTADO DE PLANES DE DESARROLLO ==========
  const [developmentPlans, setDevelopmentPlans] = useState<DevelopmentPlan[]>([]);
  const [developmentPlansSummary, setDevelopmentPlansSummary] = useState<any>(null);
  const [developmentPlansLoading, setDevelopmentPlansLoading] = useState(true);
  const [developmentPlansError, setDevelopmentPlansError] = useState<string | null>(null);

  // ========== ESTADO DE EVALUACIONES ==========
  const [evaluations, setEvaluations] = useState<SkillEvaluation[]>([]);
  const [evaluationsSummary, setEvaluationsSummary] = useState<any>(null);
  const [evaluationsLoading, setEvaluationsLoading] = useState(true);
  const [evaluationsError, setEvaluationsError] = useState<string | null>(null);

  // ========== FUNCIONES DE HABILIDADES ==========

  const refreshSkills = useCallback(async () => {
    try {
      setSkillsLoading(true);
      setSkillsError(null);

      console.log('🔄 Cargando datos de habilidades para empleado:', employeeId);
      if (!employeeId || typeof employeeId !== 'string' || employeeId.trim() === '') {
        throw new Error('Empleado inválido: falta employeeId');
      }

      const [skillsData] = await Promise.all([
        skillsService.getEmployeeSkills(employeeId)
      ]);

      setSkills(skillsData.skills || []);
      setSkillsSummary(skillsData.summary || null);

      console.log('✅ Datos de habilidades cargados:', {
        totalSkills: skillsData.skills?.length || 0,
        summary: skillsData.summary
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando habilidades';
      setSkillsError(errorMessage);
      console.error('❌ Error cargando habilidades:', err);
    } finally {
      setSkillsLoading(false);
    }
  }, [employeeId]);

  const createSkill = useCallback(async (skillData: CreateSkillRequest): Promise<Skill> => {
    try {
      setSkillsError(null);
      const result = await skillsService.createSkill(employeeId, skillData);

      setSkills(prev => [result, ...prev]);
      await refreshSkills();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando habilidad';
      setSkillsError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshSkills]);

  const updateSkill = useCallback(async (skillId: string, updateData: Partial<CreateSkillRequest>): Promise<Skill> => {
    try {
      setSkillsError(null);
      const result = await skillsService.updateSkill(employeeId, skillId, updateData);

      setSkills(prev => prev.map(skill => skill.id === skillId ? result : skill));
      await refreshSkills();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando habilidad';
      setSkillsError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshSkills]);

  const deleteSkill = useCallback(async (skillId: string): Promise<void> => {
    try {
      setSkillsError(null);
      await skillsService.deleteSkill(employeeId, skillId);

      setSkills(prev => prev.filter(skill => skill.id !== skillId));
      await refreshSkills();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando habilidad';
      setSkillsError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshSkills]);

  // ========== FUNCIONES DE CERTIFICACIONES ==========

  const refreshCertifications = useCallback(async () => {
    try {
      setCertificationsLoading(true);
      setCertificationsError(null);

      console.log('🔄 Cargando datos de certificaciones para empleado:', employeeId);
      if (!employeeId || typeof employeeId !== 'string' || employeeId.trim() === '') {
        throw new Error('Empleado inválido: falta employeeId');
      }

      const certificationsData = await skillsService.getEmployeeCertifications(employeeId);

      setCertifications(certificationsData.certifications || []);
      setCertificationsSummary(certificationsData.summary || null);

      console.log('✅ Datos de certificaciones cargados:', {
        totalCertifications: certificationsData.certifications?.length || 0,
        summary: certificationsData.summary
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando certificaciones';
      setCertificationsError(errorMessage);
      console.error('❌ Error cargando certificaciones:', err);
    } finally {
      setCertificationsLoading(false);
    }
  }, [employeeId]);

  const createCertification = useCallback(async (certificationData: CreateCertificationRequest): Promise<Certification> => {
    try {
      setCertificationsError(null);
      const result = await skillsService.createCertification(employeeId, certificationData);

      setCertifications(prev => [result, ...prev]);
      await refreshCertifications();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando certificación';
      setCertificationsError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshCertifications]);

  const updateCertification = useCallback(async (certificationId: string, updateData: Partial<CreateCertificationRequest>): Promise<Certification> => {
    try {
      setCertificationsError(null);
      const result = await skillsService.updateCertification(employeeId, certificationId, updateData);

      setCertifications(prev => prev.map(cert => cert.id === certificationId ? result : cert));
      await refreshCertifications();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando certificación';
      setCertificationsError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshCertifications]);

  const deleteCertification = useCallback(async (certificationId: string): Promise<void> => {
    try {
      setCertificationsError(null);
      await skillsService.deleteCertification(employeeId, certificationId);

      setCertifications(prev => prev.filter(cert => cert.id !== certificationId));
      await refreshCertifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando certificación';
      setCertificationsError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshCertifications]);

  // ========== FUNCIONES DE PLANES DE DESARROLLO ==========

  const refreshDevelopmentPlans = useCallback(async () => {
    try {
      setDevelopmentPlansLoading(true);
      setDevelopmentPlansError(null);

      console.log('🔄 Cargando datos de planes de desarrollo para empleado:', employeeId);
      if (!employeeId || typeof employeeId !== 'string' || employeeId.trim() === '') {
        throw new Error('Empleado inválido: falta employeeId');
      }

      const plansData = await skillsService.getEmployeeDevelopmentPlans(employeeId);

      setDevelopmentPlans(plansData.developmentPlans || []);
      setDevelopmentPlansSummary(plansData.summary || null);

      console.log('✅ Datos de planes de desarrollo cargados:', {
        totalPlans: plansData.developmentPlans?.length || 0,
        summary: plansData.summary
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando planes de desarrollo';
      setDevelopmentPlansError(errorMessage);
      console.error('❌ Error cargando planes de desarrollo:', err);
    } finally {
      setDevelopmentPlansLoading(false);
    }
  }, [employeeId]);

  const createDevelopmentPlan = useCallback(async (planData: CreateDevelopmentPlanRequest): Promise<DevelopmentPlan> => {
    try {
      setDevelopmentPlansError(null);
      const result = await skillsService.createDevelopmentPlan(employeeId, planData);

      setDevelopmentPlans(prev => [result, ...prev]);
      await refreshDevelopmentPlans();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando plan de desarrollo';
      setDevelopmentPlansError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshDevelopmentPlans]);

  const updateDevelopmentPlan = useCallback(async (planId: string, updateData: any): Promise<DevelopmentPlan> => {
    try {
      setDevelopmentPlansError(null);
      const result = await skillsService.updateDevelopmentPlan(employeeId, planId, updateData);

      setDevelopmentPlans(prev => prev.map(plan => plan.id === planId ? result : plan));
      await refreshDevelopmentPlans();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando plan de desarrollo';
      setDevelopmentPlansError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshDevelopmentPlans]);

  const deleteDevelopmentPlan = useCallback(async (planId: string): Promise<void> => {
    try {
      setDevelopmentPlansError(null);
      await skillsService.deleteDevelopmentPlan(employeeId, planId);

      setDevelopmentPlans(prev => prev.filter(plan => plan.id !== planId));
      await refreshDevelopmentPlans();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando plan de desarrollo';
      setDevelopmentPlansError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshDevelopmentPlans]);

  // ========== FUNCIONES DE EVALUACIONES ==========

  const refreshEvaluations = useCallback(async () => {
    try {
      setEvaluationsLoading(true);
      setEvaluationsError(null);

      console.log('🔄 Cargando datos de evaluaciones para empleado:', employeeId);
      if (!employeeId || typeof employeeId !== 'string' || employeeId.trim() === '') {
        throw new Error('Empleado inválido: falta employeeId');
      }

      const evaluationsData = await skillsService.getEmployeeSkillEvaluations(employeeId);

      setEvaluations(evaluationsData.evaluations || []);
      setEvaluationsSummary(evaluationsData.summary || null);

      console.log('✅ Datos de evaluaciones cargados:', {
        totalEvaluations: evaluationsData.evaluations?.length || 0,
        summary: evaluationsData.summary
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando evaluaciones';
      setEvaluationsError(errorMessage);
      console.error('❌ Error cargando evaluaciones:', err);
    } finally {
      setEvaluationsLoading(false);
    }
  }, [employeeId]);

  const createSkillEvaluation = useCallback(async (evaluationData: CreateSkillEvaluationRequest): Promise<SkillEvaluation> => {
    try {
      setEvaluationsError(null);
      const result = await skillsService.createSkillEvaluation(employeeId, evaluationData);

      setEvaluations(prev => [result, ...prev]);
      await refreshEvaluations();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando evaluación';
      setEvaluationsError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshEvaluations]);

  const updateSkillEvaluation = useCallback(async (evaluationId: string, updateData: any): Promise<SkillEvaluation> => {
    try {
      setEvaluationsError(null);
      const result = await skillsService.updateSkillEvaluation(employeeId, evaluationId, updateData);

      setEvaluations(prev => prev.map(evaluation => evaluation.id === evaluationId ? result : evaluation));
      await refreshEvaluations();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando evaluación';
      setEvaluationsError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshEvaluations]);

  const deleteSkillEvaluation = useCallback(async (evaluationId: string): Promise<void> => {
    try {
      setEvaluationsError(null);
      await skillsService.deleteSkillEvaluation(employeeId, evaluationId);

      setEvaluations(prev => prev.filter(evaluation => evaluation.id !== evaluationId));
      await refreshEvaluations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando evaluación';
      setEvaluationsError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshEvaluations]);

  // ========== FUNCIONES DE ARCHIVOS ==========

  const uploadSkillFiles = useCallback(async (files: File[], type: 'evidence' | 'certification' | 'evaluation'): Promise<string[]> => {
    try {
      return await skillsService.uploadSkillFiles(files, type);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error subiendo archivos';
      throw new Error(errorMessage);
    }
  }, []);

  // ========== FUNCIONES DE REPORTE ==========

  const exportSkillsData = useCallback(async (format: 'excel' | 'pdf' = 'excel'): Promise<Blob> => {
    try {
      return await skillsService.exportSkillsData(employeeId, format);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando datos';
      throw new Error(errorMessage);
    }
  }, [employeeId]);

  const generateSkillsReport = useCallback(async (reportType: 'summary' | 'detailed' | 'development' | 'certifications'): Promise<Blob> => {
    try {
      return await skillsService.generateSkillsReport(employeeId, reportType);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando reporte';
      throw new Error(errorMessage);
    }
  }, [employeeId]);

  // ========== REFRESH GENERAL ==========

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshSkills(),
      refreshCertifications(),
      refreshDevelopmentPlans(),
      refreshEvaluations()
    ]);
  }, [refreshSkills, refreshCertifications, refreshDevelopmentPlans, refreshEvaluations]);

  // ========== EFECTOS ==========

  // Cargar datos inicialmente
  useEffect(() => {
    if (employeeId && typeof employeeId === 'string' && employeeId.trim() !== '') {
      refreshAll();
    }
  }, [employeeId, refreshAll]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh de habilidades');
      refreshAll();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshAll]);

  return {
    // Estado de habilidades
    skills,
    skillsSummary,
    skillsLoading,
    skillsError,

    // Estado de certificaciones
    certifications,
    certificationsSummary,
    certificationsLoading,
    certificationsError,

    // Estado de planes de desarrollo
    developmentPlans,
    developmentPlansSummary,
    developmentPlansLoading,
    developmentPlansError,

    // Estado de evaluaciones
    evaluations,
    evaluationsSummary,
    evaluationsLoading,
    evaluationsError,

    // Funciones de habilidades
    createSkill,
    updateSkill,
    deleteSkill,
    uploadSkillFiles,

    // Funciones de certificaciones
    createCertification,
    updateCertification,
    deleteCertification,

    // Funciones de planes de desarrollo
    createDevelopmentPlan,
    updateDevelopmentPlan,
    deleteDevelopmentPlan,

    // Funciones de evaluaciones
    createSkillEvaluation,
    updateSkillEvaluation,
    deleteSkillEvaluation,

    // Funciones de reporte
    exportSkillsData,
    generateSkillsReport,

    // Funciones de refresh
    refreshSkills,
    refreshCertifications,
    refreshDevelopmentPlans,
    refreshEvaluations,
    refreshAll
  };
};

export default useSkills;
