'use client';

import React from 'react';
import { TalentStatus, Gender } from '../../types/talent';
import { DutyGenderRequirement } from '../../types/inventory';
import { useLanguage } from '../../context/LanguageContext';

interface StatusBadgeProps {
  status: TalentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useLanguage();

  let colorClasses = 'bg-status-active-bg text-status-active-text';
  let dotClasses = 'bg-status-active-dot ring-2 ring-emerald-500/20';
  let label = t('status_active');

  if (status === 'Rest') {
    colorClasses = 'bg-status-rest-bg text-status-rest-text';
    dotClasses = 'bg-status-rest-dot ring-2 ring-amber-500/20';
    label = t('status_rest');
  } else if (status === 'Sick/Injured') {
    colorClasses = 'bg-status-sick-bg text-status-sick-text';
    dotClasses = 'bg-status-sick-dot ring-2 ring-red-500/20';
    label = t('status_sick');
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-medium tracking-wide whitespace-nowrap shrink-0 ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses}`} />
      <span>{label}</span>
    </span>
  );
};

interface GenderBadgeProps {
  gender: Gender | DutyGenderRequirement;
}

export const GenderBadge: React.FC<GenderBadgeProps> = ({ gender }) => {
  const { t } = useLanguage();

  let colorClasses = 'bg-tag-any-bg text-tag-any-text';
  let label = t('gender_any');

  if (gender === 'Male') {
    colorClasses = 'bg-tag-male-bg text-tag-male-text';
    label = t('gender_male');
  } else if (gender === 'Male Only') {
    colorClasses = 'bg-tag-male-bg text-tag-male-text';
    label = t('gender_male_only');
  } else if (gender === 'Female') {
    colorClasses = 'bg-tag-female-bg text-tag-female-text';
    label = t('gender_female');
  } else if (gender === 'Female Only') {
    colorClasses = 'bg-tag-female-bg text-tag-female-text';
    label = t('gender_female_only');
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-pill text-xs font-medium tracking-wide whitespace-nowrap shrink-0 ${colorClasses}`}>
      {label}
    </span>
  );
};

interface DutyBadgeProps {
  name: string;
  headcount?: number;
  genderReq?: DutyGenderRequirement;
}

export const DutyBadge: React.FC<DutyBadgeProps> = ({ name, headcount, genderReq }) => {
  const { t } = useLanguage();

  let genderLabel = '';
  if (genderReq === 'Male Only') genderLabel = t('gender_male_only');
  else if (genderReq === 'Female Only') genderLabel = t('gender_female_only');
  else if (genderReq === 'Any') genderLabel = t('gender_any');

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-xs font-medium bg-surface-tertiary text-text-primary border border-border-subtle">
      <span>{name}</span>
      {headcount !== undefined && (
        <span className="bg-brand-navy text-white rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none">
          {headcount}
        </span>
      )}
      {genderReq && genderReq !== 'Any' && (
        <span className="text-[10px] text-text-secondary">
          ({genderLabel})
        </span>
      )}
    </span>
  );
};
