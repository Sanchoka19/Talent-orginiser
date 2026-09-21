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
        style={{
          background: isSelected ? 'var(--brand-primary)' : 'var(--bg-surface)',
          color: isSelected ? '#FFFFFF' : 'inherit',
          borderRadius: 'var(--radius-lg)',
          border: isSelected ? '1px solid var(--brand-primary-hover)' : '1px solid var(--border-subtle)',
          boxShadow: isSelected ? '0 8px 24px var(--brand-primary-glow)' : 'var(--shadow-sm)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all var(--transition-fast)'
        }}
        className="talent-grid-card"
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }
        }}
      >
        {/* Top Badges */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              color: isSelected ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-text-secondary)'
            }}
          >
            <FileText size={13} />
            <span>{talent.documents.length} {t('docs_count')}</span>
          </div>

          <StatusBadge status={talent.status} />
        </div>

        {/* Center Avatar */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <img
            src={avatarSrc}
            alt={`${talent.firstName} ${talent.lastName}`}
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: isSelected ? '3px solid #FFFFFF' : '3px solid var(--border-subtle)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
          />
        </div>

        {/* Name & Specialty */}
        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>
          {talent.firstName} {talent.lastName}
        </div>
        <div
          style={{
            fontSize: '0.8rem',
            color: isSelected ? 'rgba(255, 255, 255, 0.85)' : 'var(--color-text-secondary)',
            marginBottom: '16px',
            lineHeight: 1.3
          }}
        >
          {talent.primarySkill}
        </div>

        {/* Bottom Specs: Gender & Height */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: 'auto',
            paddingTop: '12px',
            borderTop: isSelected ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid var(--border-subtle)',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <GenderBadge gender={talent.gender} />
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: isSelected ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-text-secondary)'
            }}
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
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        alignItems: 'center',
        padding: '14px 20px',
        borderRadius: 'var(--radius-md)',
        background: isSelected ? 'var(--brand-primary)' : 'var(--bg-surface)',
        color: isSelected ? '#FFFFFF' : 'inherit',
        border: isSelected ? '1px solid var(--brand-primary-hover)' : '1px solid var(--border-subtle)',
        boxShadow: isSelected ? '0 4px 16px var(--brand-primary-glow)' : 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        boxSizing: 'border-box'
      }}
      className="talent-row-card"
    >
      {/* Col 1: Avatar & Name + Specialty */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, paddingRight: '12px' }}>
        <img
          src={avatarSrc}
          alt={`${talent.firstName} ${talent.lastName}`}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: isSelected ? '2px solid #FFFFFF' : '2px solid var(--border-subtle)',
            flexShrink: 0
          }}
        />
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={`${talent.firstName} ${talent.lastName}`}
          >
            {talent.firstName} {talent.lastName}
          </div>
          <div
            style={{
              fontSize: '0.785rem',
              color: isSelected ? 'rgba(255, 255, 255, 0.85)' : 'var(--color-text-secondary)',
              marginTop: '1px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={talent.primarySkill}
          >
            {talent.primarySkill}
          </div>
        </div>
      </div>

      {/* Col 2: Gender & Height & Weight */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, paddingRight: '10px' }}>
        <div style={{ flexShrink: 0 }}>
          <GenderBadge gender={talent.gender} />
        </div>
        <span
          style={{
            fontSize: '0.8rem',
            color: isSelected ? 'rgba(255, 255, 255, 0.85)' : 'var(--color-text-secondary)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {talent.heightCm} cm{talent.weightKg ? ` • ${talent.weightKg} kg` : ''}
        </span>
      </div>

      {/* Col 3: Documents Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.775rem',
          color: isSelected ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-text-secondary)',
          whiteSpace: 'nowrap',
          minWidth: 0,
          paddingRight: '10px'
        }}
        title={`${talent.documents.length} verified documents on file`}
      >
        <FileText size={14} style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 500 }}>{talent.documents.length} {t('docs_count')}</span>
      </div>

      {/* Col 4: Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0, minWidth: 0 }}>
        <StatusBadge status={talent.status} />
      </div>
    </div>
  );
};
