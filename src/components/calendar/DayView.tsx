import React from 'react';
import { ShowEvent } from '../../types/schedule';
import { Group } from '../../types/group';
import { HotelVenue } from '../../types/venue';
import { Talent } from '../../types/talent';
import { useLanguage } from '../../context/LanguageContext';
import { Clock, MapPin, Users, Sparkles, Calendar, ArrowRight, Bus } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  events: ShowEvent[];
  groups: Group[];
  venues: HotelVenue[];
  talents: Talent[];
  onSelectEvent: (event: ShowEvent) => void;
  onOpenSchedule: () => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  groups,
  venues,
  talents,
  onSelectEvent,
  onOpenSchedule
}) => {
  const { language, t } = useLanguage();
  const dateStr = currentDate.toISOString().split('T')[0];
  const dayEvents = events.filter((ev) => ev.startDateTime.startsWith(dateStr));

  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const venueMap = new Map(venues.map((v) => [v.id, v]));
  const talentMap = new Map(talents.map((t) => [t.id, t]));

  const localeStr = language === 'ka' ? 'ka-GE' : 'en-US';

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '18px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1.2rem'
            }}
          >
            {currentDate.getDate()}
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
              {currentDate.toLocaleDateString(localeStr, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {dayEvents.length} {dayEvents.length === 1 ? t('show') : t('shows')} {t('scheduled_for_today')}
            </p>
          </div>
        </div>

        <button onClick={onOpenSchedule} className="btn btn-primary">
          <span>{t('book_show_for_today')}</span>
        </button>
      </div>

      {/* Shows List */}
      {dayEvents.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--color-text-secondary)'
          }}
        >
          <Calendar size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '4px' }}>
            {t('no_shows_today')}
          </h4>
          <p style={{ fontSize: '0.825rem', marginBottom: '16px' }}>
            {t('no_shows_today_sub')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {dayEvents.map((ev) => {
            const group = groupMap.get(ev.groupId);
            const venue = venueMap.get(ev.hotelId);
            const startTime = new Date(ev.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(ev.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const effectiveLobby = ev.lobbyTime || (() => {
              const d = new Date(ev.startDateTime);
              const travel = venue?.travelTimeMinutes ?? 45;
              const totalM = (d.getHours() * 60 + d.getMinutes() - travel + 1440) % 1440;
              return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
            })();

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 20px',
                  background: 'var(--bg-surface-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                className="day-show-card"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                      {ev.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '0.825rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-charcoal)', fontWeight: 600 }}>
                        <Bus size={14} strokeWidth={2} style={{ flexShrink: 0 }} /> {t('gathering_label')}: {effectiveLobby}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Sparkles size={14} strokeWidth={2} style={{ flexShrink: 0 }} /> {t('show_time_label')}: {startTime} - {endTime}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin size={14} /> {venue?.name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Users size={14} /> {group?.name}
                      </span>
                    </div>
                  </div>

                  <button className="btn btn-secondary" style={{ fontSize: '0.775rem', padding: '6px 12px' }}>
                    <span>{t('manage_duties')}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* Inventory Duty Crew Section */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem', fontWeight: 700, color: 'var(--color-charcoal)', marginBottom: '8px' }}>
                    <Sparkles size={13} color="var(--brand-primary)" />
                    <span>{t('assigned_duty_rotation')}</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {ev.dutyAssignments.map((duty) => (
                      <div
                        key={duty.requirementId}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-xs)',
                          background: 'var(--bg-surface-secondary)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.75rem'
                        }}
                      >
                        <strong>{duty.itemName}:</strong>{' '}
                        {duty.assignedTalentIds.map((tid, idx) => {
                          const talent = talentMap.get(tid);
                          return (
                            <span key={tid}>
                              {talent ? `${talent.firstName} ${talent.lastName}` : tid}
                              {idx < duty.assignedTalentIds.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
