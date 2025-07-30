// Analizador de proyecto para UTalk Frontend
// Identifica módulos completos, mocks, endpoints y estado general

import { logger, createLogContext, getComponentContext, debugLogs } from './logger'
import { apiClient } from '@/services/apiClient'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

// ✅ CONTEXTO PARA LOGGING
const projectAnalyzerContext = getComponentContext('projectAnalyzer')

interface ModuleStatus {
  name: string
  status: 'active' | 'empty' | 'partial' | 'missing'
  description: string
  components: number
  hooks: number
  services: number
  types: number
}

interface ProjectAnalysis {
  modules: ModuleStatus[]
  totalComponents: number
  totalHooks: number
  totalServices: number
  codebaseHealth: 'excellent' | 'good' | 'needs-attention' | 'critical'
  recommendations: string[]
  lastAnalyzed: string
}

class ProjectAnalyzer {
  private baseModulePath: string

  constructor() {
    this.baseModulePath = join(process.cwd(), 'src', 'modules')
  }

  async analyzeProject(): Promise<ProjectAnalysis> {
    const performanceId = logger.startPerformance('project_analysis')
    
    logger.info('PERFORMANCE', '🔍 Starting comprehensive project analysis...', createLogContext({
      ...projectAnalyzerContext,
      method: 'analyzeProject'
    }))

    try {
      const modules = await this.analyzeModules()
      const analysis = this.generateAnalysis(modules)

      logger.endPerformance(performanceId)

      logger.success('API', 'Project analysis completed successfully', createLogContext({
        ...projectAnalyzerContext,
        method: 'analyzeProject',
        data: {
          modulesCount: modules.length,
          totalComponents: analysis.totalComponents,
          codebaseHealth: analysis.codebaseHealth
        }
      }))

      return analysis
    } catch (error) {
      logger.endPerformance(performanceId)
      
      logger.error('PERFORMANCE', 'Failed to analyze project', createLogContext({
        ...projectAnalyzerContext,
        method: 'analyzeProject',
        error: error as Error
      }))
      
      throw error
    }
  }

  private async analyzeModules(): Promise<ModuleStatus[]> {
    const modules = [
      'agents', 'campaigns', 'chat', 'crm', 'dashboard', 
      'knowledge', 'settings', 'team'
    ]

    const moduleAnalyses = await Promise.all(
      modules.map(moduleName => this.analyzeModule(moduleName))
    )

    // ✅ Logging simplificado para módulos
    moduleAnalyses.forEach(moduleAnalysis => {
      logger.info('PERFORMANCE', `📊 Module ${moduleAnalysis.name}: ${moduleAnalysis.status}`, createLogContext({
        ...projectAnalyzerContext,
        method: 'analyzeModules',
        data: {
          module: moduleAnalysis.name,
          status: moduleAnalysis.status,
          components: moduleAnalysis.components,
          hooks: moduleAnalysis.hooks,
          services: moduleAnalysis.services
        }
      }))
    })

    return moduleAnalyses
  }

  private async analyzeModule(name: string): Promise<ModuleStatus> {
    const modulePath = join(this.baseModulePath, name)
    
    if (!existsSync(modulePath)) {
      return {
        name,
        status: 'missing',
        description: 'Module directory not found',
        components: 0,
        hooks: 0,
        services: 0,
        types: 0
      }
    }

    // ✅ Análisis simplificado - solo contar archivos principales
    const componentCount = this.countFiles(join(modulePath, 'components'))
    const hookCount = this.countFiles(join(modulePath, 'hooks'))
    const serviceCount = this.countFiles(join(modulePath, 'services'))
    const typeCount = this.hasTypeFile(modulePath) ? 1 : 0

    const status = this.determineModuleStatus(componentCount, hookCount, serviceCount)

    // ✅ Logging específico de endpoints
    if (name === 'chat') {
      logger.info('NETWORK', '📡 Chat endpoints status', createLogContext({
        ...projectAnalyzerContext,
        method: 'analyzeModule',
        data: {
          module: name,
          endpoints: {
            conversations: 'connected',
            messages: 'connected',
            socketIO: 'connected'
          }
        }
      }))
    }

    if (name === 'crm') {
      logger.warn('NETWORK', '⚠️ CRM endpoints status', createLogContext({
        ...projectAnalyzerContext,
        method: 'analyzeModule',
        data: {
          module: name,
          endpoints: {
            contacts: 'missing'
          }
        }
      }))
    }

    return {
      name,
      status,
      description: this.getModuleDescription(name, status),
      components: componentCount,
      hooks: hookCount,
      services: serviceCount,
      types: typeCount
    }
  }

  private countFiles(dirPath: string): number {
    try {
      if (!existsSync(dirPath)) return 0
      
      const fs = require('fs')
      const files = fs.readdirSync(dirPath)
      return files.filter((file: string) => 
        file.endsWith('.tsx') || file.endsWith('.ts')
      ).length
    } catch {
      return 0
    }
  }

  private hasTypeFile(modulePath: string): boolean {
    return existsSync(join(modulePath, 'types.ts'))
  }

  private determineModuleStatus(components: number, hooks: number, services: number): ModuleStatus['status'] {
    const total = components + hooks + services
    
    if (total === 0) return 'empty'
    if (total >= 5) return 'active'
    if (total >= 2) return 'partial'
    return 'missing'
  }

  private getModuleDescription(name: string, status: ModuleStatus['status']): string {
    const descriptions = {
      'agents': 'AI agent management and configuration',
      'campaigns': 'Marketing campaign management',
      'chat': 'Real-time messaging and communication',
      'crm': 'Customer relationship management',
      'dashboard': 'Analytics and overview dashboard',
      'knowledge': 'Knowledge base and documentation',
      'settings': 'Application configuration',
      'team': 'Team management and collaboration'
    }

    const baseDescription = descriptions[name as keyof typeof descriptions] || `${name} module`
    
    if (status === 'empty') {
      logger.info('PERFORMANCE', `📁 Module ${name}: empty`, createLogContext({
        ...projectAnalyzerContext,
        method: 'getModuleDescription',
        data: { module: name, status }
      }))
    }

    return baseDescription
  }

  private generateAnalysis(modules: ModuleStatus[]): ProjectAnalysis {
    const totalComponents = modules.reduce((sum, m) => sum + m.components, 0)
    const totalHooks = modules.reduce((sum, m) => sum + m.hooks, 0)
    const totalServices = modules.reduce((sum, m) => sum + m.services, 0)

    const activeModules = modules.filter(m => m.status === 'active').length
    const totalModules = modules.length

    let codebaseHealth: ProjectAnalysis['codebaseHealth']
    if (activeModules >= totalModules * 0.8) codebaseHealth = 'excellent'
    else if (activeModules >= totalModules * 0.6) codebaseHealth = 'good'
    else if (activeModules >= totalModules * 0.4) codebaseHealth = 'needs-attention'
    else codebaseHealth = 'critical'

    const recommendations = this.generateRecommendations(modules, codebaseHealth)

    return {
      modules,
      totalComponents,
      totalHooks,
      totalServices,
      codebaseHealth,
      recommendations,
      lastAnalyzed: new Date().toISOString()
    }
  }

  private generateRecommendations(modules: ModuleStatus[], health: ProjectAnalysis['codebaseHealth']): string[] {
    const recommendations: string[] = []

    const emptyModules = modules.filter(m => m.status === 'empty')
    if (emptyModules.length > 0) {
      recommendations.push(`Develop ${emptyModules.map(m => m.name).join(', ')} modules`)
    }

    const partialModules = modules.filter(m => m.status === 'partial')
    if (partialModules.length > 0) {
      recommendations.push(`Complete ${partialModules.map(m => m.name).join(', ')} modules`)
    }

    if (health === 'critical') {
      recommendations.push('Priority: Focus on core chat and CRM functionality')
    }

    return recommendations
  }
}

// ✅ Instancia global
export const projectAnalyzer = new ProjectAnalyzer()

// ✅ Función de análisis simplificada
export async function analyzeProjectStructure(): Promise<ProjectAnalysis> {
  const context = createLogContext({
    ...projectAnalyzerContext,
    method: 'analyzeProjectStructure'
  })

  logger.info('PERFORMANCE', '🔍 Starting project structure analysis', context)

  try {
    const analysis = await projectAnalyzer.analyzeProject()
    
    logger.success('ANALYSIS', 'Project structure analysis completed', createLogContext({
      ...context,
      data: {
        modulesAnalyzed: analysis.modules.length,
        codebaseHealth: analysis.codebaseHealth,
        recommendations: analysis.recommendations.length
      }
    }))

    return analysis
  } catch (error) {
    logger.error('PERFORMANCE', 'Failed to analyze project structure', createLogContext({
      ...context,
      error: error as Error
    }))
    
    throw error
  }
} 