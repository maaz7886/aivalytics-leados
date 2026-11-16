// src/components/ui/Button.tsx
import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, children, className = '', disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#3B4BDB] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-[#3B4BDB] hover:bg-[#2F3CB8] text-white border border-transparent shadow-xs',
      secondary: 'bg-white hover:bg-[#F3F4F6] text-[#1F1F1D] border border-[#E6E6E3] shadow-xs',
      ghost: 'bg-transparent hover:bg-[#F3F4F6] text-[#1F1F1D]',
      danger: 'bg-[#FEE4E2] hover:bg-[#FECDCA] text-[#B42318] border border-[#FDA29B]'
    }[variant];

    const sizeStyles = {
      sm: 'h-7 px-2.5 text-xs gap-1.5',
      md: 'h-8 px-3 text-[13px] gap-1.5',
      lg: 'h-10 px-4 text-sm gap-2'
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
