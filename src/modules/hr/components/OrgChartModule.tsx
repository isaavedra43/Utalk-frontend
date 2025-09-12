import React, { useState, useEffect } from 'react';
import { Users, Building, ChevronDown, ChevronRight, Mail, Phone, Award } from 'lucide-react';
import { OrgChartNode, OrgChartResponse } from '../../../types/employee';
import employeeService from '../../../services/employeeService';
import { useHRPermissions } from '../../../hooks/useHRPermissions';

interface OrgChartModuleProps {
  onEmployeeSelect?: (employeeId: string) => void;
}

export const OrgChartModule: React.FC<OrgChartModuleProps> = ({ onEmployeeSelect }) => {
  const [orgChart, setOrgChart] = useState<OrgChartNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [departments, setDepartments] = useState<string[]>([]);
  
  const { hasPermission, isHRAdmin, isHRManager } = useHRPermissions();

  useEffect(() => {
    if (hasPermission('canRead')) {
      loadOrgChart();
      loadDepartments();
    }
  }, [hasPermission, selectedDepartment]);

  const loadOrgChart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const department = selectedDepartment === 'all' ? undefined : selectedDepartment;
      const response = await employeeService.getOrgChart(department);
      
      if (response.success && response.data) {
        setOrgChart(response.data.orgChart);
        
        // Auto-expandir nodos raíz
        const rootNodeIds = response.data.orgChart.map(node => node.id);
        setExpandedNodes(new Set(rootNodeIds));
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar organigrama');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await employeeService.getStats();
      
      if (response.success && response.data) {
        const deptNames = Object.keys(response.data.byDepartment);
        setDepartments(deptNames);
      }
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleEmployeeClick = (nodeId: string) => {
    if (onEmployeeSelect) {
      onEmployeeSelect(nodeId);
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'Manager': 'bg-red-100 text-red-800 border-red-200',
      'Lead': 'bg-orange-100 text-orange-800 border-orange-200',
      'Senior': 'bg-purple-100 text-purple-800 border-purple-200',
      'Mid': 'bg-blue-100 text-blue-800 border-blue-200',
      'Junior': 'bg-green-100 text-green-800 border-green-200'
    };
    
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const renderNode = (node: OrgChartNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 24;

    return (
      <div key={node.id} className="org-node">
        <div 
          className={`org-node-content ${hasChildren ? 'cursor-pointer' : ''}`}
          style={{ marginLeft: `${indent}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button className="flex-shrink-0 p-1 hover:bg-gray-100 rounded">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
            
            {!hasChildren && <div className="w-6"></div>}

            {/* Avatar */}
            <div className="flex-shrink-0">
              {node.avatar ? (
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src={node.avatar}
                  alt={node.name}
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Employee Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-semibold text-gray-900 truncate">
                  {node.name}
                </h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(node.level)}`}>
                  {node.level}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 truncate">{node.position}</p>
              
              <div className="flex items-center gap-4 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getDepartmentColor(node.department)}`}>
                  {node.department}
                </span>
                
                {hasChildren && (
                  <span className="text-xs text-gray-500">
                    {node.children.length} subordinado{node.children.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmployeeClick(node.id);
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Ver Detalles
              </button>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="org-children mt-2">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!hasPermission('canRead')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes permisos para ver el organigrama</p>
        </div>
      </div>
    );
  }

  return (
    <div className="org-chart-module">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organigrama</h2>
          <p className="text-gray-600">Estructura organizacional de la empresa</p>
        </div>
        
        {(isHRAdmin || isHRManager) && (
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-gray-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los departamentos</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando organigrama...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Org Chart */}
      {!loading && orgChart.length > 0 && (
        <div className="org-chart-container">
          <div className="space-y-4">
            {orgChart.map(node => renderNode(node))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && orgChart.length === 0 && !error && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay datos de organigrama disponibles</p>
          {selectedDepartment !== 'all' && (
            <button
              onClick={() => setSelectedDepartment('all')}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Ver todos los departamentos
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Leyenda de Niveles</h4>
        <div className="flex flex-wrap gap-3">
          {['Manager', 'Lead', 'Senior', 'Mid', 'Junior'].map(level => (
            <span 
              key={level}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(level)}`}
            >
              {level}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
