import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { ScheduleConflict } from '../../types/schedule';
import { useLanguage } from '../../context/LanguageContext';

interface ConflictAlertProps {
  blockingConflicts: ScheduleConflict[];
  warningConflicts?: ScheduleConflict[];
}

export const ConflictAlert: React.FC<ConflictAlertProps> = ({
  blockingConflicts,
  warningConflicts = []
}) => {
  const { t } = useLanguage();

  if (blockingConflicts.length === 0 && warningConflicts.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
      {/* Blocking conflicts */}
      {blockingConflicts.map((c, i) => (
        <div
          key={`block-${i}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            fontSize: '0.85rem',
            lineHeight: 1.4
          }}
        >
          <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#DC2626' }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>
              {t('conflict_detected')}
            </div>
            <div>{c.reason}</div>
          </div>
        </div>
      ))}

      {/* Warning conflicts */}
      {warningConflicts.map((w, i) => (
        <div
          key={`warn-${i}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            color: '#92400E',
            fontSize: '0.85rem',
            lineHeight: 1.4
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#D97706' }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>
              {t('venue_overlap_warn')}
            </div>
            <div>{w.reason}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
