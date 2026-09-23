'use client';

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
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  // Days array for grid (6 rows x 7 days = 42 cells)
  const calendarCells = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevD = prevMonthTotalDays - i;
    const prevMonthDate = new Date(year, month - 1, prevD);
    const dateStr = `${prevMonthDate.getFullYear()}-${String(
      prevMonthDate.getMonth() + 1
    ).padStart(2, '0')}-${String(prevMonthDate.getDate()).padStart(2, '0')}`;
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
    const dateStr = `${nextMonthDate.getFullYear()}-${String(
      nextMonthDate.getMonth() + 1
    ).padStart(2, '0')}-${String(nextMonthDate.getDate()).padStart(2, '0')}`;
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
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-[920px] flex flex-col border border-border-subtle rounded-lg overflow-hidden bg-surface shadow-sm">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 bg-surface-secondary border-b border-border-subtle py-2.5 text-center text-xs font-bold text-text-secondary tracking-wider">
          {daysOfWeek.map((day, idx) => (
            <div
              key={day}
              className={idx >= 5 ? 'text-danger font-bold' : 'text-inherit'}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 42 Calendar Cells Grid */}
        <div className="grid grid-cols-7 auto-rows-[140px]">
          {calendarCells.map((cell, idx) => {
            // Find events on this date
            const dayEvents = events.filter((ev) => ev.startDateTime.startsWith(cell.dateStr));
            const isLastInRow = (idx + 1) % 7 === 0;
            const isBottomRow = idx >= 35;

            return (
              <div
                key={idx}
                onClick={() => onSelectDate(cell.dateStr)}
                className={`p-2 relative flex flex-col overflow-hidden cursor-pointer transition-all duration-150 ${
                  !isLastInRow ? 'border-r border-border-subtle' : ''
                } ${!isBottomRow ? 'border-b border-border-subtle' : ''} ${
                  !cell.isCurrentMonth
                    ? 'pattern-striped opacity-45'
                    : cell.isToday
                    ? 'bg-brand-primary/5 opacity-100'
                    : cell.isPast
                    ? 'bg-canvas/40 opacity-75 hover:opacity-100'
                    : 'bg-surface opacity-100 hover:bg-surface-secondary/40'
                }`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between mb-1.5 shrink-0">
                  <span
                    className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${
                      cell.isToday
                        ? 'bg-brand-primary text-text-inverse font-bold shadow-sm'
                        : cell.isPast
                        ? 'font-medium text-text-tertiary'
                        : 'font-semibold text-text-primary'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {dayEvents.length > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-pill inline-flex items-center gap-1 ${
                        cell.isPast
                          ? 'text-text-secondary bg-surface-secondary border border-border-subtle'
                          : 'text-text-inverse bg-brand-primary shadow-sm'
                      }`}
                    >
                      {cell.isPast && <Check className="w-2.5 h-2.5" strokeWidth={2.5} />}
                      <span>
                        {dayEvents.length} {dayEvents.length > 1 ? t('shows') : t('show')}
                      </span>
                    </span>
                  )}
                </div>

                {/* Event Bars / Pills — scrollable after 2 cards */}
                <div
                  className="flex flex-col gap-1 overflow-y-auto flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {dayEvents.map((ev) => {
                    const evGroup = groupMap.get(ev.groupId);
                    const evVenue = venueMap.get(ev.hotelId);
                    const startTime = new Date(ev.startDateTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    const effectiveLobby =
                      ev.lobbyTime ||
                      (() => {
                        const d = new Date(ev.startDateTime);
                        const travel = evVenue?.travelTimeMinutes ?? 45;
                        const totalM = (d.getHours() * 60 + d.getMinutes() - travel + 1440) % 1440;
                        return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(
                          totalM % 60
                        ).padStart(2, '0')}`;
                      })();

                    const isEventPast = cell.isPast || new Date(ev.endDateTime).getTime() < Date.now();

                    return (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev);
                        }}
                        className={`p-1.5 rounded-xs text-[11px] font-semibold leading-tight flex flex-col gap-0.5 shrink-0 border cursor-pointer transition-all duration-150 ${
                          isEventPast
                            ? 'bg-surface-secondary text-text-secondary border-border-medium opacity-85 hover:opacity-100'
                            : 'bg-brand-primary text-text-inverse border-brand-primary-hover shadow-sm hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                        title={`${ev.title}\n${t('group_label')}: ${evGroup?.name || ev.groupId}\n${t('hotel_label')}: ${
                          evVenue?.name || ev.hotelId
                        }\n${t('gathering_label')}: ${effectiveLobby}\n${t('show_time_label')}: ${startTime}${
                          isEventPast ? `\n[${language === 'ka' ? 'დასრულებული' : 'Completed'}]` : ''
                        }`}
                      >
                        {/* Group Name */}
                        <div className="font-bold text-xs truncate flex items-center gap-1">
                          <Users
                            className={`w-3 h-3 shrink-0 ${isEventPast ? 'opacity-65' : 'opacity-100'}`}
                            strokeWidth={2}
                          />
                          <span className="truncate">{evGroup?.name || ev.title}</span>
                        </div>

                        {/* Times: Lobby & Show */}
                        <div
                          className={`flex items-center gap-1.5 text-[10px] font-semibold ${
                            isEventPast ? 'text-text-tertiary' : 'text-white/95'
                          }`}
                        >
                          <span className="inline-flex items-center gap-0.5">
                            <Bus className="w-2.5 h-2.5 shrink-0" strokeWidth={2} />
                            <span>{effectiveLobby}</span>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 shrink-0" strokeWidth={2} />
                            <span>{startTime}</span>
                          </span>
                        </div>

                        {/* Hotel Venue */}
                        {evVenue && (
                          <div
                            className={`text-[10px] font-medium truncate flex items-center gap-1 ${
                              isEventPast ? 'text-text-tertiary' : 'text-white/85'
                            }`}
                          >
                            <Building className="w-2.5 h-2.5 shrink-0" strokeWidth={2} />
                            <span className="truncate">{evVenue.name}</span>
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
