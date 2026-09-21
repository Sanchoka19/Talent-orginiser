import React from 'react';
import { ShowEvent } from '../../types/schedule';
import { Group } from '../../types/group';
import { HotelVenue } from '../../types/venue';
import { useLanguage } from '../../context/LanguageContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ChevronRight,
  Building2,
  Bus
} from 'lucide-react';

interface YearViewProps {
  currentDate: Date;
  events: ShowEvent[];
  groups: Group[];
  venues: HotelVenue[];
  onSelectEvent: (event: ShowEvent) => void;
  onSelectMonth?: (monthIndex: number) => void;
}

export const YearView: React.FC<YearViewProps> = ({
  currentDate,
  events,
  groups,
  venues,
  onSelectEvent,
  onSelectMonth
}) => {
  const { language, t } = useLanguage();
  const year = currentDate.getFullYear();
  const localeStr = language === 'ka' ? 'ka-GE' : 'en-US';

  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const venueMap = new Map(venues.map((v) => [v.id, v]));

  // Events in current year
  const yearEvents = events.filter((ev) => {
    const d = new Date(ev.startDateTime);
    return d.getFullYear() === year;
  });

  // Unique groups & venues in this year
  const uniqueGroupIds = new Set(yearEvents.map((ev) => ev.groupId));
  const uniqueVenueIds = new Set(yearEvents.map((ev) => ev.hotelId));

  // 12 Months array
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 1);
    const monthName = date.toLocaleDateString(localeStr, { month: 'long' });
    const monthEvents = yearEvents.filter((ev) => {
      const d = new Date(ev.startDateTime);
      return d.getMonth() === i;
    });
    return {
      index: i,
      name: monthName,
      events: monthEvents
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Year Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
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
              flexShrink: 0
            }}
          >
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
              {yearEvents.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {t('total_shows_year')} ({year})
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-charcoal)',
              flexShrink: 0
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
              {uniqueGroupIds.size}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {t('performing_groups_count')}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-charcoal)',
              flexShrink: 0
            }}
          >
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
              {uniqueVenueIds.size}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {t('active_venues_booked')}
            </div>
          </div>
        </div>
      </div>

      {/* 12 Months Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '18px'
        }}
      >
        {months.map((m) => {
          const hasShows = m.events.length > 0;
          return (
            <div
              key={m.index}
              style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: hasShows ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                boxShadow: hasShows ? '0 4px 14px var(--brand-primary-glow)' : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'transform 0.15s ease'
              }}
            >
              {/* Month Card Header */}
              <div
                onClick={() => onSelectMonth && onSelectMonth(m.index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: hasShows ? 'var(--brand-primary)' : 'var(--bg-surface-secondary)',
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: onSelectMonth ? 'pointer' : 'default'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: hasShows ? '#FFFFFF' : 'var(--color-charcoal)',
                      textTransform: 'capitalize'
                    }}
                  >
                    {m.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.85, color: hasShows ? '#FFFFFF' : 'var(--color-charcoal)' }}>
                    {year}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      background: hasShows ? 'rgba(0, 0, 0, 0.25)' : 'var(--border-subtle)',
                      color: hasShows ? '#FFFFFF' : 'var(--color-text-secondary)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)'
                    }}
                  >
                    {m.events.length} {m.events.length === 1 ? t('show') : t('shows')}
                  </span>
                  {onSelectMonth && (
                    <ChevronRight size={14} color={hasShows ? '#FFFFFF' : 'var(--color-charcoal)'} />
                  )}
                </div>
              </div>

              {/* Month Shows Content */}
              <div
                style={{
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  minHeight: '140px',
                  justifyContent: hasShows ? 'flex-start' : 'center'
                }}
              >
                {!hasShows ? (
                  <div
                    style={{
                      textAlign: 'center',
                      color: 'var(--color-text-tertiary)',
                      fontSize: '0.775rem',
                      fontStyle: 'italic',
                      padding: '20px 0'
                    }}
                  >
                    {t('no_shows_in_month')}
                  </div>
                ) : (
                  m.events.map((ev) => {
                    const group = groupMap.get(ev.groupId);
                    const venue = venueMap.get(ev.hotelId);
                    const dateObj = new Date(ev.startDateTime);
                    const dayFormatted = dateObj.toLocaleDateString(localeStr, {
                      day: 'numeric',
                      weekday: 'short'
                    });
                    const timeFormatted = dateObj.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    const effectiveLobby = ev.lobbyTime || (() => {
                      const travel = venue?.travelTimeMinutes ?? 45;
                      const totalM = (dateObj.getHours() * 60 + dateObj.getMinutes() - travel + 1440) % 1440;
                      return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
                    })();

                    return (
                      <div
                        key={ev.id}
                        onClick={() => onSelectEvent(ev)}
                        style={{
                          background: 'var(--bg-surface-secondary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--brand-primary)';
                          e.currentTarget.style.background = 'var(--brand-primary-light)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.background = 'var(--bg-surface-secondary)';
                        }}
                      >
                        {/* Day & Time Header */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--color-charcoal)',
                            flexWrap: 'wrap',
                            gap: '4px'
                          }}
                        >
                          <span style={{ textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <span>{dayFormatted}</span>
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-charcoal)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Bus size={11} strokeWidth={2} style={{ flexShrink: 0 }} />
                              <span>{effectiveLobby}</span>
                            </span>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Sparkles size={11} strokeWidth={2} style={{ flexShrink: 0 }} />
                              <span>{timeFormatted}</span>
                            </span>
                          </span>
                        </div>

                        {/* Title */}
                        <div
                          style={{
                            fontSize: '0.825rem',
                            fontWeight: 600,
                            color: 'var(--color-charcoal)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {ev.title}
                        </div>

                        {/* Group Name & Hotel Venue */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.725rem',
                            marginTop: '2px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              color: '#FFFFFF',
                              fontWeight: 600,
                              background: 'var(--brand-primary)',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-pill)'
                            }}
                          >
                            <Users size={11} />
                            <span>{group?.name}</span>
                          </span>

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              color: 'var(--color-text-secondary)'
                            }}
                          >
                            <MapPin size={11} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                              {venue?.name}
                            </span>
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

      {/* Yearly Shows Detailed Timeline */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
          marginTop: '8px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--color-charcoal)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
              {t('yearly_schedule')} ({year})
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            {yearEvents.length} {yearEvents.length === 1 ? t('show') : t('shows')}
          </span>
        </div>

        {yearEvents.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: '0.85rem'
            }}
          >
            {t('no_shows_in_year')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {yearEvents
              .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
              .map((ev) => {
                const group = groupMap.get(ev.groupId);
                const venue = venueMap.get(ev.hotelId);
                const start = new Date(ev.startDateTime);
                const end = new Date(ev.endDateTime);

                const dateStr = start.toLocaleDateString(localeStr, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                const effectiveLobby = ev.lobbyTime || (() => {
                  const travel = venue?.travelTimeMinutes ?? 45;
                  const totalM = (start.getHours() * 60 + start.getMinutes() - travel + 1440) % 1440;
                  return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
                })();

                return (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--brand-primary)';
                      e.currentTarget.style.background = 'var(--brand-primary-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.background = 'var(--bg-surface-secondary)';
                    }}
                  >
                    {/* Date & Time */}
                    <div style={{ minWidth: '180px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-charcoal)' }}>
                        {dateStr}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-charcoal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                        <Bus size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                        <span>{t('gathering_label')}: {effectiveLobby}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                        <Sparkles size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                        <span>{timeStr}</span>
                      </div>
                    </div>

                    {/* Show Title */}
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--color-charcoal)' }}>
                        {ev.title}
                      </div>
                    </div>

                    {/* Group Badge */}
                    <div style={{ minWidth: '140px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                        {t('group_label')}:
                      </div>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: 'var(--brand-primary)',
                          color: '#FFFFFF',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid var(--brand-primary-hover)'
                        }}
                      >
                        <Users size={12} />
                        <span>{group?.name}</span>
                      </span>
                    </div>

                    {/* Hotel Venue */}
                    <div style={{ minWidth: '180px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                        {t('hotel_label')}:
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.825rem', fontWeight: 500, color: 'var(--color-charcoal)' }}>
                        <MapPin size={13} color="var(--color-text-secondary)" />
                        <span>{venue?.name}</span>
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--color-text-tertiary)', paddingLeft: '18px' }}>
                        {venue?.roomOrBallroom}
                      </div>
                    </div>

                    {/* Action Arrow */}
                    <div>
                      <ChevronRight size={18} color="var(--color-text-secondary)" />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
