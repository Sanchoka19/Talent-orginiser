'use client';

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
      zIndex={1300}
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer outline-none"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            form="swap-form"
            disabled={!replacementTalentId}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-pill text-sm font-medium bg-brand-primary text-text-inverse shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
          >
            {t('confirm_reassignment')}
          </button>
        </div>
      }
    >
      <form id="swap-form" onSubmit={handleSwap} className="flex flex-col">
        {/* Currently Assigned Talent */}
        <div className="p-3.5 sm:p-4 rounded-sm bg-surface-secondary border border-border-subtle mb-4">
          <div className="text-[11px] uppercase text-text-secondary font-semibold mb-1.5 tracking-wider">
            {t('current_performer')}
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <img
                src={
                  originalTalent.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${originalTalent.firstName}`
                }
                alt={originalTalent.firstName}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-border-subtle"
              />
              <div>
                <div className="font-semibold text-sm text-text-primary">
                  {originalTalent.firstName} {originalTalent.lastName}
                </div>
                <div className="text-xs text-text-secondary">
                  {originalTalent.primarySkill}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <GenderBadge gender={originalTalent.gender} />
              <StatusBadge status={originalTalent.status} />
            </div>
          </div>
        </div>

        {/* Swap Arrow Icon */}
        <div className="flex items-center justify-center my-2 text-text-secondary">
          <RefreshCw className="w-5 h-5 text-text-secondary animate-none" />
        </div>

        {/* Replacement Candidate Selector */}
        <div className="flex flex-col gap-1.5 mb-3">
          <label className="text-xs font-semibold text-text-secondary">
            {t('select_replacement')}
          </label>
          <select
            className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
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
          <div className="p-3 rounded-sm bg-status-rest-bg border border-status-rest-dot/30 text-status-rest-text text-xs flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0 text-status-rest-dot" />
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
          <div className="p-3 rounded-sm bg-danger-light border border-danger-border text-danger text-xs flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0 text-danger" />
            <span>
              {t('warning_gender_rule', {
                req: duty.assignedGender,
                gender: selectedCandidate?.gender || ''
              })}
            </span>
          </div>
        )}

        <div className="text-xs text-text-secondary leading-relaxed flex items-center gap-1.5 mt-2">
          <Info className="w-3.5 h-3.5 shrink-0 text-text-tertiary" strokeWidth={2} />
          <em>{t('admin_override_notice')}</em>
        </div>
      </form>
    </Modal>
  );
};
