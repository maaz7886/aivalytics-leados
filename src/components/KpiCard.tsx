// src/components/KpiCard.tsx
import React from 'react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean | null; // true: green, false: red, null: neutral
  icon?: React.ReactNode;
  iconBg?: string;
  sparklineColor?: string;
  sparklinePoints?: number[];
}

export default function KpiCard({
  title,
  value,
  change = "+12%",
  isPositive = true,
  icon,
  iconBg = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  sparklineColor = "#10b981",
  sparklinePoints = [20, 25, 22, 35, 30, 45, 55]
}: KpiCardProps) {
  // Generate SVG path for sparkline
  const min = Math.min(...sparklinePoints);
  const max = Math.max(...sparklinePoints);
  const range = max - min || 1;
  const height = 24;
  const width = 64;

  const points = sparklinePoints.map((pt, idx) => {
    const x = (idx / (sparklinePoints.length - 1)) * width;
    const y = height - ((pt - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(' ');

  const isFlat = sparklinePoints.every((val) => val === sparklinePoints[0]);

  return (
    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Top: Icon & Title */}
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${iconBg}`}>
          {icon || '📊'}
        </div>
        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 truncate" title={title}>
          {title}
        </span>
      </div>

      {/* Middle: Big Value */}
      <div className="my-2">
        <span className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight block truncate">
          {value}
        </span>
      </div>

      {/* Bottom: Trend diff & Mini Sparkline */}
      <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-50 dark:border-gray-700/50">
        <div className="flex flex-col">
          <span className={`text-[10px] font-black ${
            isFlat || isPositive === null
              ? 'text-gray-400'
              : isPositive
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isFlat ? '— 0%' : isPositive ? `↑ ${change}` : `↓ ${change}`}
          </span>
          <span className="text-[9px] text-gray-400 dark:text-gray-500">
            vs last 7 days
          </span>
        </div>

        {/* SVG Sparkline */}
        <div className="w-16 h-6 shrink-0 flex items-center justify-end">
          <svg width={width} height={height} className="overflow-visible">
            {isFlat ? (
              <line x1="0" y1="12" x2={width} y2="12" stroke="#9ca3af" strokeWidth="2" strokeDasharray="3 3" />
            ) : (
              <polyline
                fill="none"
                stroke={sparklineColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
