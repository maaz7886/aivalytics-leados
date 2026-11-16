// src/components/SkeletonLoader.tsx
import React from 'react';

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 animate-pulse space-y-3 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/6"></div>
    </div>
    <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3"></div>
  </div>
);

export const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse border-b border-gray-100 dark:border-gray-800">
    <td className="py-3 px-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-36"></div></td>
    <td className="py-3 px-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-24"></div></td>
    <td className="py-3 px-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-28"></div></td>
    <td className="py-3 px-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-20"></div></td>
    <td className="py-3 px-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-16"></div></td>
  </tr>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 overflow-hidden p-4 space-y-3">
    <div className="flex justify-between items-center mb-4">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
    </div>
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-100 dark:bg-gray-750 rounded-xl animate-pulse"></div>
      ))}
    </div>
  </div>
);
