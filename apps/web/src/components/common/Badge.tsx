'use client';

import React from 'react';
import { TalentStatus, Gender, RehireStatus } from '../../types/talent';
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
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium tracking-normal whitespace-nowrap shrink-0 ${colorClasses}`}>
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium tracking-normal whitespace-nowrap shrink-0 ${colorClasses}`}>
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
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-surface-secondary text-text-primary border border-border-subtle">
      <span>{name}</span>
      {headcount !== undefined && (
        <span className="bg-brand-navy text-white rounded px-1.5 py-0.2 text-[10px] font-semibold leading-none">
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

interface RehireBadgeProps {
  status?: RehireStatus | string;
  className?: string;
}

export const RehireBadge: React.FC<RehireBadgeProps> = ({ status, className = '' }) => {
  const { language } = useLanguage();
  const isKa = language === 'ka';

  if (!status) return null;

  if (
    status === 'eligible' ||
    status === 'Eligible for Rehire' ||
    status === 'Eligible' ||
    status === 'Recommended'
  ) {
    return (
      <span
        className={`bg-status-active-bg text-status-active-text border border-emerald-500/25 font-semibold px-2.5 py-0.5 rounded-md text-xs inline-flex items-center gap-1.5 shadow-xs ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-status-active-dot shrink-0" />
        <span>{isKa ? 'რეკომენდებული' : 'Eligible for Rehire'}</span>
      </span>
    );
  }

  if (
    status === 'do_not_rehire' ||
    status === 'Do Not Rehire' ||
    status === 'Blacklisted' ||
    status === 'Blacklist'
  ) {
    return (
      <span
        className={`bg-status-sick-bg text-status-sick-text border border-rose-500/25 font-semibold px-2.5 py-0.5 rounded-md text-xs inline-flex items-center gap-1.5 shadow-xs ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-status-sick-dot shrink-0" />
        <span>{isKa ? 'შავი სია' : 'Do Not Rehire'}</span>
      </span>
    );
  }

  return (
    <span
      className={`bg-surface-secondary text-text-secondary border border-border-subtle font-semibold px-2.5 py-0.5 rounded-md text-xs inline-flex items-center gap-1.5 shadow-xs ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary shrink-0" />
      <span>{isKa ? 'ნეიტრალური' : 'Under Review'}</span>
    </span>
  );
};
