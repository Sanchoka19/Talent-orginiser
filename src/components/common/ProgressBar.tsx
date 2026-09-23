'use client';

import React from 'react';

interface SplitProgressBarProps {
  yellowPercent?: number;
  primaryPercent?: number;
  darkPercent: number;
  stripedPercent?: number;
  height?: number;
}

export const SplitProgressBar: React.FC<SplitProgressBarProps> = ({
  yellowPercent,
  primaryPercent,
  darkPercent,
  stripedPercent = 0,
  height = 8
}) => {
  const effectivePrimary = primaryPercent ?? yellowPercent ?? 0;

  return (
    <div
      className="w-full rounded-pill bg-surface-tertiary flex overflow-hidden border border-border-subtle"
      style={{ height: `${height}px` }}
    >
      {effectivePrimary > 0 && (
        <div
          className="h-full bg-brand-primary transition-all duration-300"
          style={{ width: `${effectivePrimary}%` }}
        />
      )}
      {darkPercent > 0 && (
        <div
          className="h-full bg-brand-navy transition-all duration-300"
          style={{ width: `${darkPercent}%` }}
        />
      )}
      {stripedPercent > 0 && (
        <div
          className="h-full pattern-striped transition-all duration-300"
          style={{ width: `${stripedPercent}%` }}
        />
      )}
    </div>
  );
};
