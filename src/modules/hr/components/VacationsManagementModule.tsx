import React from 'react';
import VacationsManagementView from './vacations/VacationsManagementView';

// ============================================================================
// MAIN VACATIONS MANAGEMENT MODULE
// ============================================================================

interface VacationsManagementModuleProps {
  onBack?: () => void;
}

const VacationsManagementModule: React.FC<VacationsManagementModuleProps> = ({ onBack }) => {
  return (
    <div className="w-full">
      <VacationsManagementView onBack={onBack} />
    </div>
  );
};

export default VacationsManagementModule;
