'use client';

import React from 'react';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor?: string;
  subtitle?: string;
  subtitleColor?: string;
  isActive?: boolean;
  activeBorderColor?: string;
  onClick?: () => void;
  className?: string;
  titleTooltip?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = 'bg-surface-secondary text-text-secondary',
  subtitle,
  subtitleColor = 'text-text-tertiary',
  isActive = false,
  activeBorderColor = 'border-brand-primary ring-2 ring-brand-primary/20',
  onClick,
  className = '',
  titleTooltip
}) => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      title={titleTooltip}
      className={`bg-surface border rounded-xl p-3 sm:p-4 flex items-center justify-between transition-all duration-150 select-none ${
        isActive
          ? `${activeBorderColor} shadow-xs`
          : 'border-border-subtle shadow-xs'
      } ${
        isClickable
          ? 'cursor-pointer hover:border-border-medium hover:shadow-sm'
          : ''
      } ${className}`}
    >
      {/* Left: Title and Big Number */}
      <div className="flex flex-col min-w-0 pr-1.5 sm:pr-2">
        <span className="text-[11px] sm:text-xs font-medium text-text-secondary truncate">
          {title}
        </span>
        <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
          <span className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight leading-none">
            {value}
          </span>
          {subtitle && (
            <span className={`text-[11px] sm:text-xs font-medium ${subtitleColor}`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right: Colored Icon Container */}
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBgColor}`}
      >
        {icon}
      </div>
    </div>
  );
};
