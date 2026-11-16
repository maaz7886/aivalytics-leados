// src/components/ui/StatTile.tsx
import React from 'react';

interface StatTileProps {
  label: string;
  value: string | number;
  subtext?: string;
  isAttention?: boolean;
  onClick?: () => void;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  subtext,
  isAttention = false,
  onClick,
  className = ''
}) => {
  const isRed = isAttention && (typeof value === 'number' ? value > 0 : true);

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#E6E6E3] rounded-[8px] p-3 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-[#F7F7F5]' : ''
      } ${className}`}
    >
      <div className="text-xs text-[#6B6B66] font-medium leading-none mb-1.5 truncate">
        {label}
      </div>
      <div
        className={`text-xl font-semibold tabular-nums leading-tight ${
          isRed ? 'text-[#B42318]' : 'text-[#1F1F1D]'
        }`}
      >
        {value}
      </div>
      {subtext && (
        <div className="text-[11px] text-[#6B6B66] mt-1 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
