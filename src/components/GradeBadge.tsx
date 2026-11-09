// src/components/GradeBadge.tsx
// Visual grade badge for hygiene grades (A, B, C, D, F)

import React from 'react';

interface GradeBadgeProps {
  grade: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GradeBadge: React.FC<GradeBadgeProps> = ({ grade, size = 'md' }) => {
  const g = (grade || '?').toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  if (g === 'A') colorClasses = 'bg-emerald-950/70 text-emerald-300 border-emerald-700';
  else if (g === 'B') colorClasses = 'bg-cyan-950/70 text-cyan-300 border-cyan-700';
  else if (g === 'C') colorClasses = 'bg-amber-950/70 text-amber-300 border-amber-700';
  else if (g === 'D') colorClasses = 'bg-orange-950/70 text-orange-300 border-orange-700';
  else if (g === 'F') colorClasses = 'bg-rose-950/70 text-rose-300 border-rose-700';

  const sizeClasses =
    size === 'sm'
      ? 'w-6 h-6 text-xs'
      : size === 'lg'
      ? 'w-12 h-12 text-2xl font-black'
      : 'w-8 h-8 text-sm font-bold';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg border font-mono ${sizeClasses} ${colorClasses}`}
      title={`Consensus Hygiene Grade: ${g}`}
    >
      {g}
    </span>
  );
};
