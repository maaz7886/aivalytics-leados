// src/components/ui/Avatar.tsx
import React from 'react';
import { getRepColor, getInitials } from '../../styles/theme';

interface AvatarProps {
  name?: string;
  size?: number; // default 24
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name = 'Unassigned', size = 24, className = '' }) => {
  const isUnassigned = !name || name === 'Unassigned' || name.trim() === '';
  const initials = getInitials(name);
  const bgColor = getRepColor(name);

  if (isUnassigned) {
    return (
      <span
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`inline-flex items-center justify-center rounded-full border border-dashed border-[#A0A09B] text-[#6B6B66] text-[10px] font-medium bg-[#F7F7F5] select-none shrink-0 ${className}`}
        title="Unassigned"
      >
        —
      </span>
    );
  }

  return (
    <span
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor
      }}
      className={`inline-flex items-center justify-center rounded-full text-white text-[11px] font-semibold leading-none select-none shrink-0 shadow-2xs ${className}`}
      title={name}
    >
      {initials}
    </span>
  );
};
