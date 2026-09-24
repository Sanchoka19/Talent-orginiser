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

  // GRID VIEW CARD (Poster Layout)
  if (viewMode === 'grid') {
    return (
      <div
        onClick={() => onSelect(talent)}
        className={`group relative rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all duration-150 ${isSelected
          ? 'bg-brand-primary text-white border-2 border-brand-primary shadow-glow ring-2 ring-brand-primary/20'
          : 'bg-surface text-text-primary border border-border-subtle shadow-xs hover:shadow-md hover:border-border-medium hover:-translate-y-0.5'
          }`}
      >
        {/* Top Section: Portrait Image */}
        <div className="relative w-full aspect-square bg-surface-secondary overflow-hidden">
          <img
            src={avatarSrc}
            alt={`${talent.firstName} ${talent.lastName}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Floating Badges on Image */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
            {/* Documents Counter Badge */}
            <div className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-md bg-black/45 text-white shadow-xs">
              <FileText size={12} />
              <span>
                {talent.documents.length} {t('docs_count')}
              </span>
            </div>

            {/* Availability Status Badge */}
            <div className="shadow-xs">
              <StatusBadge status={talent.status} />
            </div>
          </div>
        </div>

        {/* Bottom Section: Details */}
        <div
          className={`p-3.5 flex flex-col gap-1 w-full text-left transition-colors duration-150 ${isSelected ? 'bg-brand-primary text-white' : 'bg-surface'
            }`}
        >
          {/* Name */}
          <div
            className={`font-semibold text-sm truncate max-w-full ${isSelected ? 'text-white' : 'text-text-primary'
              }`}
            title={`${talent.firstName} ${talent.lastName}`}
          >
            {talent.firstName} {talent.lastName}
          </div>

          {/* Specialty */}
          <div
            className={`text-xs truncate ${isSelected ? 'text-white/85' : 'text-text-secondary'
              }`}
            title={talent.primarySkill}
          >
            {talent.primarySkill}
          </div>

          {/* Metrics Footer (Gender & Height & Weight) */}
          <div
            className={`flex items-center gap-2 mt-1.5 pt-2 border-t text-xs ${isSelected ? 'border-white/20 text-white/90' : 'border-border-subtle text-text-tertiary'
              }`}
          >
            <GenderBadge gender={talent.gender} />
            <span className="truncate font-medium">
              {talent.heightCm} cm{talent.weightKg ? ` • ${talent.weightKg} kg` : ''}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW ROW
  return (
    <div
      onClick={() => onSelect(talent)}
      className={`grid grid-cols-4 items-center px-5 py-3.5 rounded-md cursor-pointer transition-all duration-150 ${isSelected
        ? 'bg-brand-primary text-white border border-brand-primary-hover shadow-glow'
        : 'bg-surface text-text-primary border border-border-subtle shadow-sm hover:shadow-md hover:border-border-medium hover:-translate-y-0.5'
        }`}
    >
      {/* Col 1: Avatar & Name + Specialty */}
      <div className="flex items-center gap-3.5 min-w-0 pr-3">
        <img
          src={avatarSrc}
          alt={`${talent.firstName} ${talent.lastName}`}
          className={`w-10 h-10 rounded-full object-cover shrink-0 ${isSelected ? 'border-2 border-white' : 'border-2 border-border-subtle'
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
            className={`text-xs truncate mt-0.5 ${isSelected ? 'text-white/85' : 'text-text-secondary'
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
          className={`text-xs font-medium truncate ${isSelected ? 'text-white/85' : 'text-text-secondary'
            }`}
        >
          {talent.heightCm} cm{talent.weightKg ? ` • ${talent.weightKg} kg` : ''}
        </span>
      </div>

      {/* Col 3: Documents Indicator */}
      <div
        className={`flex items-center gap-1.5 text-xs truncate pr-2.5 ${isSelected ? 'text-white/90' : 'text-text-secondary'
          }`}
        title={`${talent.documents.length} verified documents on file`}
      >
        <FileText size={14} className="shrink-0" />
        <span className="font-medium">
          {talent.documents.length} {t('docs_count')}
        </span>
      </div>

      {/* Col 4: Availability Status Only */}
      <div className="flex items-center justify-end shrink-0 min-w-0">
        <StatusBadge status={talent.status} />
      </div>
    </div>
  );
};