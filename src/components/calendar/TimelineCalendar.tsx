import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { CalendarViewMode, ShowEvent } from '../../types/schedule';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { YearView } from './YearView';
import { ScheduleModal } from './ScheduleModal';
import { EventDetailModal } from './EventDetailModal';
import { toLocalDateStr } from '../../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Users,
  Building2
} from 'lucide-react';

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
        return `${startOfWeek.getDate()} ${startOfWeek.toLocaleDateString(localeStr, { month: 'short' })} ${startOfWeek.getFullYear()} - ${endOfWeek.getDate()} ${endOfWeek.toLocaleDateString(localeStr, { month: 'short' })} ${endOfWeek.getFullYear()}`;
      }
    }
    return currentDate.toLocaleDateString(localeStr, { month: 'long', year: 'numeric' });
  };

  const displayDateLabel = getDisplayDateLabel();

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>
            {t('timeline_title')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {t('timeline_subtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            setScheduleDefaultDate(undefined);
            setIsScheduleModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('book_and_schedule')}</span>
        </button>
      </div>

      {/* Control Bar: View Switcher, Date Navigator, Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '10px 16px',
          background: 'var(--bg-surface-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          minHeight: '56px'
        }}
      >
        {/* Left: Month Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 0', minWidth: '340px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <button
              onClick={handlePrev}
              className="btn btn-secondary btn-icon"
              style={{ width: '32px', height: '32px' }}
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              className="btn btn-secondary btn-icon"
              style={{ width: '32px', height: '32px' }}
              title="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '5px 12px', flexShrink: 0 }}
          >
            {t('today')}
          </button>

          <div style={{ minWidth: '220px', display: 'inline-flex', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--color-charcoal)',
                marginLeft: '6px',
                whiteSpace: 'nowrap',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {displayDateLabel}
            </span>
          </div>
        </div>

        {/* Center: View Switcher Pills (Day, Week, Month, Year) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            flexShrink: 0
          }}
        >
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
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '6px 16px',
                  minWidth: '68px',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 650 : 500,
                  cursor: 'pointer',
                  background: isActive ? 'var(--brand-primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  boxShadow: isActive ? '0 2px 8px var(--brand-primary-glow)' : 'none',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--color-charcoal)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                {labelMap[mode]}
              </button>
            );
          })}
        </div>

        {/* Right: Filters (Group and Hotel) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 0', justifyContent: 'flex-end', minWidth: '320px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} color="var(--color-text-secondary)" />

            {/* Filter by Group */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Users
                size={13}
                style={{
                  position: 'absolute',
                  left: '10px',
                  color: 'var(--color-text-secondary)',
                  pointerEvents: 'none'
                }}
              />
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                  padding: '6px 14px 6px 30px',
                  borderRadius: 'var(--radius-pill)',
                  border: selectedGroupId !== 'ALL' ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  background: selectedGroupId !== 'ALL' ? 'var(--brand-primary-light)' : 'var(--bg-surface)',
                  color: 'var(--color-text-primary)',
                  fontWeight: selectedGroupId !== 'ALL' ? 600 : 400,
                  outline: 'none',
                  cursor: 'pointer'
                }}
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Building2
                size={13}
                style={{
                  position: 'absolute',
                  left: '10px',
                  color: 'var(--color-text-secondary)',
                  pointerEvents: 'none'
                }}
              />
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                  padding: '6px 14px 6px 30px',
                  borderRadius: 'var(--radius-pill)',
                  border: selectedHotelId !== 'ALL' ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  background: selectedHotelId !== 'ALL' ? 'var(--brand-primary-light)' : 'var(--bg-surface)',
                  color: 'var(--color-text-primary)',
                  fontWeight: selectedHotelId !== 'ALL' ? 600 : 400,
                  outline: 'none',
                  cursor: 'pointer'
                }}
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
      <div key={viewMode} style={{ minHeight: '500px', animation: 'fadeIn 0.2s ease-out' }}>
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
