// src/components/ui/TempTag.tsx
import React from 'react';
import { temperatureTokens } from '../../styles/theme';

interface TempTagProps {
  temperature?: 'Hot' | 'Warm' | 'Cold' | string;
  className?: string;
}

export const TempTag: React.FC<TempTagProps> = ({ temperature = 'Warm', className = '' }) => {
  const norm = (temperature === 'Hot' || temperature === 'Cold' || temperature === 'Warm'
    ? temperature
    : 'Warm') as keyof typeof temperatureTokens;
  const config = temperatureTokens[norm];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-[#1F1F1D] ${className}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: config.dot }}
      />
      {norm}
    </span>
  );
};
