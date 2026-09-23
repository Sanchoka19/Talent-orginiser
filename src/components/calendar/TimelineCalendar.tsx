'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { CalendarViewMode, ShowEvent } from '../../types/schedule';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { YearView } from './YearView';
import { toLocalDateStr } from '../../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Users,
  Building2
} from 'lucide-react';

const ScheduleModal = dynamic(
  () => import('./ScheduleModal').then((mod) => mod.ScheduleModal),
  { ssr: false }
);

const EventDetailModal = dynamic(
  () => import('./EventDetailModal').then((mod) => mod.EventDetailModal),
  { ssr: false }
);

interface TimelineCalendarProps {
  onOpenNewSchedule?: () => void;
}

export const TimelineCalendar: React.FC<TimelineCalendarProps> = () => {
  const { schedule, groups, venues, talents } = useApp();
  const { language, t } = useLanguage();

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 22)); // Sept 22, 2026
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');
  const [selectedHotelId, setSelectedHotelId] = useState<string>('ALL');

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ShowEvent | null>(null);
  const [scheduleDefaultDate, setScheduleDefaultDate] = useState<string | undefined>();

  // Filtered Events
  const filteredEvents = schedule.filter((ev) => {
    if (ev.status === 'Cancelled') return false;
    const matchGroup = selectedGroupId === 'ALL' || ev.groupId === selectedGroupId;
    const matchHotel = selectedHotelId === 'ALL' || ev.hotelId === selectedHotelId;
    return matchGroup && matchHotel;
  });

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'year') {
        d.setFullYear(d.getFullYear() - 1);
      } else if (viewMode === 'month') {
        d.setMonth(d.getMonth() - 1);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() - 7);
      } else {
        d.setDate(d.getDate() - 1);
      }
      return d;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'year') {
        d.setFullYear(d.getFullYear() + 1);
      } else if (viewMode === 'month') {
        d.setMonth(d.getMonth() + 1);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setDate(d.getDate() + 1);
      }
      return d;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 22)); // Default anchor date
  };

  const handleSelectDate = (dateStr: string) => {
    setScheduleDefaultDate(dateStr);
    setIsScheduleModalOpen(true);
  };

  const isKa = language === 'ka';
  const localeStr = isKa ? 'ka-GE' : 'en-US';

  const getDisplayDateLabel = () => {
    if (viewMode === 'year') {
      return isKa ? `${currentDate.getFullYear()} წელი` : `${currentDate.getFullYear()}`;
    }
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString(localeStr, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    if (viewMode === 'week') {
      const d = new Date(currentDate);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(d);
      startOfWeek.setDate(diff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const sameMonth = startOfWeek.getMonth() === endOfWeek.getMonth();
      const sameYear = startOfWeek.getFullYear() === endOfWeek.getFullYear();

      if (sameMonth && sameYear) {
        const monthName = startOfWeek.toLocaleDateString(localeStr, { month: 'short' });
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${monthName}, ${startOfWeek.getFullYear()}`;
      } else if (sameYear) {
        const startMonth = startOfWeek.toLocaleDateString(localeStr, { month: 'short' });
        const endMonth = endOfWeek.toLocaleDateString(localeStr, { month: 'short' });
        return `${startOfWeek.getDate()} ${startMonth} - ${endOfWeek.getDate()} ${endMonth}, ${startOfWeek.getFullYear()}`;
      } else {
        return `${startOfWeek.getDate()} ${startOfWeek.toLocaleDateString(
          localeStr,
          { month: 'short' }
        )} ${startOfWeek.getFullYear()} - ${endOfWeek.getDate()} ${endOfWeek.toLocaleDateString(
          localeStr,
          { month: 'short' }
        )} ${endOfWeek.getFullYear()}`;
      }
    }
    return currentDate.toLocaleDateString(localeStr, { month: 'long', year: 'numeric' });
  };

  const displayDateLabel = getDisplayDateLabel();

  return (
    <div className="flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mb-1">
            {t('timeline_title')}
          </h1>
          <p className="text-sm text-text-secondary">
            {t('timeline_subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setScheduleDefaultDate(undefined);
            setIsScheduleModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-pill text-sm font-medium bg-brand-primary text-text-inverse shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>{t('book_and_schedule')}</span>
        </button>
      </div>

      {/* Control Bar: View Switcher, Date Navigator, Filters */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3.5 px-4 py-2.5 bg-surface-secondary rounded-md border border-border-subtle min-h-[56px]">
        {/* Left: Month Navigator */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[320px]">
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              className="w-8 h-8 rounded-full border border-border-subtle bg-surface text-text-primary hover:bg-surface-tertiary hover:border-border-medium flex items-center justify-center transition-all duration-150 cursor-pointer outline-none"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-8 h-8 rounded-full border border-border-subtle bg-surface text-text-primary hover:bg-surface-tertiary hover:border-border-medium flex items-center justify-center transition-all duration-150 cursor-pointer outline-none"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleToday}
            className="text-xs px-3 py-1.5 rounded-pill border border-border-subtle bg-surface text-text-primary hover:bg-surface-tertiary hover:border-border-medium font-medium transition-all duration-150 cursor-pointer outline-none shrink-0"
          >
            {t('today')}
          </button>

          <div className="min-w-[200px] inline-flex items-center">
            <span className="text-base sm:text-lg font-bold text-text-primary ml-1.5 whitespace-nowrap tabular-nums">
              {displayDateLabel}
            </span>
          </div>
        </div>

        {/* Center: View Switcher Pills (Day, Week, Month, Year) */}
        <div className="inline-flex items-center bg-surface rounded-pill p-1 border border-border-subtle shadow-sm shrink-0">
          {(['day', 'week', 'month', 'year'] as CalendarViewMode[]).map((mode) => {
            const isActive = viewMode === mode;
            const labelMap: Record<CalendarViewMode, string> = {
              day: t('view_day'),
              week: t('view_week'),
              month: t('view_month'),
              year: t('view_year')
            };

            return (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 min-w-[64px] text-center rounded-pill text-xs font-semibold cursor-pointer transition-all duration-150 outline-none ${
                  isActive
                    ? 'bg-brand-primary text-text-inverse shadow-sm'
                    : 'bg-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {labelMap[mode]}
              </button>
            );
          })}
        </div>

        {/* Right: Filters (Group and Hotel) */}
        <div className="flex items-center gap-2.5 flex-1 justify-end min-w-[300px] flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-text-secondary shrink-0" />

            {/* Filter by Group */}
            <div className="relative flex items-center">
              <Users className="w-3.5 h-3.5 absolute left-3 text-text-secondary pointer-events-none" />
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className={`text-xs py-1.5 pl-8 pr-3.5 rounded-pill outline-none cursor-pointer transition-all duration-150 ${
                  selectedGroupId !== 'ALL'
                    ? 'border border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold'
                    : 'border border-border-subtle bg-surface text-text-primary font-normal hover:border-border-medium'
                }`}
              >
                <option value="ALL">{t('all_groups')}</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Hotel Venue */}
            <div className="relative flex items-center">
              <Building2 className="w-3.5 h-3.5 absolute left-3 text-text-secondary pointer-events-none" />
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                className={`text-xs py-1.5 pl-8 pr-3.5 rounded-pill outline-none cursor-pointer transition-all duration-150 ${
                  selectedHotelId !== 'ALL'
                    ? 'border border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold'
                    : 'border border-border-subtle bg-surface text-text-primary font-normal hover:border-border-medium'
                }`}
              >
                <option value="ALL">{t('all_venues')}</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      <div key={viewMode} className="min-h-[500px]">
        {viewMode === 'day' && (
          <DayView
            currentDate={currentDate}
            events={filteredEvents}
            groups={groups}
            venues={venues}
            talents={talents}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            onOpenSchedule={() => {
              setScheduleDefaultDate(toLocalDateStr(currentDate));
              setIsScheduleModalOpen(true);
            }}
          />
        )}

        {viewMode === 'week' && (
          <WeekView
            currentDate={currentDate}
            events={filteredEvents}
            groups={groups}
            venues={venues}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            onSelectDate={handleSelectDate}
          />
        )}

        {viewMode === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={filteredEvents}
            groups={groups}
            venues={venues}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            onSelectDate={handleSelectDate}
          />
        )}

        {viewMode === 'year' && (
          <YearView
            currentDate={currentDate}
            events={filteredEvents}
            groups={groups}
            venues={venues}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            onSelectMonth={(mIdx) => {
              const newD = new Date(currentDate);
              newD.setDate(1);
              newD.setMonth(mIdx);
              setCurrentDate(newD);
              setViewMode('month');
            }}
          />
        )}
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        defaultDate={scheduleDefaultDate}
      />

      {/* Event Details & Duty Crew Modal */}
      <EventDetailModal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />
    </div>
  );
};
