'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Talent, TalentStatus } from '../../types/talent';
import { Group } from '../../types/group';
import { ShowEvent } from '../../types/schedule';
import { DutyGenderRequirement } from '../../types/inventory';
import { useLanguage } from '../../context/LanguageContext';
import { getTalentAvatar } from '../../utils/avatarUtils';
import { toLocalDateStr } from '../../utils/dateUtils';
import {
  AlertTriangle,
  RotateCw,
  UserCheck,
  Calendar,
  Clock,
  Boxes,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

export interface AffectedDutyShift {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  itemName: string;
  requirementId?: string;
  groupId?: string;
  assignedGender?: DutyGenderRequirement;
}

interface StatusChangeImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  talent: Talent;
  targetStatus: TalentStatus;
  affectedShifts: AffectedDutyShift[];
  groups: Group[];
  allTalents: Talent[];
  schedule?: ShowEvent[];
  formatTimeRange?: (start: any, end: any) => string;
  onConfirmAutoReassign: () => void;
  onConfirmManualReplacements: (replacements: Record<string, string>) => void;
}

export const StatusChangeImpactModal: React.FC<StatusChangeImpactModalProps> = ({
  isOpen,
  onClose,
  talent,
  targetStatus,
  affectedShifts,
  groups,
  allTalents,
  schedule = [],
  onConfirmAutoReassign,
  onConfirmManualReplacements
}) => {
  const { language } = useLanguage();
  const isKa = language === 'ka';

  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [manualReplacements, setManualReplacements] = useState<Record<string, string>>({});

  const talentFullName = `${talent.firstName} ${talent.lastName}`.trim();

  const targetStatusLabel =
    targetStatus === 'Sick/Injured'
      ? (isKa ? 'ავად/ტრავმირებული' : 'Sick/Injured')
      : targetStatus === 'Rest'
        ? (isKa ? 'დასვენება (შვებულება)' : 'Rest / Leave')
        : (isKa ? 'შეჩერებული' : 'Terminated');

  const targetStatusDot =
    targetStatus === 'Sick/Injured'
      ? 'bg-rose-500'
      : targetStatus === 'Rest'
        ? 'bg-amber-500'
        : 'bg-slate-500';

  /**
   * Helper: check if a talent is effectively assigned to a duty
   */
  const isTalentBusyOnDuty = (duty: any, talentId: string): boolean => {
    if (!duty) return false;
    // If talent was swapped out, they are free from this duty
    if (duty.manualOverrides && duty.manualOverrides[talentId]) return false;
    // If talent is direct assigned (and wasn't overridden)
    if (duty.assignedTalentIds && duty.assignedTalentIds.includes(talentId)) return true;
    // If talent is incoming replacement
    if (duty.manualOverrides && Object.values(duty.manualOverrides).includes(talentId)) return true;
    return false;
  };

  /**
   * Filter replacement members:
   * ONLY those who are 100% FREE on that specific day (zero duties on that date)
   * and meet gender and group membership rules.
   */
  const getEligibleReplacementsForShift = (shift: AffectedDutyShift): {
    freeCandidates: Talent[];
  } => {
    const shiftGroup = (groups || []).find((g) => g.id === shift.groupId);
    const pool = shiftGroup
      ? (allTalents || []).filter((t) => (shiftGroup.memberTalentIds || []).includes(t.id))
      : (allTalents || []);

    const now = Date.now();

    // Filter 1: Active status, not archived/terminated, contract not expired, not the talent being replaced
    const activeCandidates = pool.filter((t) => {
      if (t.id === talent.id) return false;
      if (t.status !== 'Active') return false;
      if (t.isArchived) return false;
      if (t.contractStatus === 'terminated') return false;
      if (t.contractExpiryDate && new Date(t.contractExpiryDate).getTime() <= now) return false;
      return true;
    });

    // Filter 2: Gender requirement
    const genderFiltered = activeCandidates.filter((t) => {
      if (shift.assignedGender === 'Male Only') return t.gender === 'Male';
      if (shift.assignedGender === 'Female Only') return t.gender === 'Female';
      return true;
    });

    // Filter 3: Check availability on this specific day!
    const shiftDate = new Date(shift.eventDate);
    const targetDateStr = toLocalDateStr(shiftDate);
    const currentShiftKey = `${shift.eventId}_${shift.requirementId || shift.itemName}`;

    const freeCandidates: Talent[] = [];

    for (const cand of genderFiltered) {
      // 3a. Is candidate assigned to ANY duty in the target event?
      const targetEvent = (schedule || []).find((ev) => ev.id === shift.eventId);
      const isAssignedInTargetEvent = (targetEvent?.dutyAssignments || []).some((d) =>
        isTalentBusyOnDuty(d, cand.id)
      );

      // 3b. Is candidate assigned to ANY duty on ANY event scheduled on the exact same date?
      const isAssignedOnSameDay = (schedule || []).some((ev) => {
        if (ev.status === 'Cancelled') return false;
        const evDateStr = toLocalDateStr(new Date(ev.startDateTime));
        if (evDateStr !== targetDateStr) return false;
        return (ev.dutyAssignments || []).some((d) => isTalentBusyOnDuty(d, cand.id));
      });

      // 3c. Has candidate already been selected for another shift in this modal on the same date?
      const isPickedInModalOnSameDate = Object.entries(manualReplacements).some(
        ([repKey, repTalentId]) => {
          if (repKey === currentShiftKey) return false;
          if (repTalentId !== cand.id) return false;
          const otherShift = affectedShifts.find(
            (s) => `${s.eventId}_${s.requirementId || s.itemName}` === repKey
          );
          if (!otherShift) return false;
          return toLocalDateStr(new Date(otherShift.eventDate)) === targetDateStr;
        }
      );

      const isFree = !isAssignedInTargetEvent && !isAssignedOnSameDay && !isPickedInModalOnSameDate;

      if (isFree) {
        freeCandidates.push(cand);
      }
    }

    return { freeCandidates };
  };

  const handleSelectReplacement = (shiftKey: string, replacementId: string) => {
    setManualReplacements((prev) => ({
      ...prev,
      [shiftKey]: replacementId
    }));
  };

  const handleConfirm = () => {
    if (mode === 'auto') {
      onConfirmAutoReassign();
      onClose();
    } else {
      onConfirmManualReplacements(manualReplacements);
      onClose();
    }
  };

  const isManualReady = useMemo(() => {
    if (mode === 'auto') return true;
    return affectedShifts.every((s) => {
      const key = `${s.eventId}_${s.requirementId || s.itemName}`;
      return Boolean(manualReplacements[key]);
    });
  }, [mode, affectedShifts, manualReplacements]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isKa
          ? 'სტატუსის შეცვლა და მორიგეობების გადანაწილება'
          : 'Status Change & Duty Reallocation'
      }
      subtitle={
        isKa
          ? 'არტისტი დანიშნულია მომავალ შოუებზე — აირჩიეთ ჩანაცვლების მეთოდი'
          : 'Performer has upcoming scheduled duties — choose reallocation method'
      }
      maxWidth="720px"
      zIndex={1400}
      footer={
        <div className="flex items-center justify-between w-full flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-2 rounded-pill text-xs sm:text-sm font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary transition-all cursor-pointer outline-none"
          >
            {isKa ? 'გაუქმება' : 'Cancel'}
          </button>

          <button
            type="button"
            disabled={!isManualReady}
            onClick={handleConfirm}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-pill text-xs sm:text-sm font-bold text-white shadow-md transition-all cursor-pointer outline-none ${
              !isManualReady
                ? 'opacity-50 cursor-not-allowed bg-slate-400'
                : mode === 'auto'
                  ? 'bg-brand-primary hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {mode === 'auto' ? <RotateCw size={15} /> : <UserCheck size={15} />}
            <span>
              {mode === 'auto'
                ? isKa
                  ? 'ავტომატური გადანაწილება და სტატუსის შეცვლა'
                  : 'Auto Re-rotate & Update Status'
                : isKa
                  ? 'შემცვლელების დანიშვნა და სტატუსის შეცვლა'
                  : 'Assign Replacements & Update Status'}
            </span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-left">
        {/* Talent & Transition Header */}
        <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={getTalentAvatar(talent)}
              alt={talentFullName}
              className="w-11 h-11 rounded-full object-cover border-2 border-border-subtle shrink-0 shadow-2xs"
            />
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-text-primary truncate m-0">
                {talentFullName}
              </h4>
              <p className="text-xs text-text-secondary m-0 truncate">
                {talent.primarySkill}
              </p>
            </div>
          </div>

          {/* Status transition badge */}
          <div className="flex items-center gap-2 shrink-0 bg-surface px-3 py-1.5 rounded-lg border border-border-subtle">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{isKa ? 'აქტიური' : 'Active'}</span>
            </div>
            <ArrowRight size={14} className="text-text-tertiary" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
              <span className={`w-2 h-2 rounded-full ${targetStatusDot}`} />
              <span>{targetStatusLabel}</span>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong>
              {isKa
                ? `ყურადღება: ${talentFullName} დანიშნულია მომავალ ${affectedShifts.length} მორიგეობაზე.`
                : `Attention: ${talentFullName} is assigned to ${affectedShifts.length} upcoming duties.`}
            </strong>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300 m-0">
              {isKa
                ? 'სტატუსის შეცვლისას არტისტი ვეღარ შეასრულებს ამ მოვალეობებს. აირჩიეთ, როგორ გადანაწილდეს მისი დავალებები:'
                : 'With status change, performer will be unavailable for these duties. Choose how to reallocate:'}
            </p>
          </div>
        </div>

        {/* Mode Selector (2 Choices) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Choice 1: Auto Reassign */}
          <div
            onClick={() => setMode('auto')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
              mode === 'auto'
                ? 'border-brand-primary bg-brand-primary/5 shadow-xs'
                : 'border-border-subtle bg-surface hover:border-border-medium'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    mode === 'auto'
                      ? 'bg-brand-primary text-white'
                      : 'bg-surface-secondary text-text-secondary'
                  }`}
                >
                  <RotateCw size={15} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-text-primary">
                  {isKa ? 'ავტომატური გადანაწილება' : 'Auto Re-rotate'}
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-pill bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                {isKa ? 'რეკომენდებული' : 'Recommended'}
              </span>
            </div>

            <p className="text-[11px] text-text-secondary leading-snug m-0">
              {isKa
                ? 'სისტემა ავტომატურად გადაანაწილებს მორიგეობებს როტაციის შემდეგ წევრზე (ყველაზე ნაკლები ისტორიული დატვირთვით / Multi-Duty).'
                : 'System will automatically reallocate shifts to the next eligible member with the lowest duty load.'}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand-primary">
              <CheckCircle2 size={13} />
              <span>{isKa ? 'სამართლიანი ალგორითმი' : 'Fairness Algorithm'}</span>
            </div>
          </div>

          {/* Choice 2: Manual Selection */}
          <div
            onClick={() => setMode('manual')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
              mode === 'manual'
                ? 'border-emerald-500 bg-emerald-500/5 shadow-xs'
                : 'border-border-subtle bg-surface hover:border-border-medium'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    mode === 'manual'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-surface-secondary text-text-secondary'
                  }`}
                >
                  <UserCheck size={15} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-text-primary">
                  {isKa ? 'შემცვლელის ხელით არჩევა' : 'Manual Replacement'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-text-secondary leading-snug m-0">
              {isKa
                ? 'თითოეულ შოუზე პირადად აირჩიეთ კონკრეტული შემცვლელი არტისტი, რომელიც იმ დღეს თავისუფალია.'
                : 'Personally select a specific replacement member who is free on that date.'}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
              <Users size={13} />
              <span>{isKa ? 'მხოლოდ თავისუფალი წევრები' : 'Free members only'}</span>
            </div>
          </div>
        </div>

        {/* List of Affected Shifts */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {isKa ? 'დანიშნული მორიგეობები' : 'Scheduled Duty Shifts'} ({affectedShifts.length})
            </span>
            {mode === 'manual' && (
              <span className="text-[11px] text-emerald-600 font-medium">
                {isKa ? 'აირჩიეთ ამ დღეს თავისუფალი წევრი:' : 'Choose a member free on this date:'}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto thin-scrollbar pr-1">
            {affectedShifts.map((shift) => {
              const shiftKey = `${shift.eventId}_${shift.requirementId || shift.itemName}`;
              const shiftDate = new Date(shift.eventDate);
              const shiftGroup = groups.find((g) => g.id === shift.groupId);
              const { freeCandidates } = getEligibleReplacementsForShift(shift);
              const selectedReplacementId = manualReplacements[shiftKey] || '';
              const hasFree = freeCandidates.length > 0;

              return (
                <div
                  key={shiftKey}
                  className="p-3 rounded-xl border border-border-subtle bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0 text-text-secondary">
                      <Boxes size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs sm:text-sm font-bold text-text-primary truncate">
                          {shift.itemName}
                        </strong>
                        {shift.assignedGender && shift.assignedGender !== 'Any' && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-surface-secondary text-text-secondary border border-border-subtle">
                            {shift.assignedGender}
                          </span>
                        )}
                        {shiftGroup && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.2 rounded-md"
                            style={{
                              backgroundColor: `${shiftGroup.colorAccent || '#FF6C41'}15`,
                              color: shiftGroup.colorAccent || '#FF6C41'
                            }}
                          >
                            {shiftGroup.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-text-tertiary mt-0.5">
                        <span className="flex items-center gap-1 font-medium text-text-secondary">
                          <Calendar size={11} className="text-brand-primary" />
                          <span>
                            {shiftDate.toLocaleDateString(isKa ? 'ka-GE' : 'en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">{shift.eventTitle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Replacement preview or Dropdown */}
                  <div className="shrink-0 w-full sm:w-auto">
                    {mode === 'auto' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                        <RotateCw size={12} />
                        <span>{isKa ? 'ავტო-როტაცია' : 'Auto-rotate'}</span>
                      </span>
                    ) : (
                      <div className="w-full sm:w-[230px]">
                        <select
                          value={selectedReplacementId}
                          onChange={(e) => handleSelectReplacement(shiftKey, e.target.value)}
                          className={`w-full h-8.5 px-2 rounded-lg border text-xs text-text-primary focus:ring-1 outline-none transition-all cursor-pointer font-medium ${
                            !selectedReplacementId
                              ? 'border-amber-300 dark:border-amber-700 bg-amber-500/5 focus:border-amber-500'
                              : 'border-emerald-500/40 bg-emerald-500/5 focus:border-emerald-500 focus:ring-emerald-500'
                          }`}
                        >
                          <option value="">
                            {hasFree
                              ? (isKa ? `-- აირჩიეთ თავისუფალი წევრი (${freeCandidates.length}) --` : `-- Select free member (${freeCandidates.length}) --`)
                              : (isKa ? '-- ამ დღეს თავისუფალი წევრი არ არის --' : '-- No free member on this date --')}
                          </option>

                          {/* Strictly only free members on this date */}
                          {freeCandidates.map((cand) => (
                            <option key={cand.id} value={cand.id}>
                              {cand.firstName} {cand.lastName} ({cand.primarySkill})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
