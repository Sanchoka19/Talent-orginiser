import React from 'react';
import { TalentStatus, Gender } from '../../types/talent';
import { DutyGenderRequirement } from '../../types/inventory';
import { useLanguage } from '../../context/LanguageContext';

interface StatusBadgeProps {
  status: TalentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useLanguage();

  let className = 'badge-active';
  let label = t('status_active');

  if (status === 'Rest') {
    className = 'badge-rest';
    label = t('status_rest');
  } else if (status === 'Sick/Injured') {
    className = 'badge-sick';
    label = t('status_sick');
  }

  return (
    <span className={`badge ${className}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
};

interface GenderBadgeProps {
  gender: Gender | DutyGenderRequirement;
}

export const GenderBadge: React.FC<GenderBadgeProps> = ({ gender }) => {
  const { t } = useLanguage();

  let className = 'badge-gender-any';
  let label = t('gender_any');

  if (gender === 'Male') {
    className = 'badge-gender-male';
    label = t('gender_male');
  } else if (gender === 'Male Only') {
    className = 'badge-gender-male';
    label = t('gender_male_only');
  } else if (gender === 'Female') {
    className = 'badge-gender-female';
    label = t('gender_female');
  } else if (gender === 'Female Only') {
    className = 'badge-gender-female';
    label = t('gender_female_only');
  }

  return (
    <span className={`badge ${className}`}>
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
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: 'var(--radius-pill)',
        fontSize: '0.75rem',
        fontWeight: 500,
        background: 'var(--bg-surface-tertiary)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--border-subtle)'
      }}
    >
      <span>{name}</span>
      {headcount !== undefined && (
        <span
          style={{
            background: 'var(--color-charcoal)',
            color: 'white',
            borderRadius: '9999px',
            padding: '1px 6px',
            fontSize: '0.675rem',
            fontWeight: 600
          }}
        >
          {headcount}
        </span>
      )}
      {genderReq && genderReq !== 'Any' && (
        <span style={{ fontSize: '0.675rem', color: 'var(--color-text-secondary)' }}>
          ({genderLabel})
        </span>
      )}
    </span>
  );
};
