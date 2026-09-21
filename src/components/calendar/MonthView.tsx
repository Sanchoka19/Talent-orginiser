import React from 'react';
import { ShowEvent } from '../../types/schedule';
import { Group } from '../../types/group';
import { HotelVenue } from '../../types/venue';
import { useLanguage } from '../../context/LanguageContext';
import { Users, Bus, Sparkles, Building, Check } from 'lucide-react';

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

  // Today's local date string (avoid UTC day shift)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Days array for grid (6 rows x 7 days = 42 cells)
  const calendarCells = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevD = prevMonthTotalDays - i;
    const prevMonthDate = new Date(year, month - 1, prevD);
    const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(prevMonthDate.getDate()).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: prevD,
      isCurrentMonth: false,
      isWeekend: false,
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
      dateStr
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dObj = new Date(year, month, d);
    const dayOfWeek = dObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isPast = dateStr < todayStr;

    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: true,
      isWeekend,
      isToday,
      isPast,
      dateStr
    });
  }

  // Next month leading days to complete grid
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(nextMonthDate.getDate()).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: false,
      isWeekend: false,
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
      dateStr
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
            gridAutoRows: '140px'
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
                      ? 'rgba(30, 106, 255, 0.05)'
                      : cell.isPast
                        ? 'rgba(0, 0, 0, 0.018)'
                        : 'var(--bg-surface)',
                  opacity: !cell.isCurrentMonth ? 0.45 : cell.isPast ? 0.72 : 1,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease, background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (cell.isPast && cell.isCurrentMonth) e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  if (cell.isPast && cell.isCurrentMonth) e.currentTarget.style.opacity = '0.72';
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
                      fontWeight: cell.isToday ? 700 : cell.isPast ? 500 : 600,
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: cell.isToday ? 'var(--brand-primary)' : 'transparent',
                      color: cell.isToday
                        ? '#FFFFFF'
                        : cell.isPast
                          ? 'var(--color-text-tertiary)'
                          : 'var(--color-text-primary)'
                    }}
                  >
                    {cell.dayNumber}
                  </span>

                  {dayEvents.length > 0 && (
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        color: cell.isPast ? 'var(--color-text-secondary)' : '#FFFFFF',
                        background: cell.isPast ? 'var(--bg-surface-secondary)' : 'var(--brand-primary)',
                        border: cell.isPast ? '1px solid var(--border-subtle)' : 'none',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-pill)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      {cell.isPast && <Check size={10} strokeWidth={2.5} style={{ opacity: 0.7 }} />}
                      <span>{dayEvents.length} {dayEvents.length > 1 ? t('shows') : t('show')}</span>
                    </span>
                  )}
                </div>

                {/* Event Bars / Pills — scrollable after 2 cards */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    overflowY: 'auto',
                    flex: 1,
                    /* Custom thin scrollbar */
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--border-medium) transparent'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {dayEvents.map((ev) => {
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

                    const isEventPast = cell.isPast || new Date(ev.endDateTime).getTime() < Date.now();

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
                          background: isEventPast ? 'var(--bg-surface-secondary)' : 'var(--brand-primary)',
                          color: isEventPast ? 'var(--color-text-secondary)' : '#FFFFFF',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          lineHeight: 1.25,
                          boxShadow: isEventPast ? 'none' : '0 2px 4px var(--brand-primary-glow)',
                          cursor: 'pointer',
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          border: isEventPast ? '1px solid var(--border-medium)' : '1px solid var(--brand-primary-hover)',
                          opacity: isEventPast ? 0.85 : 1,
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (isEventPast) e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          if (isEventPast) e.currentTarget.style.opacity = '0.85';
                        }}
                        title={`${ev.title}\n${t('group_label')}: ${evGroup?.name || ev.groupId}\n${t('hotel_label')}: ${evVenue?.name || ev.hotelId}\n${t('gathering_label')}: ${effectiveLobby}\n${t('show_time_label')}: ${startTime}${isEventPast ? `\n[${language === 'ka' ? 'დასრულებული' : 'Completed'}]` : ''}`}
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
                          <Users size={11} strokeWidth={2} style={{ flexShrink: 0, opacity: isEventPast ? 0.65 : 1 }} />
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
                            color: isEventPast ? 'var(--color-text-tertiary)' : 'rgba(255, 255, 255, 0.95)',
                            fontWeight: 600
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Bus size={10} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <span>{effectiveLobby}</span>
                          </span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Sparkles size={10} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <span>{startTime}</span>
                          </span>
                        </div>

                        {/* Hotel Venue */}
                        {evVenue && (
                          <div
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 500,
                              color: isEventPast ? 'var(--color-text-tertiary)' : 'rgba(255, 255, 255, 0.85)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Building size={9} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {evVenue.name}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
