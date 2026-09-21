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
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
            {isPast ? (
              /* Read-only footer for past events */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  <LockKeyhole size={13} />
                  <span>{isKa ? 'გასული შოუ — რედაქტირება შეუძლებელია' : 'Past show — read only'}</span>
                </div>
                <button onClick={onClose} className="btn btn-primary">
                  {t('close')}
                </button>
              </>
            ) : (
              /* Normal footer for upcoming events */
              <>
                <button
                  onClick={handleDelete}
                  className="btn btn-secondary"
                  style={{ color: '#EF4444' }}
                >
                  <Trash2 size={15} /> {t('cancel_show')}
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleRegenerate}
                    className="btn btn-secondary"
                    title="Re-run fair random rotation"
                  >
                    <RotateCw size={14} /> {t('regenerate_fair_duties')}
                  </button>
                  <button onClick={onClose} className="btn btn-primary">
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              color: '#15803d',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '16px'
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0, color: '#16a34a' }} />
            <span>{isKa ? 'შოუ დასრულებულია' : 'Show Completed'}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.775rem', fontWeight: 500, color: '#166534', opacity: 0.8 }}>
              {endDate.toLocaleDateString(localeStr, { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}

        {/* Logistics Summary Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            background: isPast ? 'rgba(0,0,0,0.02)' : 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '24px',
            opacity: isPast ? 0.85 : 1
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-charcoal)', fontWeight: 600 }}>
              <Users size={16} />
              <span>{group?.name || t('all_groups')}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {group?.memberTalentIds.length || 0} {t('members')} • {group?.rotationCycleWeeks || 1}w {t('duty_cycle')}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-charcoal)', fontWeight: 600 }}>
              <MapPin size={16} />
              <span>{venue?.name || t('all_venues')}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {venue?.roomOrBallroom ? `${venue.roomOrBallroom} • ` : ''}
              {venue?.address}, {venue?.city}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-charcoal)', fontWeight: 600 }}>
              <Calendar size={16} />
              <span>{startDate.toLocaleDateString(localeStr, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Times: Lobby / Gathering & Show */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-charcoal)', fontWeight: 600 }}>
              <Bus size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
              <span>{t('gathering_label')}:</span>
              <span style={{ color: 'var(--color-charcoal)', fontWeight: 700 }}>
                {event.lobbyTime ||
                  (() => {
                    const startH = startDate.getHours();
                    const startM = startDate.getMinutes();
                    const travel = venue?.travelTimeMinutes ?? 45;
                    const totalM = (startH * 60 + startM - travel + 1440) % 1440;
                    return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
                  })()}
              </span>
              {venue?.travelTimeMinutes && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  ({venue.travelTimeMinutes} {t('minutes_short')})
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-charcoal)', fontWeight: 600 }}>
              <Sparkles size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-charcoal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--brand-primary)" />
                {t('assigned_inventory_crew')}
              </h4>
              <p style={{ fontSize: '0.785rem', color: 'var(--color-text-secondary)' }}>
                {t('assigned_inventory_crew_sub')}
              </p>
            </div>
          </div>

          {event.dutyAssignments.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                background: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed var(--border-medium)',
                color: 'var(--color-text-secondary)',
                fontSize: '0.85rem'
              }}
            >
              <AlertCircle size={20} style={{ marginBottom: '6px', opacity: 0.6 }} />
              <p>{t('no_inventory_reqs')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {event.dutyAssignments.map((duty) => (
                <div
                  key={duty.requirementId}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    background: 'var(--bg-surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                        {duty.itemName}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          background: 'var(--bg-surface-secondary)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          color: 'var(--color-text-secondary)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        {duty.requiredHeadcount} ({duty.assignedGender})
                      </span>
                    </div>
                  </div>

                  {/* Assigned Talents List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {duty.assignedTalentIds.map((talentId) => {
                      const talent = talents.find((t) => t.id === talentId);
                      const isOverridden = duty.manualOverrides && Object.values(duty.manualOverrides).includes(talentId);

                      if (!talent) return null;

                      return (
                        <div
                          key={talentId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-surface-secondary)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={
                                talent.avatarUrl ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.firstName}`
                              }
                              alt={talent.firstName}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                {talent.firstName} {talent.lastName}
                                {isOverridden && (
                                  <span
                                    style={{
                                      fontSize: '0.675rem',
                                      marginLeft: '6px',
                                      padding: '1px 6px',
                                      background: '#FEF3C7',
                                      color: '#92400E',
                                      borderRadius: 'var(--radius-pill)',
                                      fontWeight: 600
                                    }}
                                  >
                                    {t('admin_override_badge')}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>
                                {talent.primarySkill}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <GenderBadge gender={talent.gender} />
                            {/* Hide swap button for past events */}
                            {!isPast && (
                              <button
                                onClick={() => setSwapTarget({ duty, talentId })}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                                title="Manually reassign this shift"
                              >
                                <ArrowRightLeft size={12} /> {t('swap_duty')}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {duty.assignedTalentIds.length === 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#DC2626', fontStyle: 'italic', padding: '6px 0' }}>
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
