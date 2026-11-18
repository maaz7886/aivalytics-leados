// src/components/EmptyState.tsx
import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';

interface Props {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<Props> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`py-6 px-4 text-center flex flex-col items-center justify-center rounded-[8px] bg-[#FAFAF9] border border-[#E6E6E3] ${className}`}>
      <div className="w-8 h-8 rounded-full bg-[#DDF4E4] border border-[#C3ECD0] text-[#17673A] flex items-center justify-center mb-2 shadow-xs">
        <Icon className="w-4 h-4 text-[#17673A]" />
      </div>
      <h3 className="text-[13px] font-semibold text-[#1F1F1D] tracking-tight">
        {title}
      </h3>
      <p className="text-[12px] text-[#6B6B66] max-w-md mt-0.5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 px-3 py-1.5 bg-[#3B4BDB] hover:bg-[#2F3CB8] text-white rounded-[6px] text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
