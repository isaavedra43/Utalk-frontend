// Calculador de dependencias y ruta crítica

import type { Task, TaskDependency } from '../types';

export class DependencyCalculator {
  /**
   * Calcular ruta crítica usando algoritmo CPM (Critical Path Method)
   */
  static calculateCriticalPath(tasks: Task[], dependencies: TaskDependency[]): {
    criticalPath: string[];
    criticalDuration: number;
    slackByTask: { [taskId: string]: number };
  } {
    // Paso 1: Forward pass - calcular earliest start/finish
    const earlyTimes = this.forwardPass(tasks, dependencies);
    
    // Paso 2: Backward pass - calcular latest start/finish
    const lateTimes = this.backwardPass(tasks, dependencies, earlyTimes);
    
    // Paso 3: Calcular slack (holgura) por tarea
    const slackByTask: { [taskId: string]: number } = {};
    tasks.forEach(task => {
      const early = earlyTimes[task.id];
      const late = lateTimes[task.id];
      
      if (early && late) {
        slackByTask[task.id] = late.latestFinish - early.earliestFinish;
      }
    });
    
    // Paso 4: Identificar ruta crítica (tareas con slack = 0)
    const criticalPath = tasks
      .filter(task => slackByTask[task.id] === 0)
      .map(task => task.id);
    
    // Duración total de la ruta crítica
    const criticalDuration = tasks.length > 0
      ? Math.max(...tasks.map(t => earlyTimes[t.id]?.earliestFinish || 0))
      : 0;

    return {
      criticalPath,
      criticalDuration,
      slackByTask,
    };
  }

  /**
   * Forward pass - calcular earliest start y finish
   */
  private static forwardPass(
    tasks: Task[],
    dependencies: TaskDependency[]
  ): { [taskId: string]: { earliestStart: number; earliestFinish: number } } {
    const result: { [taskId: string]: { earliestStart: number; earliestFinish: number } } = {};
    
    // Crear mapa de dependencias
    const depMap: { [taskId: string]: TaskDependency[] } = {};
    dependencies.forEach(dep => {
      if (!depMap[dep.successorId]) {
        depMap[dep.successorId] = [];
      }
      depMap[dep.successorId].push(dep);
    });
    
    // Ordenar tareas topológicamente
    const sorted = this.topologicalSort(tasks, dependencies);
    
    sorted.forEach(task => {
      const taskDeps = depMap[task.id] || [];
      
      if (taskDeps.length === 0) {
        // Sin predecesores, empieza en 0
        result[task.id] = {
          earliestStart: 0,
          earliestFinish: task.duration || 0,
        };
      } else {
        // Calcular earliest start basado en predecesores
        let maxPredecessorFinish = 0;
        
        taskDeps.forEach(dep => {
          const predecessor = result[dep.predecessorId];
          if (predecessor) {
            let predecessorEnd = 0;
            
            switch (dep.type) {
              case 'finish_to_start':
                predecessorEnd = predecessor.earliestFinish + (dep.lag || 0);
                break;
              case 'start_to_start':
                predecessorEnd = predecessor.earliestStart + (dep.lag || 0);
                break;
              case 'finish_to_finish':
                predecessorEnd = predecessor.earliestFinish + (dep.lag || 0) - (task.duration || 0);
                break;
              case 'start_to_finish':
                predecessorEnd = predecessor.earliestStart + (dep.lag || 0) - (task.duration || 0);
                break;
            }
            
            maxPredecessorFinish = Math.max(maxPredecessorFinish, predecessorEnd);
          }
        });
        
        result[task.id] = {
          earliestStart: maxPredecessorFinish,
          earliestFinish: maxPredecessorFinish + (task.duration || 0),
        };
      }
    });
    
    return result;
  }

  /**
   * Backward pass - calcular latest start y finish
   */
  private static backwardPass(
    tasks: Task[],
    dependencies: TaskDependency[],
    earlyTimes: { [taskId: string]: { earliestStart: number; earliestFinish: number } }
  ): { [taskId: string]: { latestStart: number; latestFinish: number } } {
    const result: { [taskId: string]: { latestStart: number; latestFinish: number } } = {};
    
    // Encontrar duración máxima del proyecto
    const projectDuration = Math.max(...tasks.map(t => earlyTimes[t.id]?.earliestFinish || 0));
    
    // Crear mapa inverso de dependencias
    const succMap: { [taskId: string]: TaskDependency[] } = {};
    dependencies.forEach(dep => {
      if (!succMap[dep.predecessorId]) {
        succMap[dep.predecessorId] = [];
      }
      succMap[dep.predecessorId].push(dep);
    });
    
    // Ordenar tareas en reversa
    const sorted = this.topologicalSort(tasks, dependencies).reverse();
    
    sorted.forEach(task => {
      const taskSuccs = succMap[task.id] || [];
      
      if (taskSuccs.length === 0) {
        // Sin sucesores, termina en la duración máxima del proyecto
        result[task.id] = {
          latestFinish: projectDuration,
          latestStart: projectDuration - (task.duration || 0),
        };
      } else {
        // Calcular latest finish basado en sucesores
        let minSuccessorStart = projectDuration;
        
        taskSuccs.forEach(dep => {
          const successor = result[dep.successorId];
          if (successor) {
            let successorStart = successor.latestStart;
            
            switch (dep.type) {
              case 'finish_to_start':
                successorStart = successor.latestStart - (dep.lag || 0);
                break;
              case 'start_to_start':
                successorStart = successor.latestStart - (dep.lag || 0);
                break;
              case 'finish_to_finish':
                successorStart = successor.latestFinish - (dep.lag || 0);
                break;
              case 'start_to_finish':
                successorStart = successor.latestFinish - (dep.lag || 0);
                break;
            }
            
            minSuccessorStart = Math.min(minSuccessorStart, successorStart);
          }
        });
        
        result[task.id] = {
          latestFinish: minSuccessorStart,
          latestStart: minSuccessorStart - (task.duration || 0),
        };
      }
    });
    
    return result;
  }

  /**
   * Ordenamiento topológico de tareas
   */
  private static topologicalSort(tasks: Task[], dependencies: TaskDependency[]): Task[] {
    const sorted: Task[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    // Crear mapa de adyacencia
    const adjList: { [taskId: string]: string[] } = {};
    tasks.forEach(task => {
      adjList[task.id] = [];
    });
    
    dependencies.forEach(dep => {
      if (adjList[dep.predecessorId]) {
        adjList[dep.predecessorId].push(dep.successorId);
      }
    });
    
    // DFS para ordenamiento topológico
    const dfs = (taskId: string) => {
      if (visited.has(taskId)) return;
      
      if (visiting.has(taskId)) {
        console.warn('Dependencia circular detectada en tarea:', taskId);
        return;
      }
      
      visiting.add(taskId);
      
      const successors = adjList[taskId] || [];
      successors.forEach(succId => dfs(succId));
      
      visiting.delete(taskId);
      visited.add(taskId);
      
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        sorted.unshift(task);
      }
    };
    
    tasks.forEach(task => {
      if (!visited.has(task.id)) {
        dfs(task.id);
      }
    });
    
    return sorted;
  }

  /**
   * Detectar dependencias circulares
   */
  static hasCircularDependency(tasks: Task[], dependencies: TaskDependency[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    // Crear mapa de adyacencia
    const adjList: { [taskId: string]: string[] } = {};
    tasks.forEach(task => {
      adjList[task.id] = [];
    });
    
    dependencies.forEach(dep => {
      if (adjList[dep.predecessorId]) {
        adjList[dep.predecessorId].push(dep.successorId);
      }
    });
    
    // DFS para detectar ciclos
    const hasCycle = (taskId: string): boolean => {
      visited.add(taskId);
      recursionStack.add(taskId);
      
      const successors = adjList[taskId] || [];
      for (const succId of successors) {
        if (!visited.has(succId)) {
          if (hasCycle(succId)) {
            return true;
          }
        } else if (recursionStack.has(succId)) {
          return true;
        }
      }
      
      recursionStack.delete(taskId);
      return false;
    };
    
    for (const task of tasks) {
      if (!visited.has(task.id)) {
        if (hasCycle(task.id)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Validar que una nueva dependencia no cree ciclo
   */
  static wouldCreateCycle(
    tasks: Task[],
    existingDeps: TaskDependency[],
    newDep: { predecessorId: string; successorId: string }
  ): boolean {
    const testDeps = [...existingDeps, {
      id: 'test',
      predecessorId: newDep.predecessorId,
      successorId: newDep.successorId,
      type: 'finish_to_start' as const,
      lag: 0,
      createdAt: new Date(),
      createdBy: '',
    }];
    
    return this.hasCircularDependency(tasks, testDeps);
  }

  /**
   * Calcular fechas de tareas basadas en dependencias
   */
  static calculateTaskDates(
    task: Task,
    tasks: Task[],
    dependencies: TaskDependency[],
    projectStartDate: Date
  ): {
    startDate: Date;
    endDate: Date;
  } {
    // Obtener dependencias de esta tarea
    const taskDeps = dependencies.filter(dep => dep.successorId === task.id);
    
    if (taskDeps.length === 0) {
      // Sin dependencias, usar fecha de inicio del proyecto
      const startDate = projectStartDate;
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (task.duration || 0));
      
      return { startDate, endDate };
    }
    
    // Calcular basado en predecesores
    let maxPredecessorEnd = projectStartDate;
    
    taskDeps.forEach(dep => {
      const predecessor = tasks.find(t => t.id === dep.predecessorId);
      if (predecessor) {
        let predecessorDate = new Date(predecessor.dueDate);
        
        // Aplicar lag
        if (dep.lag) {
          predecessorDate.setDate(predecessorDate.getDate() + dep.lag);
        }
        
        if (predecessorDate > maxPredecessorEnd) {
          maxPredecessorEnd = predecessorDate;
        }
      }
    });
    
    const startDate = maxPredecessorEnd;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (task.duration || 0));
    
    return { startDate, endDate };
  }

  /**
   * Obtener todas las tareas que dependen de una tarea dada
   */
  static getDependentTasks(
    taskId: string,
    dependencies: TaskDependency[]
  ): string[] {
    const directDependents = dependencies
      .filter(dep => dep.predecessorId === taskId)
      .map(dep => dep.successorId);
    
    // Recursivamente obtener dependientes de dependientes
    const allDependents = new Set<string>(directDependents);
    
    directDependents.forEach(depId => {
      const subDependents = this.getDependentTasks(depId, dependencies);
      subDependents.forEach(id => allDependents.add(id));
    });
    
    return Array.from(allDependents);
  }

  /**
   * Validar fechas de tareas con dependencias
   */
  static validateTaskDates(
    task: Task,
    tasks: Task[],
    dependencies: TaskDependency[]
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Validar que start date < due date
    if (new Date(task.startDate) >= new Date(task.dueDate)) {
      errors.push('La fecha de inicio debe ser anterior a la fecha de finalización');
    }
    
    // Validar predecesores
    const taskDeps = dependencies.filter(dep => dep.successorId === task.id);
    
    taskDeps.forEach(dep => {
      const predecessor = tasks.find(t => t.id === dep.predecessorId);
      if (!predecessor) {
        errors.push(`Tarea predecesora no encontrada: ${dep.predecessorId}`);
        return;
      }
      
      const taskStart = new Date(task.startDate);
      const predEnd = new Date(predecessor.dueDate);
      
      if (dep.type === 'finish_to_start' && taskStart < predEnd) {
        errors.push(`La tarea no puede iniciar antes de que termine "${predecessor.name}"`);
      }
      
      if (dep.type === 'start_to_start') {
        const predStart = new Date(predecessor.startDate);
        if (taskStart < predStart) {
          errors.push(`La tarea debe iniciar al mismo tiempo o después de "${predecessor.name}"`);
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sugerir optimización del cronograma
   */
  static suggestOptimizations(
    tasks: Task[],
    dependencies: TaskDependency[]
  ): {
    type: string;
    description: string;
    impact: string;
    tasks: string[];
  }[] {
    const suggestions: any[] = [];
    
    // Detectar tareas que se pueden paralelizar
    const criticalPathResult = this.calculateCriticalPath(tasks, dependencies);
    const nonCriticalTasks = tasks.filter(
      t => !criticalPathResult.criticalPath.includes(t.id)
    );
    
    if (nonCriticalTasks.length > 0) {
      suggestions.push({
        type: 'parallelize',
        description: 'Hay tareas que se pueden ejecutar en paralelo',
        impact: 'Reducción potencial de tiempo',
        tasks: nonCriticalTasks.map(t => t.id),
      });
    }
    
    // Detectar tareas con mucho slack
    Object.entries(criticalPathResult.slackByTask).forEach(([taskId, slack]) => {
      if (slack > 5) { // Más de 5 días de holgura
        suggestions.push({
          type: 'reallocation',
          description: 'Tarea con holgura alta, se pueden reasignar recursos',
          impact: 'Optimización de recursos',
          tasks: [taskId],
        });
      }
    });
    
    return suggestions;
  }
}

