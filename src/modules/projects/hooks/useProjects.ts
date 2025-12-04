// Hook principal de proyectos

import { useState, useEffect, useCallback } from 'react';
import { projectsService } from '../services/projectsService';
import type { 
  Project, 
  ProjectFilters, 
  ProjectListResponse,
  ProjectStats 
} from '../types';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  });

  // Cargar proyectos
  const loadProjects = useCallback(async (params?: {
    page?: number;
    limit?: number;
    filters?: ProjectFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: ProjectListResponse = await projectsService.getProjects(params);
      
      setProjects(response.projects);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        hasMore: response.hasMore,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar proyectos';
      setError(errorMessage);
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar proyecto específico
  const loadProject = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const project = await projectsService.getProjectById(id);
      setSelectedProject(project);
      
      return project;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar proyecto';
      setError(errorMessage);
      console.error('Error loading project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear proyecto
  const createProject = useCallback(async (projectData: Partial<Project>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newProject = await projectsService.createProject(projectData);
      
      // Actualizar lista
      setProjects(prev => [newProject, ...prev]);
      
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear proyecto';
      setError(errorMessage);
      console.error('Error creating project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar proyecto
  const updateProject = useCallback(async (
    id: string, 
    updates: Partial<Project>
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedProject = await projectsService.updateProject(id, updates);
      
      // Actualizar en lista
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      
      // Actualizar seleccionado si aplica
      if (selectedProject?.id === id) {
        setSelectedProject(updatedProject);
      }
      
      return updatedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar proyecto';
      setError(errorMessage);
      console.error('Error updating project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  // Eliminar proyecto
  const deleteProject = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await projectsService.deleteProject(id);
      
      // Remover de lista
      setProjects(prev => prev.filter(p => p.id !== id));
      
      // Limpiar seleccionado si aplica
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar proyecto';
      setError(errorMessage);
      console.error('Error deleting project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  // Duplicar proyecto
  const duplicateProject = useCallback(async (
    id: string,
    options?: any
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const duplicated = await projectsService.duplicateProject(id, options);
      
      // Agregar a lista
      setProjects(prev => [duplicated, ...prev]);
      
      return duplicated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al duplicar proyecto';
      setError(errorMessage);
      console.error('Error duplicating project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Archivar proyecto
  const archiveProject = useCallback(async (
    id: string,
    archive: boolean = true,
    reason?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const updated = await projectsService.archiveProject(id, archive, reason);
      
      // Actualizar en lista
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
      
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al archivar proyecto';
      setError(errorMessage);
      console.error('Error archiving project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle favorito
  const toggleFavorite = useCallback(async (
    id: string,
    favorite: boolean
  ) => {
    try {
      const updated = await projectsService.toggleFavorite(id, favorite);
      
      // Actualizar en lista
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
      
      if (selectedProject?.id === id) {
        setSelectedProject(updated);
      }
      
      return updated;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  }, [selectedProject]);

  // Crear desde plantilla
  const createFromTemplate = useCallback(async (
    templateId: string,
    customization?: any
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const newProject = await projectsService.createFromTemplate(templateId, customization);
      
      // Agregar a lista
      setProjects(prev => [newProject, ...prev]);
      
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear desde plantilla';
      setError(errorMessage);
      console.error('Error creating from template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Estado
    projects,
    selectedProject,
    loading,
    error,
    pagination,
    
    // Acciones
    loadProjects,
    loadProject,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    archiveProject,
    toggleFavorite,
    createFromTemplate,
    setSelectedProject,
  };
};

