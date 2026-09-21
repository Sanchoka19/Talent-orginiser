import React from 'react';
import { ShowEvent } from '../../types/schedule';
import { Group } from '../../types/group';
import { HotelVenue } from '../../types/venue';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Users, Bus, Sparkles, Check } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  events: ShowEvent[];
  groups: Group[];
  venues: HotelVenue[];
  onSelectEvent: (event: ShowEvent) => void;
  onSelectDate: (dateStr: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  groups,
  venues,
  onSelectEvent,
  onSelectDate
}) => {
  const { language, t } = useLanguage();
  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const venueMap = new Map(venues.map((v) => [v.id, v]));

  // Calculate start of current week (Monday)
  const d = new Date(currentDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    weekDays.push(nextDay);
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const localeStr = language === 'ka' ? 'ka-GE' : language === 'tr' ? 'tr-TR' : 'en-US';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))',
        gap: '12px',
        minHeight: '480px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}
    >
      {weekDays.map((dayDate, idx) => {
        const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
        const dayName = dayDate.toLocaleDateString(localeStr, { weekday: 'short' });
        const dayNumber = dayDate.getDate();
        const isToday = dateStr === todayStr;
        const isPast = dateStr < todayStr;

        const dayEvents = events.filter((ev) => ev.startDateTime.startsWith(dateStr));

        return (
          <div
            key={idx}
            onClick={() => onSelectDate(dateStr)}
            style={{
              background: isToday ? 'rgba(30, 106, 255, 0.05)' : isPast ? 'rgba(0, 0, 0, 0.015)' : 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: isToday ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '460px',
              boxShadow: 'var(--shadow-sm)',
              opacity: isPast ? 0.78 : 1,
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (isPast) e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              if (isPast) e.currentTarget.style.opacity = '0.78';
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '12px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  {dayName}
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isToday ? 'var(--brand-primary)' : isPast ? 'var(--color-text-tertiary)' : 'inherit' }}>
                  {dayNumber}
                </div>
              </div>

              {isToday && (
                <span
                  style={{
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    background: 'var(--brand-primary)',
                    color: '#FFFFFF',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  {t('today').toUpperCase()}
                </span>
              )}

              {isPast && !isToday && (
                <span
                  style={{
                    fontSize: '0.675rem',
                    fontWeight: 650,
                    color: 'var(--color-text-tertiary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <Check size={11} strokeWidth={2.5} />
                  <span>{language === 'ka' ? 'დასრულდა' : 'Past'}</span>
                </span>
              )}
            </div>

            {/* Event Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {dayEvents.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-tertiary)',
                    fontSize: '0.75rem',
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}
                >
                  {t('no_shows_week')}
                </div>
              ) : (
                dayEvents.map((ev) => {
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

                  const isEventPast = isPast || new Date(ev.endDateTime).getTime() < Date.now();

                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        background: isEventPast ? 'var(--bg-surface-secondary)' : 'var(--brand-primary)',
                        color: isEventPast ? 'var(--color-text-secondary)' : '#FFFFFF',
                        border: isEventPast ? '1px solid var(--border-medium)' : '1px solid var(--brand-primary-hover)',
                        boxShadow: isEventPast ? 'none' : '0 2px 8px var(--brand-primary-glow)',
                        cursor: 'pointer',
                        opacity: isEventPast ? 0.85 : 1,
                        transition: 'opacity 0.15s ease, transform 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (isEventPast) e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        if (isEventPast) e.currentTarget.style.opacity = '0.85';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.825rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.title}
                        </div>
                        {isEventPast && (
                          <span
                            style={{
                              fontSize: '0.625rem',
                              fontWeight: 650,
                              color: 'var(--color-text-tertiary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              flexShrink: 0
                            }}
                          >
                            <Check size={9} strokeWidth={3} />
                            <span>{language === 'ka' ? 'დასრულდა' : 'Done'}</span>
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.725rem', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: isEventPast ? 'var(--color-text-tertiary)' : 'inherit' }}>
                          <Bus size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                          <span>{t('gathering_label')}: {effectiveLobby}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isEventPast ? 'var(--color-text-tertiary)' : 'inherit' }}>
                          <Sparkles size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                          <span>{startTime} - {endTime}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', marginBottom: '4px', fontWeight: 600, color: isEventPast ? 'var(--color-text-secondary)' : 'inherit' }}>
                        <Users size={13} style={{ opacity: isEventPast ? 0.7 : 1 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {group?.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: isEventPast ? 'var(--color-text-tertiary)' : 'rgba(255, 255, 255, 0.85)' }}>
                        <MapPin size={13} style={{ opacity: isEventPast ? 0.7 : 1 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {venue?.name}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
