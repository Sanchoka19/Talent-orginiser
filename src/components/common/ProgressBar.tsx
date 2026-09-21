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
      style={{
        width: '100%',
        height: `${height}px`,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--bg-surface-tertiary)',
        display: 'flex',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)'
      }}
    >
      {effectivePrimary > 0 && (
        <div
          style={{
            width: `${effectivePrimary}%`,
            height: '100%',
            background: 'var(--brand-primary)',
            transition: 'width 0.3s ease'
          }}
        />
      )}
      {darkPercent > 0 && (
        <div
          style={{
            width: `${darkPercent}%`,
            height: '100%',
            background: 'var(--brand-navy)',
            transition: 'width 0.3s ease'
          }}
        />
      )}
      {stripedPercent > 0 && (
        <div
          className="pattern-striped"
          style={{
            width: `${stripedPercent}%`,
            height: '100%',
            transition: 'width 0.3s ease'
          }}
        />
      )}
    </div>
  );
};
