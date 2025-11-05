// Lista de miembros del equipo

import React from 'react';
import type { TeamMember } from '../../types';
import { User, Mail, Phone, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface TeamMembersProps {
  members: TeamMember[];
  onMemberClick?: (member: TeamMember) => void;
}

export const TeamMembers: React.FC<TeamMembersProps> = ({
  members,
  onMemberClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUtilizationColor = (allocation: number) => {
    if (allocation >= 90) return 'text-red-600';
    if (allocation >= 75) return 'text-orange-600';
    if (allocation >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">No hay miembros en el equipo</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Agregar Primer Miembro
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Equipo del Proyecto</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{members.length} miembros</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {members.map((member) => (
          <div
            key={member.id}
            onClick={() => onMemberClick?.(member)}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {member.firstName} {member.lastName}
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {member.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0 text-right">
                <div className="mb-2">
                  <p className={`text-lg font-bold ${getUtilizationColor(member.allocation)}`}>
                    {member.allocation}%
                  </p>
                  <p className="text-xs text-gray-500">Asignación</p>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{member.hoursWorked}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{member.tasksCompleted}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {member.skills && member.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {member.skills.slice(0, 5).map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {member.skills.length > 5 && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    +{member.skills.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

