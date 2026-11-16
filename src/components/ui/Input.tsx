// src/components/ui/Input.tsx
import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className = '', ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center w-full">
        {icon && (
          <span className="absolute left-2.5 text-[#6B6B66] pointer-events-none shrink-0 flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full h-8 ${
            icon ? 'pl-8' : 'pl-2.5'
          } pr-2.5 bg-white border border-[#E6E6E3] rounded-[6px] text-[13px] text-[#1F1F1D] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B4BDB] focus:border-[#3B4BDB] transition-all disabled:bg-[#F7F7F5] disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
