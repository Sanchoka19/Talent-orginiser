'use client';

import React from 'react';
import { Talent } from '../../types/talent';
import { StatusBadge, GenderBadge } from '../common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { FileText } from 'lucide-react';

interface TalentCardProps {
  talent: Talent;
  isSelected?: boolean;
  onSelect: (talent: Talent) => void;
  viewMode?: 'list' | 'grid';
}

export const TalentCard: React.FC<TalentCardProps> = ({
  talent,
  isSelected = false,
  onSelect,
  viewMode = 'list'
}) => {
  const { t } = useLanguage();

  const avatarSrc =
    talent.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.firstName}${talent.lastName}`;

  // GRID VIEW CARD
  if (viewMode === 'grid') {
    return (
      <div
        onClick={() => onSelect(talent)}
        className={`group relative rounded-lg p-5 flex flex-col items-center text-center cursor-pointer transition-all duration-150 ${
          isSelected
            ? 'bg-brand-primary text-white border border-brand-primary-hover shadow-glow'
            : 'bg-surface text-text-primary border border-border-subtle shadow-sm hover:shadow-md hover:border-border-medium hover:-translate-y-0.5'
        }`}
      >
        {/* Top Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div
            className={`flex items-center gap-1 text-xs ${
              isSelected ? 'text-white/90' : 'text-text-secondary'
            }`}
          >
            <FileText size={13} />
            <span>
              {talent.documents.length} {t('docs_count')}
            </span>
          </div>

          <StatusBadge status={talent.status} />
        </div>

        {/* Center Avatar */}
        <div className="relative mb-3.5">
          <img
            src={avatarSrc}
            alt={`${talent.firstName} ${talent.lastName}`}
            className={`w-16 h-16 rounded-full object-cover shadow-sm ${
              isSelected ? 'border-2 border-white' : 'border-2 border-border-subtle'
            }`}
          />
        </div>

        {/* Name & Specialty */}
        <div className="font-bold text-base mb-1 truncate max-w-full">
          {talent.firstName} {talent.lastName}
        </div>
        <div
          className={`text-xs mb-4 leading-snug line-clamp-2 max-w-full ${
            isSelected ? 'text-white/85' : 'text-text-secondary'
          }`}
        >
          {talent.primarySkill}
        </div>

        {/* Bottom Specs: Gender & Height */}
        <div
          className={`flex items-center justify-center gap-2 mt-auto pt-3 w-full border-t ${
            isSelected ? 'border-white/25' : 'border-border-subtle'
          }`}
        >
          <GenderBadge gender={talent.gender} />
          <span
            className={`text-xs font-semibold ${
              isSelected ? 'text-white/90' : 'text-text-secondary'
            }`}
          >
            {talent.heightCm} cm{talent.weightKg ? ` • ${talent.weightKg} kg` : ''}
          </span>
        </div>
      </div>
    );
  }

  // LIST VIEW ROW
  return (
    <div
      onClick={() => onSelect(talent)}
      className={`grid grid-cols-4 items-center px-5 py-3.5 rounded-md cursor-pointer transition-all duration-150 ${
        isSelected
          ? 'bg-brand-primary text-white border border-brand-primary-hover shadow-glow'
          : 'bg-surface text-text-primary border border-border-subtle shadow-sm hover:shadow-md hover:border-border-medium hover:-translate-y-0.5'
      }`}
    >
      {/* Col 1: Avatar & Name + Specialty */}
      <div className="flex items-center gap-3.5 min-w-0 pr-3">
        <img
          src={avatarSrc}
          alt={`${talent.firstName} ${talent.lastName}`}
          className={`w-10 h-10 rounded-full object-cover shrink-0 ${
            isSelected ? 'border-2 border-white' : 'border-2 border-border-subtle'
          }`}
        />
        <div className="min-w-0 overflow-hidden">
          <div
            className="font-semibold text-sm truncate"
            title={`${talent.firstName} ${talent.lastName}`}
          >
            {talent.firstName} {talent.lastName}
          </div>
          <div
            className={`text-xs truncate mt-0.5 ${
              isSelected ? 'text-white/85' : 'text-text-secondary'
            }`}
            title={talent.primarySkill}
          >
            {talent.primarySkill}
          </div>
        </div>
      </div>

      {/* Col 2: Gender & Height & Weight */}
      <div className="flex items-center gap-2.5 min-w-0 pr-2.5">
        <div className="shrink-0">
          <GenderBadge gender={talent.gender} />
        </div>
        <span
          className={`text-xs font-medium truncate ${
            isSelected ? 'text-white/85' : 'text-text-secondary'
          }`}
        >
          {talent.heightCm} cm{talent.weightKg ? ` • ${talent.weightKg} kg` : ''}
        </span>
      </div>

      {/* Col 3: Documents Indicator */}
      <div
        className={`flex items-center gap-1.5 text-xs truncate pr-2.5 ${
          isSelected ? 'text-white/90' : 'text-text-secondary'
        }`}
        title={`${talent.documents.length} verified documents on file`}
      >
        <FileText size={14} className="shrink-0" />
        <span className="font-medium">
          {talent.documents.length} {t('docs_count')}
        </span>
      </div>

      {/* Col 4: Status Badge */}
      <div className="flex items-center justify-end shrink-0 min-w-0">
        <StatusBadge status={talent.status} />
      </div>
    </div>
  );
};
