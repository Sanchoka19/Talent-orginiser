'use client';

import React, { useState, useEffect } from 'react';
import { ShowEvent } from '../../types/schedule';
import { Group } from '../../types/group';
import { HotelVenue } from '../../types/venue';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { Check, X, CalendarDays } from 'lucide-react';

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
  const { formatTime } = useApp();
  const isKa = language === 'ka';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // State to track if the "+ კიდევ X" Popover modal is open for a specific date
  const [popoverDate, setPopoverDate] = useState<string | null>(null);

  // Close popover on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopoverDate(null);
    };
    if (popoverDate) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [popoverDate]);

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

  // Helper to format popover header title (e.g. „26 სექტემბერი — 4 შოუ“)
  const formatPopoverTitle = (dateStr: string, count: number) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formattedDay = dateObj.toLocaleDateString(isKa ? 'ka-GE' : 'en-US', {
      day: 'numeric',
      month: 'long'
    });
    return `${formattedDay} — ${count} ${isKa ? 'შოუ' : count > 1 ? 'shows' : 'show'}`;
  };

  // Reusable compact 2-line event card
  const renderEventCard = (ev: ShowEvent, isCellPast: boolean, inPopover = false) => {
    const evGroup = groupMap.get(ev.groupId);
    const evVenue = venueMap.get(ev.hotelId);
    const startTime = formatTime(ev.startDateTime);
    const isEventPast = isCellPast || new Date(ev.endDateTime || ev.startDateTime).getTime() < Date.now();
    const groupName = evGroup?.name || ev.title;

    return (
      <div
        key={ev.id}
        onClick={(e) => {
          e.stopPropagation();
          if (inPopover) setPopoverDate(null);
          onSelectEvent(ev);
        }}
        className={`px-2.5 py-2 rounded-r-md border border-l-4 text-xs leading-tight flex flex-col gap-1 shrink-0 cursor-pointer transition-all duration-150 group ${
          isEventPast
            ? 'bg-slate-100 dark:bg-surface-secondary border-border-subtle border-l-slate-400 dark:border-l-slate-500 opacity-80 hover:opacity-100 text-text-secondary'
            : 'bg-brand-primary/10 dark:bg-blue-500/15 border-blue-500/20 dark:border-blue-500/30 border-l-brand-primary hover:bg-brand-primary/15 text-text-primary shadow-2xs hover:shadow-xs'
        }`}
        title={`${ev.title}\n${t('group_label')}: ${groupName}\n${t('hotel_label')}: ${
          evVenue?.name || ev.hotelId
        }\n${t('show_time_label')}: ${startTime}${
          isEventPast ? `\n[${isKa ? 'დასრულებული' : 'Completed'}]` : ''
        }`}
      >
        {/* Line 1: Time (text-xs, bold) + Status Indicator */}
        {isEventPast ? (
          <div className="flex items-center gap-1.5 text-xs leading-none">
            <span className="inline-flex items-center gap-1 font-bold text-text-secondary">
              <Check size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
              <span>{startTime}</span>
            </span>
            <span className="text-text-tertiary">•</span>
            <span className="text-[11px] font-medium text-text-tertiary">
              {isKa ? 'დასრ.' : 'Past'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs leading-none">
            <span className="font-bold text-brand-primary dark:text-blue-400">
              {startTime}
            </span>
            <span className="text-text-tertiary">•</span>
            <span className="text-[11px] font-semibold text-brand-primary dark:text-blue-300">
              {isKa ? 'შოუ' : 'Show'}
            </span>
          </div>
        )}

        {/* Line 2: Troupe / Group Name (text-[13px], font-semibold, clear contrast) */}
        <div
          className={`truncate text-[13px] font-semibold leading-snug ${
            isEventPast
              ? 'text-slate-600 dark:text-slate-300'
              : 'text-slate-800 dark:text-slate-100 group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors'
          }`}
        >
          {groupName}
        </div>
      </div>
    );
  };

  // Events for active popover date
  const popoverEvents = popoverDate
    ? events.filter((ev) => ev.startDateTime.startsWith(popoverDate))
    : [];

  return (
    <div className="w-full overflow-x-auto pb-2 relative">
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
        <div className="grid grid-cols-7 auto-rows-[minmax(145px,auto)]">
          {calendarCells.map((cell, idx) => {
            // Find events on this date
            const dayEvents = events.filter((ev) => ev.startDateTime.startsWith(cell.dateStr));
            const isLastInRow = (idx + 1) % 7 === 0;
            const isBottomRow = idx >= 35;

            // Maximum 2 cards in cell
            const visibleEvents = dayEvents.slice(0, 2);
            const remainingCount = dayEvents.length - 2;

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

                {/* Event Bars / Pills — Max 2 items + '+ კიდევ X' button */}
                <div
                  className="flex flex-col gap-1 flex-1 min-h-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {visibleEvents.map((ev) => renderEventCard(ev, cell.isPast))}

                  {/* + კიდევ X შოუ badge/button */}
                  {remainingCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopoverDate(cell.dateStr);
                      }}
                      className="w-full text-center py-1 px-1.5 rounded-md bg-surface-secondary/90 hover:bg-brand-primary/10 border border-border-subtle hover:border-brand-primary/30 text-[10px] font-bold text-brand-primary dark:text-blue-400 transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 mt-auto shadow-2xs hover:scale-[1.01] active:scale-95"
                    >
                      <span>
                        {isKa ? `+ კიდევ ${remainingCount} შოუ` : `+${remainingCount} more`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          Popover Modal (Variant A: Shows all events on clicking '+ კიდევ X')
         ────────────────────────────────────────────────────────────────── */}
      {popoverDate && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-surface-overlay/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPopoverDate(null)}
        >
          <div
            className="bg-surface border border-border-subtle rounded-2xl shadow-modal w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popover Header */}
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-secondary/50">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-brand-primary" />
                <h4 className="text-sm font-bold text-text-primary m-0">
                  {formatPopoverTitle(popoverDate, popoverEvents.length)}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPopoverDate(null)}
                aria-label="Close"
                className="w-7 h-7 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border-subtle transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Popover Scrollable Shows List */}
            <div className="p-3 flex flex-col gap-2 max-h-[380px] overflow-y-auto">
              {popoverEvents.map((ev) => {
                const [y, m, d] = popoverDate.split('-').map(Number);
                const isCellPast = new Date(y, m - 1, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return renderEventCard(ev, isCellPast, true);
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
