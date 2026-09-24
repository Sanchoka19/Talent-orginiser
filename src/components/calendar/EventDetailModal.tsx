'use client';

import React, { useState } from 'react';
import { ShowEvent } from '../../types/schedule';
import { DutyAssignment } from '../../types/duty';
import { Modal } from '../common/Modal';
import { DutySwapModal } from './DutySwapModal';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { GenderBadge } from '../common/Badge';
import {
  Calendar,
  MapPin,
  Users,
  RotateCw,
  Trash2,
  AlertCircle,
  Sparkles,
  ArrowRightLeft,
  Bus,
  CheckCircle2,
  LockKeyhole
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
  const { groups, venues, talents, deleteShowEvent, regenerateDutiesForEvent } = useApp();
  const { language, t } = useLanguage();
  const { confirm } = useConfirm();
  const toast = useToast();
  const isKa = language === 'ka';

  const [swapTarget, setSwapTarget] = useState<{
    duty: DutyAssignment;
    talentId: string;
  } | null>(null);

  if (!event) return null;

  const group = groups.find((g) => g.id === event.groupId);
  const venue = venues.find((v) => v.id === event.hotelId);

  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);
  const localeStr = language === 'ka' ? 'ka-GE' : 'en-US';

  // Determine if event is in the past (read-only mode)
  const isPast = endDate < new Date();

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

        {/* Logistics Summary Card */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md p-4 border border-border-subtle mb-6 ${
            isPast ? 'bg-surface-secondary/50 opacity-85' : 'bg-surface-secondary'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-2 text-text-primary font-semibold">
              <Users className="w-4 h-4 text-text-primary" />
              <span>{group?.name || t('all_groups')}</span>
            </div>
            <div className="text-xs text-text-secondary">
              {group?.memberTalentIds.length || 0} {t('members')} • {group?.rotationCycleWeeks || 1}w {t('duty_cycle')}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-text-primary font-semibold">
              <MapPin className="w-4 h-4 text-text-primary" />
              <span>{venue?.name || t('all_venues')}</span>
            </div>
            <div className="text-xs text-text-secondary">
              {venue?.roomOrBallroom ? `${venue.roomOrBallroom} • ` : ''}
              {venue?.address}, {venue?.city}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
              <Calendar className="w-4 h-4 text-text-primary" />
              <span>
                {startDate.toLocaleDateString(localeStr, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Times: Lobby / Gathering & Show */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-text-primary font-semibold flex-wrap">
              <Bus className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
              <span>{t('gathering_label')}:</span>
              <span className="font-bold text-text-primary">
                {event.lobbyTime ||
                  (() => {
                    const startH = startDate.getHours();
                    const startM = startDate.getMinutes();
                    const travel = venue?.travelTimeMinutes ?? 45;
                    const totalM = (startH * 60 + startM - travel + 1440) % 1440;
                    return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(
                      totalM % 60
                    ).padStart(2, '0')}`;
                  })()}
              </span>
              {venue?.travelTimeMinutes && (
                <span className="text-xs text-text-secondary font-medium">
                  ({venue.travelTimeMinutes} {t('minutes_short')})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-text-primary font-semibold flex-wrap">
              <Sparkles className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
              <span>{t('show_time_label')}:</span>
              <span>
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Inventory Duty Personnel Section */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h4 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                {t('assigned_inventory_crew')}
              </h4>
              <p className="text-xs text-text-secondary mt-0.5">
                {t('assigned_inventory_crew_sub')}
              </p>
            </div>
          </div>

          {event.dutyAssignments.length === 0 ? (
            <div className="text-center p-6 bg-surface-secondary rounded-sm border border-dashed border-border-medium text-text-secondary text-sm">
              <AlertCircle className="w-5 h-5 mx-auto mb-1.5 opacity-60" />
              <p>{t('no_inventory_reqs')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {event.dutyAssignments.map((duty) => (
                <div
                  key={duty.requirementId}
                  className="border border-border-subtle rounded-md p-3.5 sm:p-4 bg-surface"
                >
                  <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-semibold text-text-primary">
                        {duty.itemName}
                      </strong>
                      <span className="text-[11px] bg-surface-secondary px-2 py-0.5 rounded-pill text-text-secondary border border-border-subtle">
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
                          className="flex items-center justify-between p-2 sm:p-2.5 rounded-sm bg-surface-secondary border border-border-subtle gap-2 flex-wrap sm:flex-nowrap"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                talent.avatarUrl ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.firstName}`
                              }
                              alt={talent.firstName}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-border-subtle"
                            />
                            <div>
                              <div className="font-semibold text-sm text-text-primary flex items-center gap-1.5 flex-wrap">
                                <span>
                                  {talent.firstName} {talent.lastName}
                                </span>
                                {isOverridden && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-status-rest-bg text-status-rest-text rounded-pill font-semibold border border-status-rest-dot/20">
                                    {t('admin_override_badge')}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-text-secondary">
                                {talent.primarySkill}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <GenderBadge gender={talent.gender} />
                            {/* Hide swap button for past events */}
                            {!isPast && (
                              <button
                                type="button"
                                onClick={() => setSwapTarget({ duty, talentId })}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-medium border border-border-subtle bg-surface text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer"
                                title="Manually reassign this shift"
                              >
                                <ArrowRightLeft className="w-3 h-3" /> {t('swap_duty')}
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
