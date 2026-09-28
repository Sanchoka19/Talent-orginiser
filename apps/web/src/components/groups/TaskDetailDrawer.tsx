'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Group } from '../../types/group';
import { Talent } from '../../types/talent';
import { InventoryRequirement, TaskRotationCycle } from '../../types/inventory';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { getTalentAvatar } from '../../utils/avatarUtils';
import {
  ArrowRightLeft,
  Check,
  X,
  Settings2,
  Sparkles
} from 'lucide-react';

interface TaskDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: InventoryRequirement | null;
  currentGroup: Group;
  getCycleLabel: (cycle?: TaskRotationCycle, customVal?: number, customUnit?: any) => string;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  isOpen,
  onClose,
  task,
  currentGroup,
  getCycleLabel
}) => {
  const { talents, schedule, swapDutyTalent, regenerateDutiesForEvent, updateGroup, formatTime } = useApp();
  const { language } = useLanguage();
  const toast = useToast();
  const { confirm } = useConfirm();
  const isKa = language === 'ka';

  // Group members
  const memberTalentIds = currentGroup?.memberTalentIds || [];
  const memberTalents = useMemo(() => {
    return talents.filter((t) => memberTalentIds.includes(t.id));
  }, [talents, memberTalentIds]);

  // Eligible members matching gender and active status
  const eligibleMembers = useMemo(() => {
    if (!task) return [];
    const filtered = memberTalents.filter((m) => {
      if (m.status !== 'Active') return false;
      if (task.assignedGender === 'Male Only') return m.gender === 'Male';
      if (task.assignedGender === 'Female Only') return m.gender === 'Female';
      return true;
    });
    return filtered.length > 0 ? filtered : memberTalents;
  }, [memberTalents, task]);

  // Find all scheduled shows for this group, sorted by date ascending
  // Filter scheduled shows for this group that fall in task validity range if specified
  const groupShows = useMemo(() => {
    if (!currentGroup?.id) return [];
    const all = schedule
      .filter((s) => s.groupId === currentGroup.id)
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

    if (task?.startDate || task?.endDate) {
      const inRange = all.filter((s) => {
        const sDate = s.startDateTime.split('T')[0];
        if (task.startDate && sDate < task.startDate) return false;
        if (task.endDate && sDate > task.endDate) return false;
        return true;
      });
      return inRange.length > 0 ? inRange : all;
    }
    return all;
  }, [schedule, currentGroup?.id, task?.startDate, task?.endDate]);

  // Selected show state (defaults to upcoming or first show)
  const [selectedShowId, setSelectedShowId] = useState<string>('');

  const currentShow = useMemo(() => {
    if (selectedShowId) {
      const found = groupShows.find((s) => s.id === selectedShowId);
      if (found) return found;
    }
    const now = Date.now();
    const upcoming = groupShows.find((s) => new Date(s.startDateTime).getTime() >= now);
    return upcoming || groupShows[0] || null;
  }, [groupShows, selectedShowId]);

  // Swap target state for individual show
  const [swapTargetTalentId, setSwapTargetTalentId] = useState<string | null>(null);
  const [selectedReplacementId, setSelectedReplacementId] = useState<string>('');

  // Initial rule values from task (explicit pool takes precedence over accidental single assignment)
  const isInitialPool = Boolean(task?.assignedTalentIds && task.assignedTalentIds.length > 1);
  const initialFixedTalentId = isInitialPool
    ? ''
    : (task?.assignedTalentId ||
      (task?.assignedTalentIds && task.assignedTalentIds.length === 1
        ? task.assignedTalentIds[0]
        : ''));
  const initialMode: 'rotation' | 'pool' | 'fixed' = initialFixedTalentId
    ? 'fixed'
    : (isInitialPool ? 'pool' : 'rotation');
  const initialPoolIds: string[] = isInitialPool ? (task?.assignedTalentIds || []) : [];

  // Staged rule state (safe, uncommitted until explicitly saved)
  const [stagedMode, setStagedMode] = useState<'rotation' | 'pool' | 'fixed'>(initialMode);
  const [stagedTalentId, setStagedTalentId] = useState<string>(initialFixedTalentId);
  const [stagedPoolIds, setStagedPoolIds] = useState<string[]>(initialPoolIds);

  // Sync staged state whenever task changes
  useEffect(() => {
    if (task) {
      const isP = Boolean(task.assignedTalentIds && task.assignedTalentIds.length > 1);
      const fixedId = isP
        ? ''
        : (task.assignedTalentId ||
          (task.assignedTalentIds && task.assignedTalentIds.length === 1
            ? task.assignedTalentIds[0]
            : ''));
      const mode: 'rotation' | 'pool' | 'fixed' = fixedId ? 'fixed' : (isP ? 'pool' : 'rotation');
      const pIds = isP ? (task.assignedTalentIds || []) : [];

      setStagedMode(mode);
      setStagedTalentId(fixedId);
      setStagedPoolIds(pIds);
      setSwapTargetTalentId(null);
      setSelectedReplacementId('');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  // Check if there are unsaved rule changes
  const isRuleDirty =
    stagedMode !== initialMode ||
    (stagedMode === 'fixed' && stagedTalentId !== initialFixedTalentId) ||
    (stagedMode === 'pool' && (
      stagedPoolIds.length !== initialPoolIds.length ||
      stagedPoolIds.some((id) => !initialPoolIds.includes(id))
    ));

  // Active candidate talents for rotation calculation
  const activeCandidateTalents = (() => {
    if (stagedMode === 'pool') {
      const pool = memberTalents.filter((m) => stagedPoolIds.includes(m.id));
      return pool.length > 0 ? pool : eligibleMembers;
    }
    return eligibleMembers;
  })();

  // Index of this show among all group shows
  const currentShowIndex = currentShow ? groupShows.findIndex((s) => s.id === currentShow.id) : 0;

  // Fallback / simulated rotation performer(s) based on duty interval
  const computedRotationTalentIds = (() => {
    if (activeCandidateTalents.length === 0) return [];
    const headcount = Math.max(1, task.requiredHeadcount || 1);
    const evDate = currentShow ? new Date(currentShow.startDateTime) : new Date();
    const baseDate = groupShows[0] ? new Date(groupShows[0].startDateTime) : evDate;
    const diffDays = Math.max(0, Math.floor((evDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)));
    const effIndex = Math.max(0, currentShowIndex);

    let step = effIndex;
    if (task.rotationCycle === 'weekly') {
      step = Math.floor(diffDays / 7);
    } else if (task.rotationCycle === 'monthly') {
      step = Math.max(0, (evDate.getFullYear() - baseDate.getFullYear()) * 12 + (evDate.getMonth() - baseDate.getMonth()));
    } else if (task.rotationCycle === 'custom') {
      const val = Math.max(1, task.customRotationValue || 2);
      if (task.customRotationUnit === 'day') {
        step = Math.floor(diffDays / val);
      } else if (task.customRotationUnit === 'week') {
        step = Math.floor(diffDays / (val * 7));
      } else {
        step = Math.floor(effIndex / val);
      }
    } else if (task.rotationCycle === 'fixed') {
      step = 0;
    }

    const startIndex = (step * headcount) % activeCandidateTalents.length;
    const picked: string[] = [];
    for (let i = 0; i < headcount; i++) {
      const idx = (startIndex + i) % activeCandidateTalents.length;
      picked.push(activeCandidateTalents[idx].id);
    }
    return picked;
  })();

  // Duty assignment in current show
  const currentDuty = currentShow?.dutyAssignments?.find(
    (d) => d.requirementId === task.id || (d.itemName === task.itemName && (!task.position || d.position === task.position))
  );

  // Effective assigned talent IDs for the active show:
  const effectiveAssignedTalentIds: string[] = (() => {
    // 1. Manual show override takes precedence for this individual show
    if (currentDuty?.manualOverrides && Object.keys(currentDuty.manualOverrides).length > 0) {
      return currentDuty.assignedTalentIds;
    }
    // 2. Fixed performer staged/saved
    if (stagedMode === 'fixed') {
      const activeFixedId = stagedTalentId || initialFixedTalentId;
      if (activeFixedId) return [activeFixedId];
    }
    // 3. Existing show assignment if rule has not been changed
    if (!isRuleDirty && currentDuty && currentDuty.assignedTalentIds && currentDuty.assignedTalentIds.length > 0) {
      return currentDuty.assignedTalentIds;
    }
    // 4. Computed interval rotation
    return computedRotationTalentIds;
  })();

  const assignedTalents = effectiveAssignedTalentIds
    .map((id) => talents.find((t) => t.id === id))
    .filter(Boolean) as Talent[];

  // Eligible replacement candidates for swap (excluding currently assigned)
  const swapCandidates = memberTalents.filter((t) => {
    if (!swapTargetTalentId) return false;
    if (t.id === swapTargetTalentId) return false;
    if (effectiveAssignedTalentIds.includes(t.id)) return false;
    return true;
  });

  // Save the rule with Confirmation Modal
  const handleSaveRule = () => {
    if (stagedMode === 'fixed' && !stagedTalentId) {
      toast.error(isKa ? 'გთხოვთ აირჩიოთ მუდმივი შემსრულებელი' : 'Please select a fixed performer');
      return;
    }
    if (stagedMode === 'pool' && stagedPoolIds.length === 0) {
      toast.error(isKa ? 'გთხოვთ დაამატოთ მინიმუმ ერთი წევრი პულში' : 'Please add at least one member to the pool');
      return;
    }

    const chosenTalent = stagedTalentId ? talents.find((t) => t.id === stagedTalentId) : null;
    const performerName = chosenTalent ? `${chosenTalent.firstName} ${chosenTalent.lastName}` : '';

    confirm({
      title: isKa ? 'დავალების რეჟიმის შეცვლა' : 'Change Assignment Mode',
      message:
        stagedMode === 'rotation'
          ? isKa
            ? 'რეჟიმის შეცვლა ავტომატურად გადაანაწილებს მომავალ შოუებს დასის წევრებს შორის. ნამდვილად გსურთ როტაციაზე გადართვა?\n\n(წარსულ და დასრულებულ შოუებს ეს არ შეეხება)'
            : 'Switching mode will redistribute future shows fairly among cast members. Do you want to proceed?\n\n(Past and completed shows will remain untouched)'
          : stagedMode === 'pool'
            ? isKa
              ? `არჩეული ${stagedPoolIds.length} შემსრულებელი მონაცვლეობით გადააწილებს მომავალ შოუებს. ნამდვილად გსურთ წესის შენახვა?`
              : `Selected pool of ${stagedPoolIds.length} performers will rotate on future shows. Save rule?`
            : isKa
              ? `„${performerName}“ დაინიშნება ყველა მომავალ შოუზე. ნამდვილად გსურთ წესის შენახვა?\n\n(წარსულ და დასრულებულ შოუებს ეს არ შეეხება)`
              : `"${performerName}" will be assigned to all future shows. Save rule?\n\n(Past and completed shows will not be affected)`,
      confirmLabel: isKa ? 'წესის შენახვა' : 'Save Rule',
      cancelLabel: isKa ? 'გაუქმება' : 'Cancel',
      variant: 'warning',
      icon: 'refresh',
      onConfirm: () => {
        const updatedReqs = (currentGroup.inventoryRequirements || []).map((req) => {
          if (req.id !== task.id) return req;
          return {
            ...req,
            assignedTalentId: stagedMode === 'fixed' ? stagedTalentId : undefined,
            assignedTalentIds:
              stagedMode === 'fixed' && stagedTalentId
                ? [stagedTalentId]
                : stagedMode === 'pool'
                  ? stagedPoolIds
                  : undefined
          };
        });

        // Also sync specialDutyTasks
        const updatedSpecialTasks = (currentGroup.specialDutyTasks || []).map((st) => {
          if (st.id === task.id || (task.parentTaskId && st.id === task.parentTaskId)) {
            return {
              ...st,
              assignedTalentId: stagedMode === 'fixed' ? stagedTalentId : undefined,
              assignedTalentIds:
                stagedMode === 'fixed' && stagedTalentId
                  ? [stagedTalentId]
                  : stagedMode === 'pool'
                    ? stagedPoolIds
                    : undefined
            };
          }
          return st;
        });

        updateGroup(currentGroup.id, {
          inventoryRequirements: updatedReqs,
          specialDutyTasks: updatedSpecialTasks
        });

        toast.success(
          isKa
            ? stagedMode === 'rotation'
              ? 'წესი გადავიდა ავტომატურ როტაციაზე და მომავალი შოუები გადაანგარიშდა'
              : stagedMode === 'pool'
                ? `განახლდა შემსრულებელთა პული (${stagedPoolIds.length})`
                : `მუდმივ შემსრულებლად დაინიშნა: ${performerName}`
            : stagedMode === 'rotation'
              ? 'Switched to auto-rotation and recalculated future shows'
              : stagedMode === 'pool'
                ? `Updated performer pool (${stagedPoolIds.length})`
                : `Fixed performer set: ${performerName}`
        );
      }
    });
  };

  // Discard staged changes
  const handleDiscardRuleChanges = () => {
    setStagedMode(initialMode);
    setStagedTalentId(initialFixedTalentId);
    setStagedPoolIds(initialPoolIds);
  };

  // Handle Execute Swap for specific show
  const handleExecuteSwap = () => {
    if (!currentShow || !swapTargetTalentId || !selectedReplacementId) return;

    swapDutyTalent(currentShow.id, task.id, swapTargetTalentId, selectedReplacementId);

    const replacement = talents.find((t) => t.id === selectedReplacementId);
    toast.success(
      isKa
        ? `მორიგეობა გადაეცა: ${replacement ? `${replacement.firstName} ${replacement.lastName}` : 'ახალ შემსრულებელს'}`
        : `Shift reassigned to ${replacement ? `${replacement.firstName} ${replacement.lastName}` : 'performer'}`
    );

    setSwapTargetTalentId(null);
    setSelectedReplacementId('');
  };

  const handleRegenerate = () => {
    if (!currentShow) return;
    regenerateDutiesForEvent(currentShow.id);
    toast.success(isKa ? 'მორიგეობა დაგენერირდა' : 'Duty assigned');
  };

  const cycleText = getCycleLabel(task.rotationCycle, task.customRotationValue, task.customRotationUnit);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.itemName}
      subtitle={
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-text-secondary mt-1">
          <span className="font-medium text-brand-primary">
            {task.category === 'special_task'
              ? (isKa ? 'სპეციალური დავალება' : 'Special Task')
              : (isKa ? 'შოუ ინვენტარი' : 'Stage Equipment')}
          </span>
          {task.position && (
            <>
              <span className="opacity-40">•</span>
              <span className="font-medium text-text-primary">
                {task.position}
              </span>
            </>
          )}
          <span className="opacity-40">•</span>
          <span>{cycleText || (isKa ? 'ყოველ შოუზე' : 'Every Show')}</span>
          <span className="opacity-40">•</span>
          <span>
            {isKa
              ? `${task.requiredHeadcount || 1} მორიგე`
              : `${task.requiredHeadcount || 1} duty`}
          </span>
          {task.assignedGender && task.assignedGender !== 'Any' && (
            <>
              <span className="opacity-40">•</span>
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {task.assignedGender === 'Male Only'
                  ? (isKa ? 'მხოლოდ კაცები' : 'Male Only')
                  : (isKa ? 'მხოლოდ ქალები' : 'Female Only')}
              </span>
            </>
          )}
          {(task.startDate || task.endDate) && (
            <>
              <span className="opacity-40">•</span>
              <span className="font-medium text-text-primary">
                {task.startDate} {task.endDate ? `– ${task.endDate}` : ''}
              </span>
            </>
          )}
        </div>
      }
      maxWidth="580px"
      position="side"
      zIndex={1250}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs">
            {isRuleDirty ? (
              <span className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{isKa ? 'შეუნახავი ცვლილება წესში' : 'Unsaved rule change'}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isKa ? 'წესი ძალაშია მომავალ შოუებზე' : 'Rule active on future shows'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isRuleDirty && (
              <>
                <button
                  type="button"
                  onClick={handleDiscardRuleChanges}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-surface-secondary border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-all cursor-pointer"
                >
                  {isKa ? 'გაუქმება' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={
                    (stagedMode === 'fixed' && !stagedTalentId) ||
                    (stagedMode === 'pool' && stagedPoolIds.length === 0)
                  }
                  onClick={handleSaveRule}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer ${(stagedMode === 'fixed' && !stagedTalentId) ||
                      (stagedMode === 'pool' && stagedPoolIds.length === 0)
                      ? 'bg-surface-tertiary text-text-tertiary cursor-not-allowed border border-border-subtle'
                      : 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-glow'
                    }`}
                >
                  <Check size={13} strokeWidth={2.5} />
                  <span>{isKa ? 'წესის შენახვა' : 'Save Rule'}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-surface-secondary border border-border-subtle text-text-primary hover:bg-surface-tertiary transition-all cursor-pointer"
            >
              {isKa ? 'დახურვა' : 'Close'}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6 py-2">
        {/* ════════════════════════════════════════════════════════════════════
            1. ზედა ნაწილი: დავალების ზოგადი წესი (Configuration)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-3 pb-6 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary uppercase tracking-wider">
              <Settings2 size={15} className="text-brand-primary" />
              <span>{isKa ? 'დანიშვნის რეჟიმი' : 'Assignment Mode'}</span>
            </div>

            {isRuleDirty && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                {isKa ? 'შეცვლილია' : 'Modified'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Option 1: ავტომატური როტაცია (მთელი დასი) */}
            <div
              onClick={() => {
                setStagedMode('rotation');
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 select-none ${stagedMode === 'rotation'
                  ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary shadow-2xs'
                  : 'border-border-subtle bg-surface hover:border-border-medium hover:bg-surface-secondary/40'
                }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="task-mode-rotation"
                  name="taskAssignmentMode"
                  checked={stagedMode === 'rotation'}
                  onChange={() => {
                    setStagedMode('rotation');
                  }}
                  className="w-3.5 h-3.5 text-brand-primary border-border-medium focus:ring-brand-primary cursor-pointer accent-brand-primary"
                />
                <label
                  htmlFor="task-mode-rotation"
                  className="text-xs font-bold text-text-primary cursor-pointer m-0"
                >
                  {isKa ? 'ავტო-როტაცია (ყველა)' : 'Auto-Rotation (All)'}
                </label>
              </div>
              <p className="text-[10px] text-text-secondary leading-normal pl-5.5 m-0">
                {isKa
                  ? 'სისტემა ანაწილებს მთელ დასზე'
                  : 'Rotates across entire cast'}
              </p>
            </div>

            {/* Option 2: შერჩეული პული */}
            <div
              onClick={() => {
                setStagedMode('pool');
                if (stagedPoolIds.length === 0 && eligibleMembers.length > 0) {
                  setStagedPoolIds(eligibleMembers.slice(0, 3).map((m) => m.id));
                }
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 select-none ${stagedMode === 'pool'
                  ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary shadow-2xs'
                  : 'border-border-subtle bg-surface hover:border-border-medium hover:bg-surface-secondary/40'
                }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="task-mode-pool"
                  name="taskAssignmentMode"
                  checked={stagedMode === 'pool'}
                  onChange={() => {
                    setStagedMode('pool');
                    if (stagedPoolIds.length === 0 && eligibleMembers.length > 0) {
                      setStagedPoolIds(eligibleMembers.slice(0, 3).map((m) => m.id));
                    }
                  }}
                  className="w-3.5 h-3.5 text-brand-primary border-border-medium focus:ring-brand-primary cursor-pointer accent-brand-primary"
                />
                <label
                  htmlFor="task-mode-pool"
                  className="text-xs font-bold text-text-primary cursor-pointer m-0"
                >
                  {isKa ? `შერჩეული პული (${stagedPoolIds.length})` : `Selected Pool (${stagedPoolIds.length})`}
                </label>
              </div>
              <p className="text-[10px] text-text-secondary leading-normal pl-5.5 m-0">
                {isKa
                  ? 'როტაცია მხოლოდ ამ ჯგუფში'
                  : 'Rotates only in this pool'}
              </p>
            </div>

            {/* Option 3: მუდმივი შემსრულებელი (ფიქსირებული) */}
            <div
              onClick={() => {
                setStagedMode('fixed');
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 select-none ${stagedMode === 'fixed'
                  ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary shadow-2xs'
                  : 'border-border-subtle bg-surface hover:border-border-medium hover:bg-surface-secondary/40'
                }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="task-mode-fixed"
                  name="taskAssignmentMode"
                  checked={stagedMode === 'fixed'}
                  onChange={() => {
                    setStagedMode('fixed');
                  }}
                  className="w-3.5 h-3.5 text-brand-primary border-border-medium focus:ring-brand-primary cursor-pointer accent-brand-primary"
                />
                <label
                  htmlFor="task-mode-fixed"
                  className="text-xs font-bold text-text-primary cursor-pointer m-0"
                >
                  {isKa ? 'მუდმივი (ფიქსირებული)' : 'Fixed Performer'}
                </label>
              </div>
              <p className="text-[10px] text-text-secondary leading-normal pl-5.5 m-0">
                {isKa
                  ? 'ერთი ადამიანი ყველა შოუზე'
                  : 'Single assigned talent'}
              </p>
            </div>
          </div>



          {/* When Fixed Mode is selected: Performer Dropdown Picker */}
          {stagedMode === 'fixed' && (
            <div className="p-3.5 rounded-xl bg-surface-secondary/60 border border-brand-primary/20 animate-in fade-in duration-150 flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
                <span>{isKa ? 'აირჩიეთ მუდმივი შემსრულებელი:' : 'Select fixed performer:'}</span>
                {!stagedTalentId && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    {isKa ? 'სავალდებულოა' : 'Required'}
                  </span>
                )}
              </div>

              <select
                value={stagedTalentId}
                onChange={(e) => setStagedTalentId(e.target.value)}
                className="w-full text-xs rounded-lg border border-border-medium bg-surface px-3 py-2.5 text-text-primary font-medium outline-none focus:border-brand-primary shadow-xs cursor-pointer"
              >
                <option value="" disabled>
                  {isKa ? '— აირჩიეთ ტალანტი სიიდან —' : '— Select talent from list —'}
                </option>
                {eligibleMembers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.primarySkill || (isKa ? 'შემსრულებელი' : 'Performer')})
                  </option>
                ))}
              </select>
            </div>
          )}


        </div>

        {/* ════════════════════════════════════════════════════════════════════
            2. ქვედა ნაწილი: კონკრეტული შოუები (Execution)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5 m-0">
              {isKa ? 'შოუების განრიგი:' : 'Show Schedule:'}
            </h4>

            {groupShows.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-secondary/50 border border-dashed border-border-medium text-center text-xs text-text-secondary">
                {isKa ? 'ამ ჯგუფისთვის შოუები ჯერ დაგეგმილი არ არის' : 'No shows scheduled yet'}
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {groupShows.map((show) => {
                  const isSelected = (currentShow?.id || '') === show.id;
                  const showDate = new Date(show.startDateTime);
                  const dateStr = showDate.toLocaleDateString(isKa ? 'ka-GE' : 'en-US', {
                    day: 'numeric',
                    month: 'short'
                  });

                  return (
                    <button
                      key={show.id}
                      type="button"
                      onClick={() => {
                        setSelectedShowId(show.id);
                        setSwapTargetTalentId(null);
                        setSelectedReplacementId('');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all border cursor-pointer font-medium ${isSelected
                          ? 'bg-brand-primary text-white border-brand-primary shadow-xs font-semibold'
                          : 'bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-medium'
                        }`}
                    >
                      {dateStr}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {currentShow && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span className="font-bold text-text-primary">
                  {isKa ? 'ამ შოუზე მორიგეა:' : 'Assigned to this show:'}
                </span>
                <span className="text-[11px] font-mono text-text-tertiary">
                  {new Date(currentShow.startDateTime).toLocaleDateString(isKa ? 'ka-GE' : 'en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}{' '}
                  • {formatTime(currentShow.startDateTime)}
                </span>
              </div>

              {/* ── ROTATION MODE: show all eligible members ── */}
              {stagedMode === 'rotation' ? (
                <div className="flex flex-col gap-2">
                  {eligibleMembers.map((talent) => {
                    const isComputed = computedRotationTalentIds.includes(talent.id);
                    const isOverridden =
                      currentDuty?.manualOverrides &&
                      Object.values(currentDuty.manualOverrides).includes(talent.id);
                    const isTargetForSwap = swapTargetTalentId === talent.id;

                    return (
                      <div key={talent.id} className="flex flex-col gap-2">
                        <div
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${isComputed
                              ? 'border-brand-primary/50 bg-brand-primary/5 ring-1 ring-brand-primary/30 shadow-xs'
                              : isTargetForSwap
                                ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary shadow-xs'
                                : 'border-border-subtle bg-surface shadow-2xs opacity-60'
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={getTalentAvatar(talent)}
                              alt={talent.firstName}
                              className={`w-10 h-10 rounded-full object-cover shrink-0 shadow-xs ${isComputed ? 'border-2 border-brand-primary/40' : 'border border-border-subtle'
                                }`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="text-xs font-bold text-text-primary truncate m-0">
                                  {talent.firstName} {talent.lastName}
                                </h5>
                                {isComputed && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                                    {isKa ? 'მორიგე' : 'On Duty'}
                                  </span>
                                )}
                                {isOverridden && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                    {isKa ? 'შეცვლილი' : 'Overridden'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[0.675rem] text-text-secondary truncate mt-0.5 m-0">
                                {talent.primarySkill || (isKa ? 'შემსრულებელი' : 'Performer')}
                              </p>
                            </div>
                          </div>

                          {isComputed && (
                            <button
                              type="button"
                              onClick={() => {
                                if (isTargetForSwap) {
                                  setSwapTargetTalentId(null);
                                  setSelectedReplacementId('');
                                } else {
                                  setSwapTargetTalentId(talent.id);
                                  setSelectedReplacementId('');
                                }
                              }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${isTargetForSwap
                                  ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                                  : 'bg-surface-secondary border-border-subtle text-text-primary hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/30'
                                }`}
                            >
                              <ArrowRightLeft size={12} />
                              <span>{isTargetForSwap ? (isKa ? 'გაუქმება' : 'Cancel') : (isKa ? 'შეცვლა ⇄' : 'Swap ⇄')}</span>
                            </button>
                          )}
                        </div>

                        {isTargetForSwap && (
                          <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-brand-primary/30 animate-in fade-in duration-150 flex flex-col gap-2.5">
                            <div className="text-xs font-semibold text-text-primary">
                              {isKa ? 'აირჩიეთ შემცვლელი ამ კონკრეტული შოუსთვის:' : 'Choose replacement for this show:'}
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedReplacementId}
                                onChange={(e) => setSelectedReplacementId(e.target.value)}
                                className="flex-1 text-xs rounded-lg border border-border-medium bg-surface px-3 py-2 text-text-primary font-medium outline-none focus:border-brand-primary shadow-xs cursor-pointer"
                              >
                                <option value="" disabled>{isKa ? '— შემცვლელი —' : '— Select replacement —'}</option>
                                {swapCandidates.map((cand) => (
                                  <option key={cand.id} value={cand.id}>
                                    {cand.firstName} {cand.lastName} ({cand.primarySkill || (isKa ? 'შემსრულებელი' : 'Performer')})
                                  </option>
                                ))}
                              </select>
                              <button type="button" disabled={!selectedReplacementId} onClick={handleExecuteSwap}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 shrink-0 ${selectedReplacementId ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-xs cursor-pointer' : 'bg-surface-tertiary text-text-tertiary border border-border-subtle cursor-not-allowed'
                                  }`}>
                                <Check size={13} />
                                <span>{isKa ? 'დადასტურება' : 'Confirm'}</span>
                              </button>
                              <button type="button" onClick={() => { setSwapTargetTalentId(null); setSelectedReplacementId(''); }}
                                className="p-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface border border-border-subtle cursor-pointer" title={isKa ? 'გაუქმება' : 'Cancel'}>
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {eligibleMembers.length === 0 && (
                    <div className="p-4 rounded-xl border border-dashed border-border-medium bg-surface-secondary/40 text-center text-xs text-text-secondary">
                      {isKa ? 'დასის შესაბამისი წევრი ვერ მოიძებნა' : 'No eligible cast members found'}
                    </div>
                  )}
                </div>
              ) : stagedMode === 'pool' ? (
                /* ── POOL MODE: show pool members list + add member inline ── */
                <div className="flex flex-col gap-3">
                  {stagedPoolIds.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-border-medium bg-surface-secondary/40 text-center text-xs text-text-secondary">
                      {isKa ? 'პულში წევრები არ არის' : 'No members in pool'}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {stagedPoolIds.map((id) => {
                        const talent = talents.find((t) => t.id === id);
                        if (!talent) return null;
                        const isComputed = computedRotationTalentIds.includes(id);
                        const isTargetForSwap = swapTargetTalentId === id;
                        return (
                          <div key={id} className="flex flex-col gap-2">
                            <div className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${isComputed
                                ? 'border-brand-primary/50 bg-brand-primary/5 ring-1 ring-brand-primary/30 shadow-xs'
                                : isTargetForSwap
                                  ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary shadow-xs'
                                  : 'border-border-subtle bg-surface shadow-2xs opacity-70'
                              }`}>
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={getTalentAvatar(talent)} alt={talent.firstName}
                                  className={`w-10 h-10 rounded-full object-cover shrink-0 shadow-xs ${isComputed ? 'border-2 border-brand-primary/40' : 'border border-border-subtle'
                                    }`} />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h5 className="text-xs font-bold text-text-primary truncate m-0">{talent.firstName} {talent.lastName}</h5>
                                    {isComputed && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                                        {isKa ? 'მორიგე' : 'On Duty'}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[0.675rem] text-text-secondary truncate mt-0.5 m-0">{talent.primarySkill || (isKa ? 'შემსრულებელი' : 'Performer')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {isComputed && (
                                  <button type="button"
                                    onClick={() => { if (isTargetForSwap) { setSwapTargetTalentId(null); setSelectedReplacementId(''); } else { setSwapTargetTalentId(id); setSelectedReplacementId(''); } }}
                                    className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${isTargetForSwap ? 'bg-brand-primary text-white border-brand-primary' : 'bg-surface-secondary border-border-subtle text-text-primary hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/30'
                                      }`}>
                                    <ArrowRightLeft size={11} />
                                    <span>{isTargetForSwap ? (isKa ? 'გაუქმება' : 'Cancel') : (isKa ? 'შეცვლა ⇄' : 'Swap ⇄')}</span>
                                  </button>
                                )}
                                <button type="button"
                                  onClick={() => setStagedPoolIds((prev) => prev.filter((pId) => pId !== id))}
                                  className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer border border-transparent hover:border-danger/20"
                                  title={isKa ? 'პულიდან ამოშლა' : 'Remove from pool'}>
                                  <X size={13} />
                                </button>
                              </div>
                            </div>
                            {isTargetForSwap && (
                              <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-brand-primary/30 animate-in fade-in duration-150 flex flex-col gap-2.5">
                                <div className="text-xs font-semibold text-text-primary">
                                  {isKa ? 'აირჩიეთ შემცვლელი ამ კონკრეტული შოუსთვის:' : 'Choose replacement for this show:'}
                                </div>
                                <div className="flex items-center gap-2">
                                  <select value={selectedReplacementId} onChange={(e) => setSelectedReplacementId(e.target.value)}
                                    className="flex-1 text-xs rounded-lg border border-border-medium bg-surface px-3 py-2 text-text-primary font-medium outline-none focus:border-brand-primary shadow-xs cursor-pointer">
                                    <option value="" disabled>{isKa ? '— შემცვლელი —' : '— Select replacement —'}</option>
                                    {swapCandidates.map((cand) => (
                                      <option key={cand.id} value={cand.id}>{cand.firstName} {cand.lastName} ({cand.primarySkill || (isKa ? 'შემსრულებელი' : 'Performer')})</option>
                                    ))}
                                  </select>
                                  <button type="button" disabled={!selectedReplacementId} onClick={handleExecuteSwap}
                                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 shrink-0 ${selectedReplacementId ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-xs cursor-pointer' : 'bg-surface-tertiary text-text-tertiary border border-border-subtle cursor-not-allowed'
                                      }`}>
                                    <Check size={13} /><span>{isKa ? 'დადასტურება' : 'Confirm'}</span>
                                  </button>
                                  <button type="button" onClick={() => { setSwapTargetTalentId(null); setSelectedReplacementId(''); }}
                                    className="p-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface border border-border-subtle cursor-pointer" title={isKa ? 'გაუქმება' : 'Cancel'}>
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add member to pool inline */}
                  {eligibleMembers.filter((m) => !stagedPoolIds.includes(m.id)).length > 0 && (
                    <select value="" onChange={(e) => { if (e.target.value) setStagedPoolIds((prev) => [...prev, e.target.value]); }}
                      className="w-full text-xs rounded-lg border border-border-medium bg-surface px-3 py-2 text-text-secondary font-medium outline-none focus:border-brand-primary cursor-pointer shadow-2xs">
                      <option value="">{isKa ? '+ დასის წევრის დამატება პულში...' : '+ Add group member to pool...'}</option>
                      {eligibleMembers.filter((m) => !stagedPoolIds.includes(m.id)).map((t) => (
                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.primarySkill || (isKa ? 'შემსრულებელი' : 'Performer')})</option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                /* ── FIXED MODE: original single-talent card view ── */
                assignedTalents.length === 0 ? (
                  <div className="p-5 rounded-xl border border-dashed border-border-medium bg-surface-secondary/40 text-center flex flex-col items-center justify-center gap-2">
                    <p className="text-xs text-text-secondary font-medium m-0">
                      {isKa ? 'ამ შოუზე მორიგე ჯერ არ არის დანიშნული' : 'No performer assigned for this show'}
                    </p>
                    <button type="button" onClick={handleRegenerate}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover shadow-xs cursor-pointer inline-flex items-center gap-1.5">
                      <Sparkles size={12} />
                      <span>{isKa ? 'მორიგის დანიშვნა' : 'Assign Performer'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {assignedTalents.map((talent) => {
                      const isTargetForSwap = swapTargetTalentId === talent.id;
                      const isOverridden = currentDuty?.manualOverrides && Object.values(currentDuty.manualOverrides).includes(talent.id);
                      return (
                        <div key={talent.id} className="flex flex-col gap-2">
                          <div className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3.5 ${isTargetForSwap ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary shadow-xs' : 'border-border-subtle bg-surface shadow-2xs hover:border-border-medium'
                            }`}>
                            <div className="flex items-center gap-3.5 min-w-0">
                              <img src={getTalentAvatar(talent)} alt={talent.firstName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-brand-primary/25 shrink-0 shadow-xs" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="text-sm font-bold text-text-primary truncate m-0">{talent.firstName} {talent.lastName}</h5>
                                  {isOverridden && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                      {isKa ? 'ხელით შეცვლილი' : 'Overridden'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-brand-primary font-medium truncate mt-0.5 m-0">
                                  {talent.primarySkill || (isKa ? 'შემსრულებელი' : 'Performer')}
                                </p>
                              </div>
                            </div>
                            <button type="button"
                              onClick={() => { if (isTargetForSwap) { setSwapTargetTalentId(null); setSelectedReplacementId(''); } else { setSwapTargetTalentId(talent.id); setSelectedReplacementId(''); } }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${isTargetForSwap ? 'bg-brand-primary text-white border-brand-primary shadow-xs' : 'bg-surface-secondary border-border-subtle text-text-primary hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/30'
                                }`}>
                              <ArrowRightLeft size={13} />
                              <span>{isTargetForSwap ? (isKa ? 'გაუქმება' : 'Cancel') : (isKa ? 'შეცვლა ⇄' : 'Swap ⇄')}</span>
                            </button>
                          </div>
                          {isTargetForSwap && (
                            <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-brand-primary/30 animate-in fade-in duration-150 flex flex-col gap-2.5">
                              <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
                                <span>{isKa ? 'აირჩიეთ შემცვლელი ამ კონკრეტული შოუსთვის:' : 'Choose replacement for this show:'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <select value={selectedReplacementId} onChange={(e) => setSelectedReplacementId(e.target.value)}
                                  className="flex-1 text-xs rounded-lg border border-border-medium bg-surface px-3 py-2 text-text-primary font-medium outline-none focus:border-brand-primary shadow-xs cursor-pointer">
                                  <option value="" disabled>{isKa ? '— შემცვლელი —' : '— Select replacement —'}</option>
                                  {swapCandidates.map((cand) => (
                                    <option key={cand.id} value={cand.id}>{cand.firstName} {cand.lastName} ({cand.primarySkill || (isKa ? 'შემსრულებელი' : 'Performer')})</option>
                                  ))}
                                </select>
                                <button type="button" disabled={!selectedReplacementId} onClick={handleExecuteSwap}
                                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 shrink-0 ${selectedReplacementId ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-xs cursor-pointer' : 'bg-surface-tertiary text-text-tertiary border border-border-subtle cursor-not-allowed'
                                    }`}>
                                  <Check size={13} /><span>{isKa ? 'დადასტურება' : 'Confirm'}</span>
                                </button>
                                <button type="button" onClick={() => { setSwapTargetTalentId(null); setSelectedReplacementId(''); }}
                                  className="p-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface border border-border-subtle cursor-pointer" title={isKa ? 'გაუქმება' : 'Cancel'}>
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
