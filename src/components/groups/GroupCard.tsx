import React from 'react';
import { Group } from '../../types/group';
import { Talent } from '../../types/talent';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { Users, ChevronRight, Edit2, Trash2, User, ShieldCheck, AlertCircle } from 'lucide-react';

interface GroupCardProps {
  group: Group;
  talents: Talent[];
  onSelect?: (group: Group) => void;
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
  viewMode?: 'grid' | 'list';
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  talents,
  onSelect,
  onEdit,
  onDelete,
  viewMode = 'grid'
}) => {
  const { t, language } = useLanguage();
  const { schedule, venues } = useApp();

  // Compute group member stats
  const members = talents.filter((tItem) => group.memberTalentIds.includes(tItem.id));
  const maleCount = members.filter((tItem) => tItem.gender === 'Male').length;
  const femaleCount = members.filter((tItem) => tItem.gender === 'Female').length;
  const activeCount = members.filter((tItem) => tItem.status === 'Active').length;
  const nonActiveCount = members.length - activeCount;



  const handleClick = () => {
    if (onSelect) {
      onSelect(group);
    } else {
      onEdit(group);
    }
  };

  // LIST VIEW ROW
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: '14px 20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 2fr) minmax(180px, 1.4fr) minmax(160px, 1.2fr) minmax(140px, 1.2fr) 140px',
          alignItems: 'center',
          gap: '16px',
          transition: 'all var(--transition-fast)',
          position: 'relative',
          cursor: 'pointer'
        }}
        className="group-row-card"
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-medium)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        {/* Col 1: Group Name & Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#D1FAE5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Users size={18} strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--color-charcoal)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {group.name} · {t('season_tag')}
            </h3>

          </div>
        </div>

        {/* Col 2: Avatars & Performers Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {members.slice(0, 3).map((member, idx) => (
              <img
                key={member.id}
                src={
                  member.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.firstName}${member.lastName}`
                }
                alt={member.firstName}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #FFFFFF',
                  marginLeft: idx === 0 ? 0 : '-8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
            {members.length} {t('members')}
          </span>
        </div>

        {/* Col 3: Gender breakdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <User size={11} style={{ color: '#2563EB' }} />
            <span>{maleCount} {t('males')}</span>
          </span>
          <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <User size={11} style={{ color: '#DB2777' }} />
            <span>{femaleCount} {t('females')}</span>
          </span>
        </div>

        {/* Col 4: Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {nonActiveCount > 0 ? (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '3px 8px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <AlertCircle size={12} />
              <span>{nonActiveCount} {t('unavailable')}</span>
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '3px 8px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(22, 163, 74, 0.1)',
                color: '#16A34A',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ShieldCheck size={12} />
              <span>{t('all_active')}</span>
            </span>
          )}
        </div>

        {/* Col 5: Manage ensemble link & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.825rem',
              fontWeight: 600,
              color: 'var(--color-charcoal)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            {t('manage_ensemble')}
            <ChevronRight size={14} />
          </span>
        </div>
      </div>
    );
  }

  // GRID VIEW (Exact match to requested design mockup)
  return (
    <div
      onClick={handleClick}
      style={{
        background: 'var(--bg-surface)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--border-medium)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
    >
      {/* Top Row: Title + Location & Mint-Green Users Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontSize: '1.08rem',
              fontWeight: 700,
              color: 'var(--color-charcoal)',
              margin: 0,
              letterSpacing: '-0.01em',
              lineHeight: 1.3
            }}
          >
            {group.name} · {t('season_tag')}
          </h3>

        </div>

        {/* Mint-Green Icon Badge */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#D1FAE5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          title={t('group_members')}
        >
          <Users size={18} strokeWidth={2} />
        </div>
      </div>

      {/* Middle Row: Stacked Round Performer Avatars */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 20px 0' }}>
        {members.slice(0, 5).map((member, idx) => (
          <img
            key={member.id}
            src={
              member.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.firstName}${member.lastName}`
            }
            alt={member.firstName}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #FFFFFF',
              marginLeft: idx === 0 ? 0 : '-10px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
            title={`${member.firstName} ${member.lastName} (${member.status})`}
          />
        ))}
        {members.length > 5 && (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--color-charcoal)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginLeft: '-10px',
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            +{members.length - 5}
          </div>
        )}
      </div>

      {/* Thin Divider Line */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', marginBottom: '14px' }} />

      {/* Bottom Row: Performer Count & Manage ensemble Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {members.length === 1 ? '1 performer' : `${members.length} performers`}
        </div>

        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-charcoal)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'color var(--transition-fast)'
          }}
        >
          <span>{t('manage_ensemble')}</span>
        </div>
      </div>
    </div>
  );
};
