'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ShowEvent } from '../../types/schedule';
import { DutyAssignment } from '../../types/duty';
import { COMMON_SPECIAL_TASKS } from '../../types/inventory';
import { Modal } from '../common/Modal';
import { DutySwapModal } from './DutySwapModal';
import { getTalentAvatar } from '../../utils/avatarUtils';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  MapPin,
  Users,
  RotateCw,
  Trash2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ArrowRightLeft,
  Bus,
  CheckCircle2,
  LockKeyhole,
  Box,
  ClipboardList
} from 'lucide-react';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ShowEvent | null;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const { groups, venues, talents, deleteShowEvent, regenerateDutiesForEvent, formatTime, formatTimeRange } = useApp();
  const { language, t } = useLanguage();
  const { confirm } = useConfirm();
  const toast = useToast();
  const isKa = language === 'ka';

  const [swapTarget, setSwapTarget] = useState<{
    duty: DutyAssignment;
    talentId: string;
  } | null>(null);

  const [activeDutyTab, setActiveDutyTab] = useState<'inventory' | 'tasks'>('inventory');

  const group = groups.find((g) => g.id === event?.groupId);
  const venue = venues.find((v) => v.id === event?.hotelId);

  // Categorize duties into inventory vs special tasks
  const getDutyCategory = (duty: DutyAssignment): 'inventory' | 'special_task' => {
    if (duty.category === 'special_task') return 'special_task';
    if (duty.category === 'inventory') return 'inventory';
    const matchedReq = group?.inventoryRequirements?.find(
      (r) => r.id === duty.requirementId || r.itemName.toLowerCase() === duty.itemName.toLowerCase()
    );
    if (matchedReq?.category === 'special_task') return 'special_task';
    if (COMMON_SPECIAL_TASKS.some((taskName) => taskName.toLowerCase() === duty.itemName.toLowerCase())) {
      return 'special_task';
    }
    return 'inventory';
  };

  const inventoryDuties = useMemo(() => {
    if (!event) return [];
    return (event.dutyAssignments || []).filter((d) => getDutyCategory(d) === 'inventory');
  }, [event?.dutyAssignments, group]);

  const taskDuties = useMemo(() => {
    if (!event) return [];
    return (event.dutyAssignments || []).filter((d) => getDutyCategory(d) === 'special_task');
  }, [event?.dutyAssignments, group]);

  // Auto-switch to tab that has items if one is empty
  useEffect(() => {
    if (inventoryDuties.length === 0 && taskDuties.length > 0) {
      setActiveDutyTab('tasks');
    } else if (inventoryDuties.length > 0 && taskDuties.length === 0) {
      setActiveDutyTab('inventory');
    }
  }, [event?.id, inventoryDuties.length, taskDuties.length]);

  if (!event) return null;

  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);
  const localeStr = language === 'ka' ? 'ka-GE' : 'en-US';

  // Determine if event is in the past (read-only mode)
  const isPast = endDate < new Date();

  // Formatted date string (e.g. პარ, 25 სექ. 2026)
  const formattedDate = startDate.toLocaleDateString(localeStr, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Lobby / Gathering time
  const lobbyTime =
    event.lobbyTime ||
    (() => {
      const startH = startDate.getHours();
      const startM = startDate.getMinutes();
      const travel = venue?.travelTimeMinutes ?? 45;
      const totalM = (startH * 60 + startM - travel + 1440) % 1440;
      return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(
        totalM % 60
      ).padStart(2, '0')}`;
    })();

  // Show duration calculation
  const durationMinutes = Math.max(
    0,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
  );
  const durationHours = Math.floor(durationMinutes / 60);
  const remainingMinutes = durationMinutes % 60;
  let durationStr = '';
  if (durationHours > 0 && remainingMinutes > 0) {
    durationStr = isKa
      ? `${durationHours} სთ ${remainingMinutes} წთ`
      : language === 'tr'
      ? `${durationHours} sa ${remainingMinutes} dk`
      : `${durationHours}h ${remainingMinutes}m`;
  } else if (durationHours > 0) {
    durationStr = isKa
      ? `${durationHours} სთ`
      : language === 'tr'
      ? `${durationHours} sa`
      : `${durationHours}h`;
  } else if (durationMinutes > 0) {
    durationStr = isKa
      ? `${durationMinutes} წთ`
      : language === 'tr'
      ? `${durationMinutes} dk`
      : `${durationMinutes}m`;
  }

  const handleRegenerate = () => {
    confirm({
      title: language === 'ka' ? 'როტაციის გადაგენერირება' : 'Regenerate Duties',
      message: language === 'ka'
        ? 'ხელახლა დაგენერირდეს როტაციის მორიგეობები სამართლიანი ალგორითმით?'
        : 'Regenerate inventory and duty assignments using the fair distribution algorithm?',
      itemName: event.title,
      confirmLabel: language === 'ka' ? 'გადაგენერირება' : 'Regenerate',
      variant: 'info',
      icon: 'refresh',
      onConfirm: () => {
        regenerateDutiesForEvent(event.id);
        toast.success(
          isKa
            ? 'მორიგეობები წარმატებით გადანაწილდა ხელახლა'
            : 'Fair duty rotation regenerated successfully'
        );
      }
    });
  };

  const handleDelete = () => {
    confirm({
      title: language === 'ka' ? 'შოუს გაუქმება' : 'Cancel Show',
      message: language === 'ka'
        ? 'ნამდვილად გსურთ ამ შოუს გაუქმება? კალენდრიდან და როტაციებიდან მორიგეობები გაუქმდება.'
        : `Are you sure you want to cancel the show "${event.title}"?`,
      itemName: event.title,
      confirmLabel: language === 'ka' ? 'შოუს გაუქმება' : 'Cancel Show',
      variant: 'danger',
      onConfirm: () => {
        deleteShowEvent(event.id);
        toast.success(
          isKa
            ? `შოუ „${event.title}“ წარმატებით გაუქმდა`
            : `Show "${event.title}" cancelled successfully`
        );
        onClose();
      }
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={event.title}
        subtitle={t('event_detail_sub')}
        maxWidth="680px"
        position="side"
        footer={
          <div className="flex items-center justify-between w-full flex-wrap gap-2.5">
            {isPast ? (
              /* Read-only footer for past events */
              <>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <LockKeyhole className="w-3.5 h-3.5" />
                  <span>{isKa ? 'გასული შოუ — რედაქტირება შეუძლებელია' : 'Past show — read only'}</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-pill text-sm font-medium bg-brand-primary text-text-inverse shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none"
                >
                  {t('close')}
                </button>
              </>
            ) : (
              /* Normal footer for upcoming events */
              <>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface text-danger hover:bg-danger-light hover:border-danger-border transition-all duration-150 cursor-pointer outline-none"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {t('cancel_show')}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer outline-none"
                    title="Re-run fair random rotation"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> {t('regenerate_fair_duties')}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center px-5 py-2 rounded-pill text-sm font-medium bg-brand-primary text-text-inverse shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none"
                  >
                    {t('close')}
                  </button>
                </div>
              </>
            )}
          </div>
        }
      >
        {/* Completed banner for past events */}
        {isPast && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-md bg-status-active-bg border border-status-active-dot/30 text-status-active-text text-sm font-semibold mb-4">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-status-active-dot" />
            <span>{isKa ? 'შოუ დასრულებულია' : 'Show Completed'}</span>
            <span className="ml-auto text-xs font-medium opacity-80">
              {endDate.toLocaleDateString(localeStr, { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}

        {/* Compact Performer / Troupe Meta Line */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-surface-secondary/70 border border-border-subtle text-xs text-text-secondary mb-4 flex-wrap">
          <Users className="w-3.5 h-3.5 text-brand-primary shrink-0" />
          <span>
            <span className="text-text-secondary">
              {isKa ? 'შემსრულებელი' : language === 'tr' ? 'Sanatçı' : 'Performer'}:
            </span>{' '}
            <strong className="font-semibold text-text-primary">{group?.name || t('all_groups')}</strong>
          </span>
          <span className="text-border-medium select-none">•</span>
          <span>
            {group?.memberTalentIds.length || 0} {t('members')}
          </span>
        </div>

        {/* Logistics Cards: Location & Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {/* Location Block */}
          <div
            className={`p-3.5 sm:p-4 rounded-md border border-border-subtle flex flex-col justify-between ${
              isPast ? 'bg-surface-secondary/50 opacity-85' : 'bg-surface-secondary'
            }`}
          >
            <div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                    {venue?.name || t('all_venues')}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1">
                    {[venue?.address, venue?.city].filter(Boolean).join(', ') ||
                      (isKa ? 'მისამართი მითითებული არ არის' : 'No address specified')}
                  </p>
                  {venue?.roomOrBallroom && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-surface text-text-primary text-xs font-medium border border-border-subtle">
                      <span className="text-brand-primary font-semibold">✦</span>
                      <span>{venue.roomOrBallroom}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Time Block */}
          <div
            className={`p-3.5 sm:p-4 rounded-md border border-border-subtle flex flex-col justify-between gap-2.5 ${
              isPast ? 'bg-surface-secondary/50 opacity-85' : 'bg-surface-secondary'
            }`}
          >
            {/* Date */}
            <div className="flex items-center gap-2 text-text-primary font-bold text-sm sm:text-base">
              <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
              <span>{formattedDate}</span>
            </div>

            {/* Times: Lobby Call & Show Time / Duration */}
            <div className="flex flex-col gap-1.5 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 text-text-primary font-medium flex-wrap">
                <Bus className="w-3.5 h-3.5 text-text-secondary shrink-0" strokeWidth={2} />
                <span className="text-text-secondary">{t('gathering_label')}:</span>
                <span className="font-bold text-text-primary font-mono">{formatTime(lobbyTime)}</span>
                {venue?.travelTimeMinutes && (
                  <span className="text-xs text-text-secondary font-normal">
                    ({venue.travelTimeMinutes} {t('minutes_short')})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-text-primary font-medium flex-wrap">
                <Clock className="w-3.5 h-3.5 text-brand-primary shrink-0" strokeWidth={2} />
                <span className="text-text-secondary">{t('show_time_label')}:</span>
                <span className="font-semibold text-text-primary">
                  {formatTimeRange(startDate, endDate)}
                </span>
                {durationStr && (
                  <span className="text-[11px] font-semibold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-1.5 py-0.5 rounded-pill">
                    {durationStr}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stage Duties (Tasks & Inventory) Section */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5 m-0">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <span>{t('assigned_inventory_crew')}</span>
              </h4>
              <p className="text-xs text-text-secondary mt-0.5 m-0">
                {t('assigned_inventory_crew_sub')}
              </p>
            </div>
          </div>

          {/* Segmented Switcher Tabs (Compact) */}
          <div className="flex items-center p-1 bg-surface-secondary rounded-lg border border-border-subtle w-full max-w-xs mb-3.5">
            <button
              type="button"
              onClick={() => setActiveDutyTab('inventory')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeDutyTab === 'inventory'
                  ? 'bg-surface text-text-primary shadow-2xs font-bold border border-border-subtle'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Box size={13} className={activeDutyTab === 'inventory' ? 'text-brand-primary' : 'opacity-60'} />
              <span>{isKa ? 'ინვენტარი' : 'Inventory'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeDutyTab === 'inventory'
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'bg-surface/70 text-text-secondary'
                }`}
              >
                {inventoryDuties.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDutyTab('tasks')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeDutyTab === 'tasks'
                  ? 'bg-surface text-text-primary shadow-2xs font-bold border border-border-subtle'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <ClipboardList size={13} className={activeDutyTab === 'tasks' ? 'text-brand-primary' : 'opacity-60'} />
              <span>{isKa ? 'დავალებები' : 'Tasks'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeDutyTab === 'tasks'
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'bg-surface/70 text-text-secondary'
                }`}
              >
                {taskDuties.length}
              </span>
            </button>
          </div>

          {event.dutyAssignments.length === 0 ? (
            <div className="text-center p-6 bg-surface-secondary/50 rounded-xl border border-dashed border-border-medium text-text-secondary text-xs">
              <AlertCircle className="w-5 h-5 mx-auto mb-1.5 opacity-40 text-text-secondary" />
              <p className="m-0 font-medium">
                {isKa ? 'ამ შოუზე მორიგეობები განსაზღვრული არ არის' : t('no_inventory_reqs')}
              </p>
            </div>
          ) : (activeDutyTab === 'inventory' ? inventoryDuties : taskDuties).length === 0 ? (
            <div className="text-center p-6 bg-surface-secondary/50 rounded-xl border border-dashed border-border-medium text-text-secondary text-xs">
              <AlertCircle className="w-5 h-5 mx-auto mb-1.5 opacity-40 text-text-secondary" />
              <p className="m-0 font-medium">
                {activeDutyTab === 'inventory'
                  ? isKa
                    ? 'ამ შოუზე ინვენტარის მორიგეობა არ არის განსაზღვრული'
                    : 'No inventory duties assigned for this show'
                  : isKa
                    ? 'ამ შოუზე სპეციალური დავალებები არ არის განსაზღვრული'
                    : 'No special tasks assigned for this show'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(activeDutyTab === 'inventory' ? inventoryDuties : taskDuties).map((duty) => (
                <div
                  key={duty.requirementId || duty.itemName}
                  className="border border-border-subtle rounded-xl p-3.5 sm:p-4 bg-surface shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-text-primary">
                        {duty.itemName}
                      </strong>
                      <span className="text-[11px] bg-surface-secondary px-2 py-0.5 rounded-full text-text-secondary border border-border-subtle font-medium">
                        {duty.requiredHeadcount} ({duty.assignedGender})
                      </span>
                    </div>
                  </div>

                  {/* Assigned Talents List */}
                  <div className="flex flex-col gap-2">
                    {duty.assignedTalentIds.map((talentId) => {
                      const talent = talents.find((t) => t.id === talentId);
                      const isOverridden =
                        duty.manualOverrides && Object.values(duty.manualOverrides).includes(talentId);

                      if (!talent) return null;

                      return (
                        <div
                          key={talentId}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-surface-secondary/60 border border-border-subtle gap-2 flex-wrap sm:flex-nowrap hover:bg-surface-secondary transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getTalentAvatar(talent)}
                              alt={talent.firstName}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-border-subtle"
                            />
                            <div>
                              <div className="font-bold text-sm text-text-primary flex items-center gap-1.5 flex-wrap">
                                <span>
                                  {talent.firstName} {talent.lastName}
                                </span>
                                {isOverridden && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-md font-semibold border border-amber-500/20">
                                    {t('admin_override_badge')}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-text-secondary">
                                {talent.primarySkill}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Hide swap button for past events */}
                            {!isPast && (
                              <button
                                type="button"
                                onClick={() => setSwapTarget({ duty, talentId })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border-subtle bg-surface text-text-primary hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/30 transition-all cursor-pointer"
                                title="Manually reassign this shift"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                <span>{t('swap_duty')}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {duty.assignedTalentIds.length === 0 && (
                      <div className="text-xs text-danger italic py-1.5">
                        {t('insufficient_performers')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Admin Swap Modal */}
      {swapTarget && (
        <DutySwapModal
          isOpen={Boolean(swapTarget)}
          onClose={() => setSwapTarget(null)}
          event={event}
          duty={swapTarget.duty}
          originalTalentId={swapTarget.talentId}
        />
      )}
    </>
  );
};
