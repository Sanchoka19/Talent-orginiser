import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ShowEvent } from '../../types/schedule';
import { DutyAssignment } from '../../types/duty';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge, GenderBadge } from '../common/Badge';
import { RefreshCw, AlertTriangle, Info } from 'lucide-react';

interface DutySwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ShowEvent;
  duty: DutyAssignment;
  originalTalentId: string;
}

export const DutySwapModal: React.FC<DutySwapModalProps> = ({
  isOpen,
  onClose,
  event,
  duty,
  originalTalentId
}) => {
  const { talents, groups, swapDutyTalent } = useApp();
  const { t, language } = useLanguage();
  const toast = useToast();
  const isKa = language === 'ka';

  const group = groups.find((g) => g.id === event.groupId);
  const originalTalent = talents.find((t) => t.id === originalTalentId);

  const [replacementTalentId, setReplacementTalentId] = useState<string>('');

  if (!group || !originalTalent) return null;

  // Find candidate members in the group
  const memberTalents = talents.filter((t) => group.memberTalentIds.includes(t.id));

  // Eligible replacement candidates:
  const candidateTalents = memberTalents.filter(
    (t) => t.id !== originalTalentId && !duty.assignedTalentIds.includes(t.id)
  );

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacementTalentId) return;

    const candidate = talents.find((t) => t.id === replacementTalentId);
    swapDutyTalent(event.id, duty.requirementId, originalTalentId, replacementTalentId);

    if (candidate) {
      toast.success(
        isKa
          ? `მორიგეობა გადაეცა ${candidate.firstName} ${candidate.lastName}-ს`
          : `Shift reassigned to ${candidate.firstName} ${candidate.lastName}`
      );
    }

    onClose();
  };

  const selectedCandidate = talents.find((t) => t.id === replacementTalentId);
  const isCandidateNonActive = selectedCandidate && selectedCandidate.status !== 'Active';
  const isCandidateGenderMismatch =
    selectedCandidate &&
    ((duty.assignedGender === 'Male Only' && selectedCandidate.gender !== 'Male') ||
      (duty.assignedGender === 'Female Only' && selectedCandidate.gender !== 'Female'));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin_swap_title')}
      subtitle={t('admin_swap_sub', {
        item: duty.itemName,
        date: new Date(event.startDateTime).toLocaleDateString()
      })}
      maxWidth="540px"
      zIndex={1100}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            {t('cancel')}
          </button>
          <button
            type="submit"
            form="swap-form"
            className="btn btn-primary"
            disabled={!replacementTalentId}
          >
            {t('confirm_reassignment')}
          </button>
        </>
      }
    >
      <form id="swap-form" onSubmit={handleSwap}>
        {/* Currently Assigned Talent */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px'
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
            {t('current_performer')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={
                  originalTalent.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${originalTalent.firstName}`
                }
                alt={originalTalent.firstName}
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {originalTalent.firstName} {originalTalent.lastName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {originalTalent.primarySkill}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <GenderBadge gender={originalTalent.gender} />
              <StatusBadge status={originalTalent.status} />
            </div>
          </div>
        </div>

        {/* Swap Arrow Icon */}
        <div style={{ textAlign: 'center', margin: '4px 0 12px 0', color: 'var(--color-text-secondary)' }}>
          <RefreshCw size={20} />
        </div>

        {/* Replacement Candidate Selector */}
        <div className="form-group">
          <label className="form-label">{t('select_replacement')}</label>
          <select
            className="form-select"
            value={replacementTalentId}
            onChange={(e) => setReplacementTalentId(e.target.value)}
            required
          >
            <option value="">{t('choose_active_replacement')}</option>
            {candidateTalents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.gender}, {c.status})
              </option>
            ))}
          </select>
        </div>

        {/* Warning if candidate is on rest or sick */}
        {isCandidateNonActive && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: '#FEF3C7',
              border: '1px solid #FCD34D',
              color: '#92400E',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>
              {t('warning_candidate_status', {
                name: selectedCandidate?.firstName || '',
                status: selectedCandidate?.status || ''
              })}
            </span>
          </div>
        )}

        {/* Warning if gender mismatch */}
        {isCandidateGenderMismatch && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>
              {t('warning_gender_rule', {
                req: duty.assignedGender,
                gender: selectedCandidate?.gender || ''
              })}
            </span>
          </div>
        )}

        <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} strokeWidth={2} style={{ flexShrink: 0 }} />
          <em>{t('admin_override_notice')}</em>
        </div>
      </form>
    </Modal>
  );
};
