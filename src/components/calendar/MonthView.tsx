import React from 'react';
import { ShowEvent } from '../../types/schedule';
import { Group } from '../../types/group';
import { HotelVenue } from '../../types/venue';
import { useLanguage } from '../../context/LanguageContext';
import { Users, Bus, Sparkles, Building } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  events: ShowEvent[];
  groups: Group[];
  venues: HotelVenue[];
  onSelectEvent: (event: ShowEvent) => void;
  onSelectDate: (dateStr: string) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  groups,
  venues,
  onSelectEvent,
  onSelectDate
}) => {
  const { language, t } = useLanguage();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sun, 1 = Mon, ...)
  const firstDayOfMonth = new Date(year, month, 1);
  // Get day of week with Monday = 0
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

  // Total days in month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  // Total days in previous month
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const venueMap = new Map(venues.map((v) => [v.id, v]));

  // Days array for grid (6 rows x 7 days = 42 cells)
  const calendarCells = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      dayNumber: prevMonthTotalDays - i,
      isCurrentMonth: false,
      isWeekend: false,
      dateStr: new Date(year, month - 1, prevMonthTotalDays - i).toISOString().split('T')[0]
    });
  }

  // Current month days
  const todayStr = new Date().toISOString().split('T')[0];
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dObj = new Date(year, month, d);
    const dayOfWeek = dObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: true,
      isWeekend,
      isToday: dateStr === todayStr,
      dateStr
    });
  }

  // Next month leading days to complete grid
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: false,
      isWeekend: false,
      dateStr: new Date(year, month + 1, d).toISOString().split('T')[0]
    });
  }

  const daysOfWeek =
    language === 'ka'
      ? ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი']
      : language === 'tr'
      ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '8px'
      }}
    >
      <div
        style={{
          minWidth: '920px',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Day Names Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))',
            background: 'var(--bg-surface-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '11px 0',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.04em'
          }}
        >
          {daysOfWeek.map((day, idx) => (
            <div key={day} style={{ color: idx >= 5 ? '#DC2626' : 'inherit' }}>
              {day}
            </div>
          ))}
        </div>

        {/* 42 Calendar Cells Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))',
            gridAutoRows: 'minmax(115px, auto)'
          }}
        >
        {calendarCells.map((cell, idx) => {
          // Find events on this date
          const dayEvents = events.filter((ev) => ev.startDateTime.startsWith(cell.dateStr));

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(cell.dateStr)}
              className={!cell.isCurrentMonth ? 'pattern-striped' : ''}
              style={{
                borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-subtle)' : 'none',
                borderBottom: idx < 35 ? '1px solid var(--border-subtle)' : 'none',
                padding: '8px',
                background: !cell.isCurrentMonth
                  ? undefined
                  : cell.isToday
                  ? '#FFFDF5'
                  : 'var(--bg-surface)',
                opacity: cell.isCurrentMonth ? 1 : 0.45,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '110px',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              {/* Day Number Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px'
                }}
              >
                <span
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: cell.isToday ? 700 : 500,
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: cell.isToday ? 'var(--brand-primary)' : 'transparent',
                    color: cell.isToday ? '#FFFFFF' : 'var(--color-text-primary)'
                  }}
                >
                  {cell.dayNumber}
                </span>

                {dayEvents.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      background: 'var(--brand-primary)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-pill)'
                    }}
                  >
                    {dayEvents.length} {dayEvents.length > 1 ? t('shows') : t('show')}
                  </span>
                )}
              </div>

              {/* Event Bars / Pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'hidden' }}>
                {dayEvents.slice(0, 2).map((ev) => {
                  const evGroup = groupMap.get(ev.groupId);
                  const evVenue = venueMap.get(ev.hotelId);
                  const startTime = new Date(ev.startDateTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const effectiveLobby = ev.lobbyTime || (() => {
                    const d = new Date(ev.startDateTime);
                    const travel = evVenue?.travelTimeMinutes ?? 45;
                    const totalM = (d.getHours() * 60 + d.getMinutes() - travel + 1440) % 1440;
                    return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
                  })();

                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      style={{
                        padding: '5px 7px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--brand-primary)',
                        color: '#FFFFFF',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        lineHeight: 1.25,
                        boxShadow: '0 2px 4px var(--brand-primary-glow)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        border: '1px solid var(--brand-primary-hover)'
                      }}
                      title={`${ev.title}\n${t('group_label')}: ${evGroup?.name || ev.groupId}\n${t('hotel_label')}: ${evVenue?.name || ev.hotelId}\n${t('gathering_label')}: ${effectiveLobby}\n${t('show_time_label')}: ${startTime}`}
                    >
                      {/* Group Name */}
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Users size={11} strokeWidth={2} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {evGroup?.name || ev.title}
                        </span>
                      </div>

                      {/* Times: Lobby & Show */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.64rem',
                          color: 'rgba(255, 255, 255, 0.95)',
                          fontWeight: 600
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Bus size={10} strokeWidth={2} style={{ flexShrink: 0 }} />
                          <span>{effectiveLobby}</span>
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Sparkles size={10} strokeWidth={2} style={{ flexShrink: 0 }} />
                          <span>{startTime}</span>
                        </span>
                      </div>

                      {/* Hotel Venue */}
                      <div
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.85)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Building size={10} strokeWidth={2} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {evVenue?.name}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {dayEvents.length > 2 && (
                  <div
                    style={{
                      fontSize: '0.675rem',
                      color: 'var(--color-text-secondary)',
                      fontWeight: 600,
                      paddingLeft: '4px'
                    }}
                  >
                    +{dayEvents.length - 2} {t('shows')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
  );
};
