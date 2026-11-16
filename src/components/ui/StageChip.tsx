// src/components/ui/StageChip.tsx
import React from 'react';
import { stageChips } from '../../styles/theme';

interface StageChipProps {
  stage: string;
  className?: string;
  onClick?: () => void;
}

export const StageChip: React.FC<StageChipProps> = ({ stage, className = '', onClick }) => {
  const normalizedStage = (stage || 'New') as keyof typeof stageChips;
  const config = stageChips[normalizedStage] || { bg: '#EEEEEC', text: '#3D3D3A' };

  return (
    <span
      onClick={onClick}
      style={{ backgroundColor: config.bg, color: config.text }}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium leading-none whitespace-nowrap select-none ${
        onClick ? 'cursor-pointer hover:opacity-85' : ''
      } ${className}`}
    >
      {stage || 'New'}
    </span>
  );
};
